/**
 * TGO Emission Factors Database — Version 3.0
 * ครบทุก Emission Factor สำหรับ CFO ตาม TGO AR5 V2 + TGO CFO AR5 Feb 2026
 */

import efData from '@/data/tgo_ef_ar5_v2.json';

export const GWP = efData.gwp;

// ─── Stationary Combustion ───────────────────────────────────────
export const STATIONARY_FUELS = efData.stationary.map((s, i) => ({
  id: `stationary_${i}`, name: s.name, unit: s.unit, ef: s.ef_kgco2e_per_unit, isBiogenic: s.isBiogenic || false,
}));
export function getStationaryEF(fuelId) {
  const idx = parseInt(fuelId?.replace('stationary_', ''), 10);
  return STATIONARY_FUELS[idx] || null;
}

// ─── Mobile Combustion ───────────────────────────────────────────
export const MOBILE_VEHICLES = efData.mobile.map((m, i) => ({
  id: `mobile_${i}`, name: m.name, unit: m.unit, ef: m.ef_kgco2e_per_unit,
}));
export function getMobileEF(vehicleId) {
  const idx = parseInt(vehicleId?.replace('mobile_', ''), 10);
  return MOBILE_VEHICLES[idx] || null;
}

// ─── Off-road Mobile (forklift, tractor) ─────────────────────────
export const OFFROAD_VEHICLES = (efData.mobile_offroad || []).map((m, i) => ({
  id: `offroad_${i}`, name: m.name, unit: m.unit, ef: m.ef_kgco2e_per_unit,
}));

// ─── Electricity (Grid) ──────────────────────────────────────────
export const GRID_AREAS = Object.entries(efData.electricity).map(([area, ef]) => ({
  id: area.toLowerCase(), name: area === 'MEA' ? 'การไฟฟ้านครหลวง (MEA)' : 'การไฟฟ้าส่วนภูมิภาค (PEA)', shortName: area, ef: ef.value,
}));
export function getElectricityEF(gridArea) {
  const area = efData.electricity[gridArea?.toUpperCase()];
  return area ?? efData.electricity.MEA;
}

// ─── Waste & Wastewater ──────────────────────────────────────────
export const WASTE_TYPES = [
  { id: 'landfill', name: 'ขยะทั่วไปฝังกลบ', ef: efData.waste.landfill.value, unit: 'kgCO2e/kg' },
  { id: 'recycle', name: 'ขยะรีไซเคิล', ef: efData.waste.recycle.value, unit: 'kgCO2e/kg' },
  { id: 'incineration', name: 'ขยะเผา', ef: efData.waste.incineration.value, unit: 'kgCO2e/kg' },
];
export function getWasteEF(wasteType) { return efData.waste[wasteType]?.value ?? 0; }
export const WASTEWATER_METHODS = Object.entries(efData.wastewater).map(([method, ef]) => ({ id: method, name: { septic: 'ถังเกรอะ (Septic)', aerobic: 'ระบบเติมอากาศ (Aerobic)', anaerobic: 'ระบบไม่ใช้ออกซิเจน (Anaerobic)' }[method] || method, ef: ef.value, unit: 'kgCO2e/m³' }));
export function getWastewaterEF(method) { return efData.wastewater[method]?.value ?? 0.045; }

// ─── Refrigerants ────────────────────────────────────────────────
export const REFRIGERANTS = Object.entries(efData.refrigerants).map(([name, info]) => ({ id: name.toLowerCase().replace(/[-\s]/g, '_'), name, gwp: info.gwp, unit: 'kgCO2e/kg' }));
export function getRefrigerantGWP(refrigerantId) {
  const ref = REFRIGERANTS.find(r => r.id === refrigerantId);
  return ref?.gwp ?? 0;
}
export const CO2_EXTINGUISHER_GWP = 1;

// ─── Fugitive CH₄ Parameters ────────────────────────────────────
export const CH4_GWP = efData.gwp.CH4 || 28;
export const SEPTIC_DEFAULTS = efData.fugitiveCH4?.septic || { bodPerPersonPerDay: 0.04, mcf: 0.5, bo: 0.6 };
export const WASTEWATER_CH4_DEFAULTS = efData.fugitiveCH4?.wastewater || { bo: 0.6, mcf_anaerobic: 0.8, mcf_septic: 0.5, mcf_aerobic: 0.1 };

// ─── Common Fuels (most used) ────────────────────────────────────
export const COMMON_FUELS = {
  diesel: { name: 'ดีเซล', unit: 'L', ef: 2.6993 },
  gasoline: { name: 'เบนซิน', unit: 'L', ef: 2.1866 },
  lpg_kg: { name: 'LPG (กก.)', unit: 'kg', ef: 3.1133 },
  lpg_l: { name: 'LPG (ลิตร)', unit: 'L', ef: 1.6812 },
  ng_scf: { name: 'ก๊าซธรรมชาติ (SCF)', unit: 'SCF', ef: 0.05728 },
  natural_gas: { name: 'ก๊าซธรรมชาติ', unit: 'SCF', ef: 0.05728 },
};

// ─── Unit Conversion ─────────────────────────────────────────────
export const CONVERSION = { kgToTonne: 0.001, litreToM3: 0.001, kWhToMWh: 0.001 };

// ─── Scope 3 Default EF ─────────────────────────────────────────
export const SCOPE3_EF = {
  electricityUpstream: 0.0812, // kgCO2e/kWh (TGO CFO 2026)
  transportTruck: 0.0623,      // kgCO2e/ton-km
  carGasoline: 0.1602,         // kgCO2e/km
  propane: 1.5135,            // kgCO2e/kg
  ethane: 1.6375,             // kgCO2e/kg
};

export default {
  GWP, STATIONARY_FUELS, MOBILE_VEHICLES, OFFROAD_VEHICLES, GRID_AREAS,
  WASTE_TYPES, WASTEWATER_METHODS, REFRIGERANTS, COMMON_FUELS, CONVERSION,
  CH4_GWP, SEPTIC_DEFAULTS, WASTEWATER_CH4_DEFAULTS, SCOPE3_EF,
  getStationaryEF, getMobileEF, getElectricityEF, getWasteEF, getWastewaterEF, getRefrigerantGWP,
};