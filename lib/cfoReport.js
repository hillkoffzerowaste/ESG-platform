/**
 * CFO Report Generator
 * สร้างรายงาน Carbon Footprint for Organization ในรูปแบบ Excel (.xlsx)
 * ตาม Template ที่ อบก. กำหนด (Fr-01 ถึง Fr-06 + Net Zero)
 *
 * ใช้ exceljs สำหรับสร้างไฟล์ .xlsx
 */

import ExcelJS from 'exceljs';
import { calculateCFO } from './cfoCalculator';
import { COMMON_FUELS, CONVERSION } from './tgoFactors';
import { VEHICLE_CATEGORIES, REFRIGERANT_TYPES } from './cfoForms';

// ─── Helper ────────────────────────────────────────────────────────
function round(v, d = 2) {
  const n = Number(v);
  return Number.isFinite(n) ? Number(n.toFixed(d)) : 0;
}

// ─── Styles ────────────────────────────────────────────────────────
const STYLE = {
  header: { font: { bold: true, size: 14, color: { argb: 'FFFFFFFF' } }, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A5632' } } },
  subHeader: { font: { bold: true, size: 12, color: { argb: 'FF1A5632' } }, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8F5E9' } } },
  title: { font: { bold: true, size: 16, color: { argb: 'FF1A5632' } } },
  total: { font: { bold: true, size: 12, color: { argb: 'FF1A5632' } }, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC8E6C9' } } },
  number: { numFmt: '#,##0.00' },
  numberInt: { numFmt: '#,##0' },
  border: { border: { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } } },
};

function applyStyle(cell, styles) {
  Object.assign(cell, styles);
}

function addHeaderRow(ws, rowNum, values) {
  const row = ws.getRow(rowNum);
  values.forEach((v, i) => {
    const cell = row.getCell(i + 1);
    cell.value = v;
    applyStyle(cell, STYLE.header);
  });
  row.commit();
}

function addSubHeaderRow(ws, rowNum, values) {
  const row = ws.getRow(rowNum);
  values.forEach((v, i) => {
    const cell = row.getCell(i + 1);
    cell.value = v;
    applyStyle(cell, STYLE.subHeader);
  });
  row.commit();
}

function addDataRow(ws, rowNum, values, isNumber = false) {
  const row = ws.getRow(rowNum);
  values.forEach((v, i) => {
    const cell = row.getCell(i + 1);
    cell.value = v ?? '';
    if (isNumber && typeof v === 'number') cell.numFmt = '#,##0.00';
  });
  row.commit();
}

function addTotalRow(ws, rowNum, values) {
  const row = ws.getRow(rowNum);
  values.forEach((v, i) => {
    const cell = row.getCell(i + 1);
    cell.value = v ?? '';
    applyStyle(cell, STYLE.total);
  });
  row.commit();
}

// ─── Sheet 1: Fr-01 Organization Info ─────────────────────────────
function createOrgInfoSheet(ws, entry) {
  ws.columns = [
    { header: 'รายการ', key: 'item', width: 35 },
    { header: 'รายละเอียด', key: 'detail', width: 50 },
  ];

  ws.mergeCells('A1:B1');
  const title = ws.getCell('A1');
  title.value = 'Fr-01: ข้อมูลทั่วไปขององค์กร (Organization Information)';
  applyStyle(title, STYLE.title);

  const data = [
    ['ชื่อองค์กร', entry.orgInfo?.orgName || '-'],
    ['ปีที่รายงาน (พ.ศ.)', entry.reportingYear || '-'],
    ['ปีฐาน (Base Year)', entry.baseYear || '2561'],
    ['วันเริ่มต้นรอบบัญชี', entry.orgInfo?.startDate || '-'],
    ['วันสิ้นสุดรอบบัญชี', entry.orgInfo?.endDate || '-'],
    ['วิธีการกำหนดขอบเขต', entry.orgInfo?.boundaryMethod === 'control' ? 'Control Approach' : 'Equity Share Approach'],
    ['ผู้รับผิดชอบข้อมูล', entry.orgInfo?.responsiblePerson || '-'],
    ['อีเมลผู้ติดต่อ', entry.orgInfo?.responsibleEmail || '-'],
    ['โทรศัพท์', entry.orgInfo?.responsiblePhone || '-'],
    ['ลักษณะกิจการ', entry.orgInfo?.orgDescription || '-'],
    ['', ''],
    ['เป้าหมาย Net Zero', ''],
    ['  เป้าหมายระยะสั้น (2030)', `ลด ${(entry.netZeroTargets?.shortTerm?.reductionPercent || 50)}%`],
    ['  เป้าหมาย Net Zero (2050)', 'ลด 100%'],
    ['', ''],
    ['Emission Factor Reference', ''],
    ['  แหล่งอ้างอิง', 'TGO AR5 V2 / IPCC 2006 / IPCC AR6'],
    ['  ปีที่อัปเดต', '2024'],
  ];

  data.forEach((row, i) => {
    addDataRow(ws, i + 3, row);
  });
}

// ─── Sheet 2: Fr-03.1 Stationary Combustion ──────────────────────
function createStationarySheet(ws, result) {
  ws.columns = [
    { header: 'ประเภทเชื้อเพลิง', key: 'name', width: 35 },
    { header: 'ปริมาณ', key: 'qty', width: 15 },
    { header: 'หน่วย', key: 'unit', width: 10 },
    { header: 'EF (kgCO2e/unit)', key: 'ef', width: 18 },
    { header: 'kgCO₂e', key: 'co2', width: 15 },
    { header: 'Biogenic?', key: 'biogenic', width: 12 },
    { header: 'แหล่งที่มา', key: 'source', width: 30 },
  ];

  ws.mergeCells('A1:G1');
  const title = ws.getCell('A1');
  title.value = 'Fr-03.1: Stationary Combustion (การเผาไหม้ที่อยู่กับที่)';
  applyStyle(title, STYLE.title);

  addHeaderRow(ws, 3, ['ประเภทเชื้อเพลิง', 'ปริมาณ', 'หน่วย', 'EF', 'kgCO₂e', 'Biogenic', 'แหล่งที่มา']);

  const details = result?.scope1?.stationary?.details || [];
  details.forEach((d, i) => {
    addDataRow(ws, 4 + i, [d.name, d.quantity, d.unit, d.ef, round(d.co2_kg), d.isBiogenic ? 'ใช่' : 'ไม่', d.sourceReference || '-']);
  });

  const totalRow = 4 + details.length;
  addTotalRow(ws, totalRow, ['รวม Stationary', '', '', '', round(result?.scope1?.stationary?.total || 0), '', '']);

  if (result?.biogenic?.stationaryBiogenic > 0) {
    addTotalRow(ws, totalRow + 1, ['รวม Biogenic (แยก)', '', '', '', round(result.biogenic.stationaryBiogenic), 'ใช่', '']);
  }
}

// ─── Sheet 3: Fr-03.2 Mobile + Fugitive ──────────────────────────
function createMobileSheet(ws, result) {
  ws.columns = [
    { header: 'ประเภทยานพาหนะ', key: 'name', width: 35 },
    { header: 'ระยะทาง (กม.)', key: 'km', width: 18 },
    { header: 'เชื้อเพลิง (ลิตร)', key: 'fuel', width: 18 },
    { header: 'EF', key: 'ef', width: 15 },
    { header: 'kgCO₂e', key: 'co2', width: 15 },
    { header: 'แหล่งที่มา', key: 'source', width: 30 },
  ];

  ws.mergeCells('A1:F1');
  const title = ws.getCell('A1');
  title.value = 'Fr-03.2: Mobile Combustion (ยานพาหนะ)';
  applyStyle(title, STYLE.title);

  addHeaderRow(ws, 3, ['ประเภท', 'ระยะทาง (กม.)', 'เชื้อเพลิง (ลิตร)', 'EF', 'kgCO₂e', 'แหล่งที่มา']);

  const details = result?.scope1?.mobile?.details || [];
  details.forEach((d, i) => {
    addDataRow(ws, 4 + i, [d.name, d.distanceKm || '-', d.fuelQuantity || '-', d.ef, round(d.co2_kg), d.sourceReference || '-']);
  });

  const mobileEnd = 4 + details.length;
  addTotalRow(ws, mobileEnd, ['รวม Mobile', '', '', '', round(result?.scope1?.mobile?.total || 0), '']);

  // Fugitive section
  const fugitiveStart = mobileEnd + 2;
  addSubHeaderRow(ws, fugitiveStart, ['สารทำความเย็น (Fugitive Emissions)']);
  addHeaderRow(ws, fugitiveStart + 1, ['ประเภท', 'ปริมาณ (กก.)', 'GWP100', 'kgCO₂e', 'แหล่งที่มา']);

  const fugDetails = result?.scope1?.fugitive?.details || [];
  fugDetails.forEach((d, i) => {
    addDataRow(ws, fugitiveStart + 2 + i, [d.name, d.quantity, d.gwp || '-', round(d.co2_kg), d.sourceReference || '-']);
  });

  const fugEnd = fugitiveStart + 2 + fugDetails.length;
  addTotalRow(ws, fugEnd, ['รวม Fugitive', '', '', round(result?.scope1?.fugitive?.total || 0), '']);
}

// ─── Sheet 4: Fr-04.1 Electricity ────────────────────────────────
function createElectricitySheet(ws, result, entry) {
  ws.columns = [
    { header: 'เดือน', key: 'month', width: 15 },
    { header: 'kWh', key: 'kwh', width: 15 },
    { header: 'EF (kgCO2e/kWh)', key: 'ef', width: 20 },
    { header: 'kgCO₂e', key: 'co2', width: 15 },
  ];

  ws.mergeCells('A1:D1');
  const title = ws.getCell('A1');
  title.value = 'Fr-04.1: Purchased Electricity (ไฟฟ้าที่ซื้อมา)';
  applyStyle(title, STYLE.title);

  addHeaderRow(ws, 3, ['เดือน', 'kWh', 'EF', 'kgCO₂e']);

  const monthlyKwh = entry?.purchasedElectricity?.monthlyKwh || Array(12).fill(0);
  const gridArea = entry?.purchasedElectricity?.gridArea || 'MEA';
  const ef = 0.4999;
  const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

  monthlyKwh.forEach((kwh, i) => {
    const co2 = round(Number(kwh) * ef);
    addDataRow(ws, 4 + i, [months[i], Number(kwh) || 0, ef, co2]);
  });

  const totalKwh = monthlyKwh.reduce((a, b) => a + (Number(b) || 0), 0);
  const totalCo2 = round(totalKwh * ef);
  addTotalRow(ws, 16, ['รวม', totalKwh, '', totalCo2]);
  addDataRow(ws, 18, ['พื้นที่ให้บริการ:', gridArea === 'MEA' ? 'การไฟฟ้านครหลวง' : 'การไฟฟ้าส่วนภูมิภาค']);
  addDataRow(ws, 19, [`${result?.scope2?.electricity?.details?.kwh || totalKwh} kWh × 0.4999 = ${result?.scope2?.total || totalCo2} kgCO₂e (${round((result?.scope2?.total || totalCo2) * 0.001, 4)} tCO₂e)`]);
}

// ─── Sheet 5: Fr-05 Waste + Wastewater ──────────────────────────
function createWasteSheet(ws, result) {
  ws.columns = [
    { header: 'ประเภท', key: 'type', width: 30 },
    { header: 'ปริมาณ (กก.)', key: 'qty', width: 18 },
    { header: 'EF (kgCO2e/kg)', key: 'ef', width: 18 },
    { header: 'kgCO₂e', key: 'co2', width: 15 },
  ];

  ws.mergeCells('A1:D1');
  const title = ws.getCell('A1');
  title.value = 'Fr-05: Waste & Wastewater (ขยะและน้ำเสีย)';
  applyStyle(title, STYLE.title);

  addSubHeaderRow(ws, 3, ['ขยะ (Waste Generation)']);
  addHeaderRow(ws, 4, ['ประเภท', 'ปริมาณ (กก.)', 'EF', 'kgCO₂e']);

  const wasteDetails = result?.scope3?.waste?.details || [];
  wasteDetails.forEach((d, i) => {
    addDataRow(ws, 5 + i, [d.name, d.quantity, d.ef, round(d.co2_kg)]);
  });

  const wasteEnd = 5 + wasteDetails.length;
  addTotalRow(ws, wasteEnd, ['รวมขยะ', '', '', round(result?.scope3?.waste?.total || 0)]);

  // Wastewater
  const wwStart = wasteEnd + 2;
  addSubHeaderRow(ws, wwStart, ['น้ำเสีย (Wastewater)']);
  const ww = result?.scope3?.wastewater?.details;
  if (ww) {
    addDataRow(ws, wwStart + 1, ['ปริมาณน้ำเสีย', `${round(ww.volumeM3)} m³`]);
    addDataRow(ws, wwStart + 2, ['วิธีบำบัด', ww.treatmentMethod]);
    addDataRow(ws, wwStart + 3, ['EF', ww.ef]);
    addTotalRow(ws, wwStart + 4, ['รวมน้ำเสีย', '', '', round(result?.scope3?.wastewater?.total || 0)]);
  }
}

// ─── Sheet 6: Fr-06 Summary ─────────────────────────────────────
function createSummarySheet(ws, result, entry) {
  ws.columns = [
    { header: 'แหล่งปล่อย', key: 'source', width: 35 },
    { header: 'Activity', key: 'activity', width: 15 },
    { header: 'ปริมาณ', key: 'qty', width: 15 },
    { header: 'kgCO₂e', key: 'co2', width: 15 },
    { header: 'tCO₂e', key: 'tco2', width: 12 },
    { header: 'หมายเหตุ', key: 'note', width: 20 },
  ];

  ws.mergeCells('A1:F1');
  const title = ws.getCell('A1');
  title.value = 'Fr-06: สรุปผลการคำนวณก๊าซเรือนกระจกขององค์กร';
  applyStyle(title, STYLE.title);

  ws.mergeCells('A2:F2');
  ws.getCell('A2').value = `${entry?.orgInfo?.orgName || 'องค์กร'} • ปี ${entry?.reportingYear || '-'} • หน่วยงานรวม`;
  ws.getCell('A2').font = { italic: true, color: { argb: 'FF6B7280' } };

  addHeaderRow(ws, 4, ['แหล่งปล่อย', 'Activity', 'ปริมาณ', 'kgCO₂e', 'tCO₂e', 'หมายเหตุ']);

  let row = 5;

  // Scope 1
  addSubHeaderRow(ws, row, ['Scope 1: การปล่อยทางตรง']);
  row++;

  const addDetails = (label, details, co2Total) => {
    if (details?.length > 0) {
      details.forEach(d => {
        if (d.sourceReference) {
          addDataRow(ws, row, [label, d.name || d.fuelType, `${d.quantity} ${d.unit}`, round(d.co2_kg), round(d.co2_kg * 0.001), d.sourceReference]);
        } else {
          addDataRow(ws, row, [label, d.name || d.fuelType, `${d.quantity} ${d.unit}`, round(d.co2_kg), round(d.co2_kg * 0.001), '']);
        }
        row++;
      });
    }
    if (co2Total > 0) {
      addTotalRow(ws, row, [`รวม ${label}`, '', '', round(co2Total), round(co2Total * 0.001), '']);
      row++;
    }
  };

  addDetails('Stationary', result?.scope1?.stationary?.details, result?.scope1?.stationary?.total);
  addDetails('Mobile', result?.scope1?.mobile?.details, result?.scope1?.mobile?.total);
  addDetails('Fugitive', result?.scope1?.fugitive?.details, result?.scope1?.fugitive?.total);

  addTotalRow(ws, row, ['รวม Scope 1', '', '', round(result?.scope1?.total || 0), round(result?.scope1?.totalTonne || 0), '']);
  row++;

  // Scope 2
  addSubHeaderRow(ws, row, ['Scope 2: การปล่อยทางอ้อมจากพลังงาน']);
  row++;
  addDataRow(ws, row, ['ไฟฟ้า', result?.scope2?.electricity?.details?.gridArea || 'MEA', `${result?.scope2?.electricity?.details?.kwh || 0} kWh`, round(result?.scope2?.total || 0), round((result?.scope2?.total || 0) * 0.001), '']);
  row++;
  addTotalRow(ws, row, ['รวม Scope 2', '', '', round(result?.scope2?.total || 0), round((result?.scope2?.total || 0) * 0.001), '']);
  row++;

  // Scope 3
  addSubHeaderRow(ws, row, ['Scope 3: การปล่อยทางอ้อมอื่นๆ']);
  row++;
  addDetails('Waste', result?.scope3?.waste?.details, result?.scope3?.waste?.total);
  addDataRow(ws, row, ['น้ำเสีย', result?.scope3?.wastewater?.details?.treatmentMethod || '', `${result?.scope3?.wastewater?.details?.volumeM3 || 0} m³`, round(result?.scope3?.wastewater?.total || 0), round((result?.scope3?.wastewater?.total || 0) * 0.001), '']);
  row++;
  addTotalRow(ws, row, ['รวม Scope 3', '', '', round(result?.scope3?.total || 0), round(result?.scope3?.totalTonne || 0), '']);
  row++;

  // Grand Total
  row++;
  addTotalRow(ws, row, ['รวมทั้งสิ้น (Total)', '', '', round(result?.total?.kgCO2e || 0), round(result?.total?.tCO2e || 0), '']);
  row++;

  // Biogenic
  if (result?.biogenic?.total > 0) {
    row++;
    addDataRow(ws, row, ['Biogenic CO₂ (รายงานแยก)', '', '', round(result?.biogenic?.total || 0), round(result?.biogenic?.totalTonne || 0), 'ชีวมวล/ชีวภาพ']);
  }

  // Base year comparison
  row += 2;
  addSubHeaderRow(ws, row, ['เปรียบเทียบปีฐาน (Base Year Comparison)']);
  row++;
  addDataRow(ws, row, ['ปีฐาน (Base Year)', entry?.baseYear || '2561', '', '', '', '']);
  row++;
  addDataRow(ws, row, ['การเปลี่ยนแปลง', '', '', '', '', 'คำนวณเมื่อมีข้อมูลปีฐาน']);
}

// ─── Sheet 7: Net Zero Progress ────────────────────────────────
function createNetZeroSheet(ws, result, entry) {
  ws.columns = [
    { header: 'หัวข้อ', key: 'topic', width: 35 },
    { header: 'รายละเอียด', key: 'detail', width: 50 },
    { header: 'หมายเหตุ', key: 'note', width: 30 },
  ];

  ws.mergeCells('A1:C1');
  const title = ws.getCell('A1');
  title.value = '🎯 Net Zero Progress — Hillkoff';
  applyStyle(title, STYLE.title);

  addSubHeaderRow(ws, 3, ['เป้าหมาย Net Zero']);

  const data = [
    ['ปีฐาน (Base Year)', String(entry?.baseYear || '2561 (2018)'), 'ใช้วัดผลการลด'],
    ['เป้าหมายระยะสั้น', 'ลด 50% ภายในปี 2573 (2030)', ''],
    ['เป้าหมาย Net Zero', 'ลด 100% ภายในปี 2593 (2050)', ''],
    ['', '', ''],
    ['Carbon Offsets (ถ้ามี)', '', ''],
    ['  Carbon Credits ที่ซื้อ', String(entry?.carbonOffsets?.purchasedCredits || 0), 'tCO₂e'],
    ['  Carbon Credits ที่ใช้แล้ว', String(entry?.carbonOffsets?.retiredCredits || 0), 'tCO₂e'],
    ['', '', ''],
    ['Emission Reference', '', ''],
    ['  EF Source', 'TGO AR5 V2 (IPCC 2006 / AR6)', ''],
    ['  EF Year', '2024', ''],
    ['  Methodology', 'GHG Protocol Corporate Standard', ''],
  ];

  data.forEach((d, i) => {
    addDataRow(ws, 4 + i, d);
  });
}

// ─── MAIN Export Function ─────────────────────────────────────────
export async function generateTGOExcel(entry) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Hillkoff CFO Platform';
  workbook.created = new Date();

  const result = calculateCFO(entry);

  // Sheet 1: Organization Info
  const ws1 = workbook.addWorksheet('Fr-01 ข้อมูลองค์กร');
  createOrgInfoSheet(ws1, entry);

  // Sheet 2: Stationary Combustion
  const ws2 = workbook.addWorksheet('Fr-03.1 Stationary');
  createStationarySheet(ws2, result);

  // Sheet 3: Mobile + Fugitive
  const ws3 = workbook.addWorksheet('Fr-03.2 Mobile+Fugitive');
  createMobileSheet(ws3, result);

  // Sheet 4: Electricity
  const ws4 = workbook.addWorksheet('Fr-04.1 Electricity');
  createElectricitySheet(ws4, result, entry);

  // Sheet 5: Waste + Wastewater
  const ws5 = workbook.addWorksheet('Fr-05 Waste+Wastewater');
  createWasteSheet(ws5, result);

  // Sheet 6: Summary
  const ws6 = workbook.addWorksheet('Fr-06 Summary');
  createSummarySheet(ws6, result, entry);

  // Sheet 7: Net Zero
  const ws7 = workbook.addWorksheet('Net Zero');
  createNetZeroSheet(ws7, result, entry);

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
}

/**
 * ดาวน์โหลดไฟล์ Excel จาก Client-side
 */
export function downloadExcel(buffer, filename = 'hillkoff-cfo-report.xlsx') {
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default {
  generateTGOExcel,
  downloadExcel,
};