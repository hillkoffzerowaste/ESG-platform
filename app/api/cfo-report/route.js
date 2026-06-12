import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { calculateCFO } from "@/lib/cfoCalculator";

function round(v, d = 2) {
  const n = Number(v);
  return Number.isFinite(n) ? Number(n.toFixed(d)) : 0;
}

export async function POST(req) {
  try {
    const entry = await req.json();
    const result = calculateCFO(entry);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Hillkoff CFO Platform";
    workbook.created = new Date();

    // ─── Sheet 1: Fr-01 Org Info ────────────────────────────
    const ws1 = workbook.addWorksheet("Fr-01 ข้อมูลองค์กร");
    ws1.columns = [{ header: "รายการ", key: "item", width: 35 }, { header: "รายละเอียด", key: "detail", width: 50 }];
    ws1.mergeCells("A1:B1");
    ws1.getCell("A1").value = "Fr-01: ข้อมูลทั่วไปขององค์กร";
    ws1.getCell("A1").font = { bold: true, size: 16, color: { argb: "FF1A5632" } };

    const orgData = [
      ["ชื่อองค์กร", entry.orgInfo?.orgName || "-"],
      ["ปีที่รายงาน (พ.ศ.)", entry.reportingYear || "-"],
      ["ปีฐาน (Base Year)", entry.baseYear || "2561"],
      ["ผู้รับผิดชอบ", entry.orgInfo?.responsiblePerson || "-"],
      ["อีเมล", entry.orgInfo?.responsibleEmail || "-"],
      ["วิธีการกำหนดขอบเขต", entry.orgInfo?.boundaryMethod === "control" ? "Control Approach" : "Equity Share"],
      ["Emission Factor", "TGO AR5 V2 / IPCC 2006 / AR6"],
    ];
    orgData.forEach((r, i) => {
      ws1.getRow(i + 3).values = r;
    });

    // ─── Sheet 2: Fr-03.1 Stationary ────────────────────────
    const ws2 = workbook.addWorksheet("Fr-03.1 Stationary");
    ws2.columns = [
      { header: "เชื้อเพลิง", key: "name", width: 30 },
      { header: "ปริมาณ", key: "qty", width: 12 },
      { header: "หน่วย", key: "unit", width: 8 },
      { header: "EF", key: "ef", width: 12 },
      { header: "kgCO₂e", key: "co2", width: 14 },
      { header: "Biogenic", key: "bio", width: 10 },
    ];
    ws2.mergeCells("A1:F1");
    ws2.getCell("A1").value = "Fr-03.1: Stationary Combustion";
    ws2.getCell("A1").font = { bold: true, size: 16, color: { argb: "FF1A5632" } };

    const hRow2 = ws2.getRow(3);
    ["เชื้อเพลิง", "ปริมาณ", "หน่วย", "EF", "kgCO₂e", "Biogenic"].forEach((h, i) => {
      hRow2.getCell(i + 1).value = h;
      hRow2.getCell(i + 1).font = { bold: true, color: { argb: "FFFFFFFF" } };
      hRow2.getCell(i + 1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1A5632" } };
    });

    (result?.scope1?.stationary?.details || []).forEach((d, i) => {
      ws2.getRow(4 + i).values = [d.name, d.quantity, d.unit, d.ef, round(d.co2_kg), d.isBiogenic ? "ใช่" : ""];
    });

    // ─── Sheet 3: Fr-03.2 Mobile ────────────────────────────
    const ws3 = workbook.addWorksheet("Fr-03.2 Mobile");
    ws3.columns = [
      { header: "ประเภทยานพาหนะ", key: "name", width: 30 },
      { header: "ระยะทาง (กม.)", key: "km", width: 15 },
      { header: "เชื้อเพลิง (ลิตร)", key: "fuel", width: 15 },
      { header: "EF", key: "ef", width: 12 },
      { header: "kgCO₂e", key: "co2", width: 14 },
    ];
    ws3.mergeCells("A1:E1");
    ws3.getCell("A1").value = "Fr-03.2: Mobile Combustion + Fugitive";
    ws3.getCell("A1").font = { bold: true, size: 16, color: { argb: "FF1A5632" } };

    const hRow3 = ws3.getRow(3);
    ["ประเภทยานพาหนะ", "ระยะทาง (กม.)", "เชื้อเพลิง (ลิตร)", "EF", "kgCO₂e"].forEach((h, i) => {
      hRow3.getCell(i + 1).value = h;
      hRow3.getCell(i + 1).font = { bold: true, color: { argb: "FFFFFFFF" } };
      hRow3.getCell(i + 1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1A5632" } };
    });

    (result?.scope1?.mobile?.details || []).forEach((d, i) => {
      ws3.getRow(4 + i).values = [d.name, d.distanceKm || "-", d.fuelQuantity || "-", d.ef, round(d.co2_kg)];
    });

    // ─── Sheet 4: Fr-04.1 Electricity ────────────────────────
    const ws4 = workbook.addWorksheet("Fr-04.1 Electricity");
    ws4.columns = [{ header: "เดือน", key: "m", width: 12 }, { header: "kWh", key: "kwh", width: 14 }, { header: "kgCO₂e", key: "co2", width: 14 }];
    ws4.mergeCells("A1:C1");
    ws4.getCell("A1").value = `Fr-04.1: Purchased Electricity (${entry?.purchasedElectricity?.gridArea || "MEA"})`;
    ws4.getCell("A1").font = { bold: true, size: 16, color: { argb: "FF1A5632" } };

    const hRow4 = ws4.getRow(3);
    ["เดือน", "kWh", "kgCO₂e"].forEach((h, i) => { hRow4.getCell(i + 1).value = h; });
    const months = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
    (entry?.purchasedElectricity?.monthlyKwh || Array(12).fill(0)).forEach((kwh, i) => {
      ws4.getRow(4 + i).values = [months[i], Number(kwh) || 0, round(Number(kwh) * 0.4999)];
    });

    // ─── Sheet 5: Fr-05 Waste ───────────────────────────────
    const ws5 = workbook.addWorksheet("Fr-05 Waste+Wastewater");
    ws5.columns = [{ header: "ประเภท", key: "name", width: 25 }, { header: "ปริมาณ", key: "qty", width: 12 }, { header: "EF", key: "ef", width: 12 }, { header: "kgCO₂e", key: "co2", width: 14 }];
    ws5.mergeCells("A1:D1");
    ws5.getCell("A1").value = "Fr-05: Waste & Wastewater";
    ws5.getCell("A1").font = { bold: true, size: 16, color: { argb: "FF1A5632" } };

    const hRow5 = ws5.getRow(3);
    ["ประเภท", "ปริมาณ (กก.)", "EF", "kgCO₂e"].forEach((h, i) => { hRow5.getCell(i + 1).value = h; });
    (result?.scope3?.waste?.details || []).forEach((d, i) => {
      ws5.getRow(4 + i).values = [d.name, d.quantity, d.ef, round(d.co2_kg)];
    });

    // ─── Sheet 6: Fr-06 Summary ──────────────────────────────
    const ws6 = workbook.addWorksheet("Fr-06 Summary");
    ws6.columns = [{ header: "แหล่งปล่อย", key: "src", width: 30 }, { header: "kgCO₂e", key: "co2", width: 14 }, { header: "tCO₂e", key: "tco2", width: 12 }];
    ws6.mergeCells("A1:C1");
    ws6.getCell("A1").value = "Fr-06: สรุป GHG Emission";
    ws6.getCell("A1").font = { bold: true, size: 16, color: { argb: "FF1A5632" } };

    const hRow6 = ws6.getRow(3);
    ["แหล่งปล่อย", "kgCO₂e", "tCO₂e"].forEach((h, i) => { hRow6.getCell(i + 1).value = h; });
    const summaryData = [
      ["Scope 1 Total", round(result?.scope1?.total || 0), round(result?.scope1?.totalTonne || 0)],
      ["  Stationary", round(result?.scope1?.stationary?.total || 0), round((result?.scope1?.stationary?.total || 0) * 0.001)],
      ["  Mobile", round(result?.scope1?.mobile?.total || 0), round((result?.scope1?.mobile?.total || 0) * 0.001)],
      ["  Fugitive", round(result?.scope1?.fugitive?.total || 0), round((result?.scope1?.fugitive?.total || 0) * 0.001)],
      ["Scope 2 - Electricity", round(result?.scope2?.total || 0), round((result?.scope2?.total || 0) * 0.001)],
      ["Scope 3 Total", round(result?.scope3?.total || 0), round(result?.scope3?.totalTonne || 0)],
      ["  Waste", round(result?.scope3?.waste?.total || 0), round((result?.scope3?.waste?.total || 0) * 0.001)],
      ["  Wastewater", round(result?.scope3?.wastewater?.total || 0), round((result?.scope3?.wastewater?.total || 0) * 0.001)],
      ["", "", ""],
      ["TOTAL", round(result?.total?.kgCO2e || 0), round(result?.total?.tCO2e || 0)],
    ];
    if (result?.biogenic?.total > 0) {
      summaryData.push(["Biogenic CO₂ (แยก)", round(result.biogenic.total), round(result.biogenic.totalTonne)]);
    }
    summaryData.forEach((r, i) => {
      ws6.getRow(4 + i).values = r;
    });

    // ─── Sheet 7: Net Zero ─────────────────────────────────
    const ws7 = workbook.addWorksheet("Net Zero");
    ws7.columns = [{ header: "หัวข้อ", key: "t", width: 30 }, { header: "รายละเอียด", key: "d", width: 40 }];
    ws7.mergeCells("A1:B1");
    ws7.getCell("A1").value = "Net Zero Progress";
    ws7.getCell("A1").font = { bold: true, size: 16, color: { argb: "FF1A5632" } };

    const nzData = [
      ["ปีฐาน (Base Year)", String(entry?.baseYear || "2561 (2018)")],
      ["เป้าหมายระยะสั้น", "ลด 50% ภายใน 2573 (2030)"],
      ["เป้าหมาย Net Zero", "ลด 100% ภายใน 2593 (2050)"],
      ["EF Source", "TGO AR5 V2 / IPCC 2006 / AR6"],
      ["Methodology", "GHG Protocol Corporate Standard"],
    ];
    nzData.forEach((r, i) => { ws7.getRow(3 + i).values = r; });

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="hillkoff-cfo-${entry.reportingYear || "report"}.xlsx"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}