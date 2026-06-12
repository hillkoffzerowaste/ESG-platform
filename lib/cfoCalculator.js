/**
 * CFO (Carbon Footprint for Organization) Calculator
 * ตามมาตรฐาน TGO (องค์การบริหารจัดการก๊าซเรือนกระจก)
 *
 * คำนวณการปล่อยก๊าซเรือนกระจกแยกตาม Scope 1, 2, 3
 * ใช้ Emission Factors จาก TGO AR5 V2
 */

import {
  getStationaryEF,
  getMobileEF,
  getElectricityEF,
  getWasteEF,
  getWastewaterEF,
  getRefrigerantGWP,
  CO2_EXTINGUISHER_GWP,
  CONVERSION,
  COMMON_FUELS,
} from './tgoFactors';

// ─── Helper ────────────────────────────────────────────────────────
function round(value, decimals = 4) {
  const n = Number(value);
  return Number.isFinite(n) ? Number(n.toFixed(decimals)) : 0;
}

function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

// ─── Scope 1: Stationary Combustion (Fr-03.1) ────────────────────
function calcStationary(fuels = []) {
  let total = 0;
  const details = [];

  for (const fuel of fuels) {
    const ef = fuel.fuelId
      ? getStationaryEF(fuel.fuelId)
      : (COMMON_FUELS[fuel.fuelType] || null);

    const efValue = ef?.ef ?? 0;
    const quantity = toNumber(fuel.quantity);
    const co2 = round(quantity * efValue);
    total += co2;

    details.push({
      fuelType: fuel.fuelType || fuel.fuelId || 'unknown',
      name: fuel.name || ef?.name || COMMON_FUELS[fuel.fuelType]?.name || 'ไม่ระบุ',
      quantity,
      unit: ef?.unit || COMMON_FUELS[fuel.fuelType]?.unit || 'unit',
      ef: efValue,
      co2_kg: co2,
    });
  }

  return { total: round(total), details };
}

// ─── Scope 1: Mobile Combustion (Fr-03.2) ────────────────────────
function calcMobile(vehicles = []) {
  let total = 0;
  const details = [];

  for (const v of vehicles) {
    const ef = v.vehicleId ? getMobileEF(v.vehicleId) : null;
    const efValue = ef?.ef ?? 0;
    const distance = toNumber(v.distanceKm);
    const fuelQty = toNumber(v.fuelQuantity);
    let co2 = 0;

    if (fuelQty > 0) {
      // Calculate from fuel quantity
      const fuelEF = COMMON_FUELS[v.fuelType]?.ef || efValue;
      co2 = round(fuelQty * fuelEF);
    } else if (distance > 0) {
      // Calculate from distance
      co2 = round(distance * efValue);
    }

    total += co2;
    details.push({
      vehicleType: v.vehicleType || v.vehicleId || 'unknown',
      name: v.name || ef?.name || COMMON_FUELS[v.fuelType]?.name || 'ไม่ระบุ',
      distanceKm: distance,
      fuelQuantity: fuelQty,
      fuelType: v.fuelType || 'diesel',
      ef: efValue,
      co2_kg: co2,
    });
  }

  return { total: round(total), details };
}

// ─── Scope 1: Fugitive Emissions (Fr-03.2) ───────────────────────
function calcFugitive(refrigerants = [], co2ExtinguisherKg = 0) {
  let total = 0;
  const details = [];

  for (const ref of refrigerants) {
    const gwp = getRefrigerantGWP(ref.refrigerantId);
    const leakKg = toNumber(ref.leakKg);
    const co2 = round(leakKg * gwp);
    total += co2;

    details.push({
      type: 'refrigerant',
      name: ref.name || ref.refrigerantId || 'สารทำความเย็น',
      quantity: leakKg,
      unit: 'kg',
      gwp,
      co2_kg: co2,
    });
  }

  // CO2 Fire Extinguisher
  const extKg = toNumber(co2ExtinguisherKg);
  if (extKg > 0) {
    const co2 = round(extKg * CO2_EXTINGUISHER_GWP);
    total += co2;
    details.push({
      type: 'co2_extinguisher',
      name: 'ถังดับเพลิง CO₂',
      quantity: extKg,
      unit: 'kg',
      gwp: 1,
      co2_kg: co2,
    });
  }

  return { total: round(total), details };
}

// ─── Scope 2: Purchased Electricity (Fr-04.1) ────────────────────
function calcElectricity(kwh = 0, gridArea = 'MEA') {
  const ef = getElectricityEF(gridArea);
  const quantity = toNumber(kwh);
  const co2 = round(quantity * ef);

  return {
    total: co2,
    details: {
      kwh: quantity,
      gridArea: gridArea?.toUpperCase() || 'MEA',
      ef,
      co2_kg: co2,
    },
  };
}

// ─── Scope 3: Waste Generation (Fr-05) ──────────────────────────
function calcWaste(waste = {}) {
  let total = 0;
  const details = [];

  const types = [
    { key: 'landfillKg', type: 'landfill', name: 'ขยะทั่วไปฝังกลบ' },
    { key: 'recycleKg', type: 'recycle', name: 'ขยะรีไซเคิล' },
    { key: 'incinerationKg', type: 'incineration', name: 'ขยะเผา' },
    { key: 'organicKg', type: 'recycle', name: 'ขยะอินทรีย์ทำปุ๋ย' },
    { key: 'hazardKg', type: 'landfill', name: 'ขยะอันตราย' },
  ];

  for (const t of types) {
    const qty = toNumber(waste[t.key]);
    if (qty <= 0) continue;
    const ef = getWasteEF(t.type);
    const co2 = round(qty * ef);
    total += co2;
    details.push({
      name: t.name,
      type: t.type,
      quantity: qty,
      unit: 'kg',
      ef,
      co2_kg: co2,
    });
  }

  return { total: round(total), details };
}

// ─── Scope 3: Wastewater (Fr-05) ─────────────────────────────────
function calcWastewater(volumeM3 = 0, treatmentMethod = 'septic') {
  const ef = getWastewaterEF(treatmentMethod);
  const qty = toNumber(volumeM3);
  const co2 = round(qty * ef);

  return {
    total: co2,
    details: {
      volumeM3: qty,
      treatmentMethod,
      ef,
      co2_kg: co2,
    },
  };
}

// ─── Emission Factor Information ────────────────────────────────
export function getEmissionFactorInfo(scope, category, itemId) {
  switch (scope) {
    case 'scope1':
      if (category === 'stationary') return getStationaryEF(itemId);
      if (category === 'mobile') return getMobileEF(itemId);
      return null;
    default:
      return null;
  }
}

// ─── MAIN CFO Calculation ────────────────────────────────────────
export function calculateCFO(data = {}) {
  const stationary = calcStationary(data.stationaryCombustion || []);
  const mobile = calcMobile(data.mobileCombustion || []);
  const fugitive = calcFugitive(
    data.fugitiveEmissions?.refrigerants || [],
    data.fugitiveEmissions?.co2ExtinguisherKg || 0
  );
  const electricity = calcElectricity(
    data.purchasedElectricity?.kwh || 0,
    data.purchasedElectricity?.gridArea
  );
  const waste = calcWaste(data.wasteGeneration || {});
  const wastewater = calcWastewater(
    data.wastewater?.volumeM3 || 0,
    data.wastewater?.treatmentMethod
  );

  const scope1 = round(stationary.total + mobile.total + fugitive.total);
  const scope2 = electricity.total;
  const scope3 = round(waste.total + wastewater.total);
  const total = round(scope1 + scope2 + scope3);

  return {
    scope1: {
      total: scope1,
      totalTonne: scope1 * CONVERSION.kgToTonne,
      stationary,
      mobile,
      fugitive,
    },
    scope2: {
      total: scope2,
      totalTonne: scope2 * CONVERSION.kgToTonne,
      electricity,
    },
    scope3: {
      total: scope3,
      totalTonne: scope3 * CONVERSION.kgToTonne,
      waste,
      wastewater,
    },
    total: {
      kgCO2e: total,
      tCO2e: total * CONVERSION.kgToTonne,
    },
  };
}

// ─── Simple Calculation (for quick preview) ─────────────────────
export function quickCalc(fuelType, quantity) {
  const fuel = COMMON_FUELS[fuelType];
  if (!fuel) return null;
  const q = toNumber(quantity);
  return {
    co2_kg: round(q * fuel.ef),
    co2_t: round(q * fuel.ef * CONVERSION.kgToTonne, 4),
  };
}

export default {
  calculateCFO,
  quickCalc,
  calcStationary,
  calcMobile,
  calcFugitive,
  calcElectricity,
  calcWaste,
  calcWastewater,
  getEmissionFactorInfo,
};