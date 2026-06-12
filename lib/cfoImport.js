/**
 * TGO Excel Import Parser
 * รองรับการนำเข้าข้อมูลจาก Template ของ อบก. (Fr-03.1, Fr-04.1, Fr-05)
 * และไฟล์บิลค่าไฟทั่วไป
 */

import { STATIONARY_FUEL_TYPES, MONTHS_TH } from './cfoForms';
import { COMMON_FUELS } from './tgoFactors';

// ─── Helper ────────────────────────────────────────────────────────
function toNumber(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? Math.abs(value) : 0;
  if (!value) return 0;
  const cleaned = String(value).replace(/,/g, '').replace(/[^0-9.\-]/g, '');
  const num = Number(cleaned);
  return Number.isFinite(num) ? Math.abs(num) : 0;
}

function findHeader(rows, keywords) {
  for (let r = 0; r < Math.min(rows.length, 15); r++) {
    const row = rows[r];
    for (let c = 0; c < row.length; c++) {
      const cell = String(row[c] || '').toLowerCase();
      if (keywords.some(kw => cell.includes(kw))) {
        return { row: r, col: c };
      }
    }
  }
  return null;
}

// ─── Parse Stationary Combustion (Fr-03.1) ──────────────────────
function parseStationarySheet(rows) {
  const results = [];
  const fuelKeywords = Object.keys(STATIONARY_FUEL_TYPES);
  const fuelNames = Object.values(STATIONARY_FUEL_TYPES).map(f => f.label);

  for (let r = 3; r < rows.length; r++) {
    const row = rows[r];
    if (!row || row.length < 2) continue;

    const cell0 = String(row[0] || '').trim().toLowerCase();
    const cell1 = String(row[1] || '').trim();

    // Find matching fuel
    let fuelType = null;
    for (const [key, info] of Object.entries(STATIONARY_FUEL_TYPES)) {
      if (cell0.includes(key) || cell0.includes(info.label.toLowerCase())) {
        fuelType = key;
        break;
      }
    }
    if (!fuelType) {
      // Try matching by name
      for (const name of fuelNames) {
        if (cell0.includes(name.toLowerCase())) {
          const entry = Object.entries(STATIONARY_FUEL_TYPES).find(([, v]) => v.label === name);
          if (entry) fuelType = entry[0];
          break;
        }
      }
    }

    if (!fuelType) continue;

    // Find quantity - check all cells for numbers
    for (let c = 1; c < Math.min(row.length, 10); c++) {
      const qty = toNumber(row[c]);
      if (qty > 0) {
        results.push({
          fuelType,
          quantity: qty,
          unit: STATIONARY_FUEL_TYPES[fuelType]?.unit || 'unit',
          source: 'import',
        });
        break;
      }
    }
  }

  return results;
}

// ─── Parse Electricity (Fr-04.1 or Utility Bill) ────────────────
function parseElectricitySheet(rows) {
  let monthlyKwh = Array(12).fill(0);
  let gridArea = 'MEA';
  let totalKwh = 0;

  // Detect grid area
  for (const row of rows) {
    const joined = row.map(c => String(c || '').toLowerCase()).join(' ');
    if (joined.includes('mea') || joined.includes('นครหลวง')) {
      gridArea = 'MEA';
      break;
    }
    if (joined.includes('pea') || joined.includes('ภูมิภาค')) {
      gridArea = 'PEA';
      break;
    }
  }

  // Find monthly data
  for (let r = 0; r < rows.length; r++) {
    const row = rows[r];
    if (!row) continue;

    // Try matching month names
    for (let m = 0; m < 12; m++) {
      const monthThai = MONTHS_TH[m];
      const monthNum = m + 1;

      for (let c = 0; c < row.length; c++) {
        const cell = String(row[c] || '').trim();
        if (cell.includes(monthThai) || cell.includes(String(monthNum))) {
          // Check adjacent cells for kWh value
          for (let dc = 1; dc <= 3; dc++) {
            if (c + dc < row.length) {
              const val = toNumber(row[c + dc]);
              if (val > 0 && val < 1000000) {
                monthlyKwh[m] = val;
                break;
              }
            }
          }
        }
      }
    }
  }

  // If no monthly data, try finding total
  if (monthlyKwh.every(v => v === 0)) {
    for (const row of rows) {
      const joined = row.map(c => String(c || '')).join(' ');
      if (joined.includes('รวม') || joined.includes('total')) {
        for (let c = 1; c < row.length; c++) {
          const val = toNumber(row[c]);
          if (val > 0 && val < 10000000) {
            totalKwh = val;
            // Distribute evenly across months
            monthlyKwh = monthlyKwh.map(() => Math.round(totalKwh / 12));
            break;
          }
        }
      }
    }
  }

  return { monthlyKwh, gridArea, totalKwh: monthlyKwh.reduce((a, b) => a + b, 0) };
}

// ─── Parse Waste & Wastewater (Fr-05) ───────────────────────────
function parseWasteSheet(rows) {
  const waste = { landfillKg: 0, recycleKg: 0, incinerationKg: 0, organicKg: 0, hazardKg: 0 };
  let wastewaterVolume = 0;
  let treatmentMethod = 'septic';

  const wasteKeywords = {
    landfillKg: ['ทั่วไป', 'ฝังกลบ', 'general', 'landfill', 'ขยะทั่วไป'],
    recycleKg: ['รีไซเคิล', 'recycle', 'recyclable', 'ขยะรีไซเคิล'],
    incinerationKg: ['เผา', 'incineration', '焚烧'],
    organicKg: ['อินทรีย์', 'organic', 'เศษอาหาร', 'food waste'],
    hazardKg: ['อันตราย', 'hazard', 'chemical', 'แบตเตอรี่'],
  };

  for (const row of rows) {
    const joined = row.map(c => String(c || '').toLowerCase()).join(' ');

    for (const [key, kws] of Object.entries(wasteKeywords)) {
      if (kws.some(kw => joined.includes(kw))) {
        for (let c = 1; c < row.length; c++) {
          const val = toNumber(row[c]);
          if (val > 0) {
            waste[key] = (waste[key] || 0) + val;
            break;
          }
        }
      }
    }

    // Detect wastewater
    if (joined.includes('น้ำเสีย') || joined.includes('wastewater')) {
      for (let c = 1; c < row.length; c++) {
        const val = toNumber(row[c]);
        if (val > 0) {
          wastewaterVolume = val;
          break;
        }
      }
      if (joined.includes('aerob')) treatmentMethod = 'aerobic';
      else if (joined.includes('anaerob')) treatmentMethod = 'anaerobic';
      else if (joined.includes('เซป') || joined.includes('septic')) treatmentMethod = 'septic';
    }
  }

  return { waste, wastewater: { volumeM3: wastewaterVolume, treatmentMethod } };
}

// ─── Auto-detect Sheet Type ─────────────────────────────────────
function detectSheetType(rows) {
  const firstRows = rows.slice(0, Math.min(rows.length, 10));
  const text = firstRows.map(r => r.map(c => String(c || '').toLowerCase()).join(' ')).join(' ');

  if (text.includes('fr-03') || text.includes('stationary') || text.includes('เชื้อเพลิง') || text.includes('ดีเซล') || text.includes('lpg')) {
    return 'stationary';
  }
  if (text.includes('fr-04') || text.includes('electricity') || text.includes('ไฟฟ้า') || text.includes('kwh') || text.includes('หน่วย')) {
    return 'electricity';
  }
  if (text.includes('fr-05') || text.includes('waste') || text.includes('ขยะ') || text.includes('น้ำเสีย')) {
    return 'waste';
  }

  return null;
}

// ─── Main Import Function ────────────────────────────────────────
export function parseTGOSheet(rows) {
  const type = detectSheetType(rows);

  if (!type) {
    // Try each parser and see which one returns data
    const stationary = parseStationarySheet(rows);
    if (stationary.length > 0) return { type: 'stationary', data: stationary };

    const electricity = parseElectricitySheet(rows);
    if (electricity.totalKwh > 0) return { type: 'electricity', data: electricity };

    const waste = parseWasteSheet(rows);
    const hasWaste = Object.values(waste.waste).some(v => v > 0);
    if (hasWaste || waste.wastewater.volumeM3 > 0) return { type: 'waste', data: waste };

    return { type: 'unknown', data: null };
  }

  switch (type) {
    case 'stationary':
      return { type: 'stationary', data: parseStationarySheet(rows) };
    case 'electricity':
      return { type: 'electricity', data: parseElectricitySheet(rows) };
    case 'waste':
      return { type: 'waste', data: parseWasteSheet(rows) };
    default:
      return { type: 'unknown', data: null };
  }
}

// ─── Parse CSV Rows ──────────────────────────────────────────────
export function parseCSV(text) {
  return text
    .split(/\r?\n/)
    .map(line => line.split(',').map(cell => cell.trim().replace(/^"(.*)"$/, '$1')))
    .filter(row => row.some(Boolean));
}

// ─── Parse Excel Rows (from exceljs) ────────────────────────────
export function normalizeExcelRows(worksheetRows) {
  return worksheetRows.map(row => {
    if (Array.isArray(row)) return row.map(v => v?.text ?? v?.result ?? v ?? '');
    return [];
  });
}

export default {
  parseTGOSheet,
  parseStationarySheet,
  parseElectricitySheet,
  parseWasteSheet,
  parseCSV,
  normalizeExcelRows,
  detectSheetType,
};