/**
 * TGO Emission Factors Database
 * Source: Thailand Greenhouse Gas Management Organization (TGO)
 * Reference: CFO Guidelines - AR5 V2
 * Extracted: 2026-06-12
 * 
 * This is the SINGLE source of truth for all emission factors.
 * DO NOT define EF values anywhere else in the codebase.
 */

import efData from '@/data/tgo_ef_ar5_v2.json';

// GWP values from IPCC AR5
export const GWP = efData.gwp;

// ─── Stationary Combustion (Fr-03.1) ─────────────────────────────
export const STATIONARY_FUELS = efData.stationary.map((s, i) => ({
  id: `stationary_${i}`,
  name: s.name,
  unit: s.unit,
  ef: s.ef_kgco2e_per_unit,
}));

export function getStationaryEF(fuelId) {
  const idx = parseInt(fuelId?.replace('stationary_', ''), 10);
  return STATIONARY_FUELS[idx] || null;
}

export function findStationaryFuel(keyword) {
  const kw = keyword.toLowerCase();
  return STATIONARY_FUELS.filter(f => f.name.toLowerCase().includes(kw));
}

// ─── Mobile Combustion (Fr-03.2) ──────────────────────────────────
export const MOBILE_VEHICLES = efData.mobile.map((m, i) => ({
  id: `mobile_${i}`,
  name: m.name,
  unit: m.unit,
  ef: m.ef_kgco2e_per_unit,
}));

export function getMobileEF(vehicleId) {
  const idx = parseInt(vehicleId?.replace('mobile_', ''), 10);
  return MOBILE_VEHICLES[idx] || null;
}

export function findMobileVehicle(keyword) {
  const kw = keyword.toLowerCase();
  return MOBILE_VEHICLES.filter(v => v.name.toLowerCase().includes(kw));
}

// ─── Electricity (Fr-04.1) ──────────────────────────────────────
export const GRID_AREAS = Object.entries(efData.electricity).map(([area, ef]) => ({
  id: area.toLowerCase(),
  name: area === 'MEA' ? 'การไฟฟ้านครหลวง (MEA)' : 'การไฟฟ้าส่วนภูมิภาค (PEA)',
  shortName: area,
  ef,
}));

export function getElectricityEF(gridArea) {
  const area = efData.electricity[gridArea?.toUpperCase()];
  return area ?? efData.electricity.MEA;
}

// ─── Waste Generation (Fr-05) ─────────────────────────────────────
export const WASTE_TYPES = [
  { id: 'landfill', name: 'ขยะทั่วไปฝังกลบ', ef: efData.waste.landfill, unit: 'kgCO2e/kg' },
  { id: 'recycle', name: 'ขยะรีไซเคิล', ef: efData.waste.recycle, unit: 'kgCO2e/kg' },
  { id: 'incineration', name: 'ขยะเผา', ef: efData.waste.incineration, unit: 'kgCO2e/kg' },
  { id: 'hazard_landfill', name: 'ขยะอันตรายฝังกลบ', ef: efData.waste.landfill, unit: 'kgCO2e/kg' },
];

export function getWasteEF(wasteType) {
  return efData.waste[wasteType] ?? 0;
}

// ─── Wastewater (Fr-05) ───────────────────────────────────────────
export const WASTEWATER_METHODS = Object.entries(efData.wastewater).map(([method, ef]) => ({
  id: method,
  name: {
    septic: 'ถังเกรอะ (Septic)',
    aerobic: 'ระบบเติมอากาศ (Aerobic)',
    anaerobic: 'ระบบไม่ใช้ออกซิเจน (Anaerobic)',
  }[method] || method,
  ef,
  unit: 'kgCO2e/m³',
}));

export function getWastewaterEF(method) {
  return efData.wastewater[method] ?? 0.045;
}

// ─── Refrigerants / Fugitive Emissions (Fr-03.2) ──────────────────
export const REFRIGERANTS = Object.entries(efData.refrigerants).map(([name, gwp]) => ({
  id: name.toLowerCase().replace(/[-\s]/g, '_'),
  name,
  gwp,
  unit: 'kgCO2e/kg',
}));

export function getRefrigerantGWP(refrigerantId) {
  const ref = REFRIGERANTS.find(r => r.id === refrigerantId);
  return ref?.gwp ?? 0;
}

// ─── CO2 Fire Extinguisher ────────────────────────────────────────
export const CO2_EXTINGUISHER_GWP = 1; // kgCO2e/kg (CO2 itself)

// ─── Unit Conversion Constants ────────────────────────────────────
export const CONVERSION = {
  kgToTonne: 0.001,
  litreToM3: 0.001,
  kWhToMWh: 0.001,
};

// ─── Common Fuels Shortcut (most used) ───────────────────────────
export const COMMON_FUELS = {
  diesel: { name: 'ดีเซล', unit: 'L', ef: 2.6993 },
  gasoline: { name: 'เบนซิน', unit: 'L', ef: 2.1866 },
  lpg_kg: { name: 'LPG (กก.)', unit: 'kg', ef: 3.1133 },
  lpg_l: { name: 'LPG (ลิตร)', unit: 'L', ef: 1.6812 },
  ng_scf: { name: 'ก๊าซธรรมชาติ (SCF)', unit: 'SCF', ef: 0.05728 },
  ng_mj: { name: 'ก๊าซธรรมชาติ (MJ)', unit: 'MJ', ef: 0.05615 },
  fuel_oil_a: { name: 'น้ำมันเตา A', unit: 'L', ef: 3.0927 },
  fuel_oil_c: { name: 'น้ำมันเตา C', unit: 'L', ef: 3.2634 },
};

export function getCommonFuelEF(fuelId) {
  return COMMON_FUELS[fuelId] || null;
}

// ─── All Data ──────────────────────────────────────────────────────
export const ALL_EF_DATA = efData;

export default {
  GWP,
  STATIONARY_FUELS,
  MOBILE_VEHICLES,
  GRID_AREAS,
  WASTE_TYPES,
  WASTEWATER_METHODS,
  REFRIGERANTS,
  COMMON_FUELS,
  CONVERSION,
  getStationaryEF,
  findStationaryFuel,
  getMobileEF,
  findMobileVehicle,
  getElectricityEF,
  getWasteEF,
  getWastewaterEF,
  getRefrigerantGWP,
  getCommonFuelEF,
};