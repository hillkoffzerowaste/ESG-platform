import ExcelJS from "exceljs";
import { PDFParse } from "pdf-parse";

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
    let analysis;

    if (ext === "csv") {
      analysis = summarizeRows(parseCsv(buffer.toString("utf8")));
    } else if (ext === "xlsx") {
      analysis = summarizeRows(await parseXlsx(buffer));
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
