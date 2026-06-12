/**
 * Scope 3 Categories Calculator
 * ตามมาตรฐาน GHG Protocol Corporate Value Chain (Scope 3) Standard
 * รองรับการคำนวณ CAT1, CAT3, CAT4, CAT5, CAT6, CAT7, CAT9
 */

// ─── Helper ────────────────────────────────────────────────────────
function round(v, d = 2) {
  const n = Number(v);
  return Number.isFinite(n) ? Number(n.toFixed(d)) : 0;
}
function toNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

// ─── CAT1: Purchased Goods & Services ──────────────────────────────
export function calcCat1(items = []) {
  let total = 0;
  const details = [];
  items.forEach(item => {
    const qty = toNumber(item.quantity);
    const ef = toNumber(item.ef); // kgCO2e per unit
    const co2 = round(qty * ef);
    total += co2;
    details.push({
      name: item.name || 'สินค้า/บริการ',
      quantity: qty,
      unit: item.unit || 'kg',
      ef,
      co2_kg: co2,
      sourceReference: item.sourceReference || null,
    });
  });
  return { total: round(total), details };
}

// ─── CAT3: Fuel & Energy Related Activities ──────────────────────
export function calcCat3(electricityKwh = 0, upstreamEF = 0.0812) {
  const kwh = toNumber(electricityKwh);
  const co2 = round(kwh * upstreamEF);
  return {
    total: co2,
    details: {
      kwh,
      ef: upstreamEF,
      co2_kg: co2,
      note: 'Upstream emissions from purchased electricity (well-to-tank)',
    },
  };
}

// ─── CAT4: Upstream Transportation & Distribution ─────────────────
export function calcCat4(shipments = []) {
  let total = 0;
  const details = [];
  shipments.forEach(s => {
    const ton = toNumber(s.ton);
    const km = toNumber(s.km);
    const efPerTonKm = toNumber(s.ef) || 0.0623; // default kgCO2e/ton-km
    const co2 = round(ton * km * efPerTonKm);
    total += co2;
    details.push({
      name: s.name || 'การขนส่ง',
      ton,
      km,
      tonKm: round(ton * km, 2),
      ef: efPerTonKm,
      co2_kg: co2,
    });
  });
  return { total: round(total), details };
}

// ─── CAT5: Waste Generated in Operations ──────────────────────────
export function calcCat5(wasteKg = 0, type = 'landfill') {
  const efMap = { landfill: 0.45, recycle: 0, incineration: 0.65 };
  const kg = toNumber(wasteKg);
  const ef = efMap[type] || 0.45;
  const co2 = round(kg * ef);
  return { total: co2, details: { wasteKg: kg, type, ef, co2_kg: co2 } };
}

// ─── CAT6: Business Travel ────────────────────────────────────────
export function calcCat6(travels = []) {
  let total = 0;
  const details = [];
  travels.forEach(t => {
    const km = toNumber(t.km);
    const ef = toNumber(t.ef) || 0.1602; // default car gasoline kgCO2e/km
    const co2 = round(km * ef);
    total += co2;
    details.push({ name: t.name || 'เดินทาง', km, ef, co2_kg: co2 });
  });
  return { total: round(total), details };
}

// ─── CAT7: Employee Commuting ────────────────────────────────────
export function calcCat7(employees = 0, avgKmPerDay = 20, workDays = 300, efPerKm = 0.1602) {
  const emp = toNumber(employees);
  const km = avgKmPerDay;
  const days = toNumber(workDays);
  const totalKm = emp * km * days;
  const co2 = round(totalKm * efPerKm);
  return {
    total: co2,
    details: { employees: emp, avgKmPerDay: km, workDays: days, totalKm, ef: efPerKm, co2_kg: co2 },
  };
}

// ─── CAT9: Downstream Transportation & Distribution ──────────────
export function calcCat9(shipments = []) {
  return calcCat4(shipments); // same logic as CAT4
}

// ─── Significance Assessment (Fr-03.2) ───────────────────────────
export const CATEGORIES = [
  { id: 1, name: 'Purchased goods and services', color: '#dc2626' },
  { id: 2, name: 'Capital goods', color: '#ea580c' },
  { id: 3, name: 'Fuel- and energy-related activities', color: '#d97706' },
  { id: 4, name: 'Upstream transportation and distribution', color: '#65a30d' },
  { id: 5, name: 'Waste generated in operations', color: '#16a34a' },
  { id: 6, name: 'Business travel', color: '#0891b2' },
  { id: 7, name: 'Employee commuting', color: '#2563eb' },
  { id: 8, name: 'Upstream leased assets', color: '#7c3aed' },
  { id: 9, name: 'Downstream transportation and distribution', color: '#9333ea' },
  { id: 10, name: 'Processing of sold products', color: '#c026d3' },
  { id: 11, name: 'Use of sold products', color: '#db2777' },
  { id: 12, name: 'End-of-life treatment of sold products', color: '#e11d48' },
  { id: 13, name: 'Downstream leased assets', color: '#be123c' },
  { id: 14, name: 'Franchises', color: '#881337' },
  { id: 15, name: 'Investments', color: '#4c0519' },
];

export function assessSignificance(categories = []) {
  return categories.map(cat => {
    const score = cat.magnitude * 0.5 + cat.influence * 0.3 + cat.risk * 0.1 + cat.opportunity * 0.1;
    return {
      id: cat.id,
      name: CATEGORIES.find(c => c.id === cat.id)?.name || `Category ${cat.id}`,
      present: cat.present || false,
      magnitude: cat.magnitude || 0,
      influence: cat.influence || 0,
      risk: cat.risk || 0,
      opportunity: cat.opportunity || 0,
      score: round(score, 2),
      significant: score >= 2.5,
      included: cat.included || false,
    };
  });
}

export default {
  calcCat1, calcCat3, calcCat4, calcCat5, calcCat6, calcCat7, calcCat9,
  assessSignificance, CATEGORIES,
};