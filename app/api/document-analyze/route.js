import ExcelJS from "exceljs";
import { PDFParse } from "pdf-parse";
import { parseTGOSheet } from "@/lib/cfoImport";

const MAX_PREVIEW_CHARS = 6000;

function parseNumber(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (!value) return 0;
  const cleaned = String(value).replace(/,/g, "").match(/-?\d+(\.\d+)?/);
  return cleaned ? Number(cleaned[0]) : 0;
}

function classifyMetric(label) {
  const text = String(label || "").toLowerCase();
  if (/(electric|ไฟ|kwh|หน่วยไฟ|energy)/i.test(text)) return "elec";
  if (/(water|น้ำ|m3|m³|ประปา)/i.test(text)) return "water";
  if (/(fuel|diesel|gasoline|น้ำมัน|เชื้อเพลิง|ลิตร)/i.test(text)) return "fuel";
  if (/(recycle|รีไซเคิล)/i.test(text)) return "wRec";
  if (/(organic|compost|เศษอาหาร|อินทรีย์|กาแฟ)/i.test(text)) return "wOrg";
  if (/(hazard|chemical|battery|อันตราย|เคมี|แบต)/i.test(text)) return "wHaz";
  if (/(waste|ขยะ|landfill|ทั่วไป)/i.test(text)) return "wGen";
  if (/(material|วัสดุ|packaging|บรรจุภัณฑ์)/i.test(text)) return "matQty";
  return null;
}

function summarizeRows(rows) {
  const metrics = { elec: 0, water: 0, fuel: 0, wGen: 0, wRec: 0, wOrg: 0, wHaz: 0, matCount: 0, matQty: 0 };
  const evidence = [];

  rows.forEach((row, index) => {
    const cells = row.map(cell => String(cell ?? "").trim()).filter(Boolean);
    if (cells.length === 0) return;
    const joined = cells.join(" | ");

    cells.forEach((cell, cellIndex) => {
      const metric = classifyMetric(cell);
      if (!metric) return;
      const value = cells.slice(cellIndex + 1).map(parseNumber).find(number => number > 0) || 0;
      if (!value) return;
      metrics[metric] += value;
      if (metric === "matQty") metrics.matCount += 1;
      evidence.push({ metric, value, row: index + 1, text: joined.slice(0, 260) });
    });
  });

  return {
    metrics: Object.fromEntries(Object.entries(metrics).map(([key, value]) => [key, Number(value.toFixed(4))])),
    evidence: evidence.slice(0, 30),
    preview: rows.map(row => row.join(" | ")).join("\n").slice(0, MAX_PREVIEW_CHARS)
  };
}

function parseCsv(text) {
  return text
    .split(/\r?\n/)
    .map(line => line.split(",").map(cell => cell.trim()))
    .filter(row => row.some(Boolean));
}

async function parseXlsx(buffer) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  const rows = [];
  workbook.eachSheet(sheet => {
    sheet.eachRow(row => {
      rows.push(row.values.slice(1).map(value => value?.text || value?.result || value || ""));
    });
  });
  return rows;
}

function parseTextMetrics(text) {
  const rows = text.split(/\r?\n/).map(line => [line.trim()]).filter(row => row[0]);
  return summarizeRows(rows);
}

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || typeof file.arrayBuffer !== "function") {
      return Response.json({ error: "Missing file" }, { status: 400 });
    }

    const ext = file.name.split(".").pop().toLowerCase();
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // ─── If .xlsx, try parsing as TGO Template FIRST ─────────────
    if (ext === "xlsx" || ext === "xls") {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);
      
      // Get sheet names
      const sheetNames = [];
      workbook.eachSheet(sheet => {
        sheetNames.push(sheet.name);
      });

      // Check if any sheet name matches TGO form (Fr-01, Fr-03.1, Fr-04.1, Fr-05)
      const tgoSheetFound = sheetNames.some(name => 
        /fr-0[1-5]|stationary|electricity|waste/i.test(name)
      );

      if (tgoSheetFound) {
        // Parse each sheet using TGO import
        const parsedSheets = [];
        
        for (const sheetName of sheetNames) {
          const ws = workbook.getWorksheet(sheetName);
          const sheetRows = [];
          ws.eachRow(row => {
            sheetRows.push(row.values.slice(1).map(v => v?.text || v?.result || v || ""));
          });

          try {
            const result = parseTGOSheet(sheetRows);
            if (result && result.data) {
              parsedSheets.push({
                sheetName: sheetName,
                type: result.type,
                data: result.data,
                rowCount: sheetRows.length
              });
            }
          } catch (e) {
            // Skip sheets that don't parse
          }
        }

        if (parsedSheets.length > 0) {
          return Response.json({
            success: true,
            fileName: file.name,
            ext,
            source: "tgo_template",
            tgoDetected: true,
            sheets: parsedSheets,
            preview: parsedSheets.map(s => 
              `📋 ${s.sheetName} (${s.type}): ${Array.isArray(s.data) ? s.data.length + ' รายการ' : 'พบข้อมูล'}`
            ).join("\n")
          });
        }
      }

      // Fallback: try automatic detection on all data
      const allRows = [];
      workbook.eachSheet(sheet => {
        sheet.eachRow(row => {
          allRows.push(row.values.slice(1).map(v => v?.text || v?.result || v || ""));
        });
      });
      
      const tgoResult = parseTGOSheet(allRows);
      if (tgoResult && tgoResult.data) {
        return Response.json({
          success: true,
          fileName: file.name,
          ext,
          source: "tgo_auto",
          tgoDetected: true,
          sheets: [{
            sheetName: "auto",
            type: tgoResult.type,
            data: tgoResult.data,
            rowCount: allRows.length
          }],
          preview: `ตรวจพบข้อมูล ${tgoResult.type} (${Array.isArray(tgoResult.data) ? tgoResult.data.length + ' รายการ' : 'พบข้อมูล'})`
        });
      }

      // Last fallback: use old parser
      const analysis = summarizeRows(allRows);
      return Response.json({
        success: true,
        fileName: file.name,
        ext,
        source: "generic",
        ...analysis
      });
    }

    // ─── CSV / PDF ───────────────────────────────────────────────
    let analysis;
    if (ext === "csv") {
      const rows = parseCsv(buffer.toString("utf8"));
      const tgoResult = parseTGOSheet(rows);
      if (tgoResult && tgoResult.data) {
        return Response.json({
          success: true,
          fileName: file.name,
          ext,
          source: "tgo_csv",
          tgoDetected: true,
          sheets: [{ sheetName: "CSV", type: tgoResult.type, data: tgoResult.data, rowCount: rows.length }],
          preview: `ตรวจพบข้อมูล ${tgoResult.type}`
        });
      }
      analysis = summarizeRows(rows);
    } else if (ext === "pdf") {
      const parser = new PDFParse({ data: buffer });
      const pdfData = await parser.getText();
      await parser.destroy();
      analysis = parseTextMetrics(pdfData.text || "");
    } else {
      return Response.json({ error: "Unsupported file type" }, { status: 400 });
    }

    return Response.json({
      success: true,
      fileName: file.name,
      ext,
      ...analysis
    });
  } catch (error) {
    return Response.json({ error: error.message || "Document analysis failed" }, { status: 500 });
  }
}