/**
 * CFO (Carbon Footprint for Organization) Calculator
 * ตามมาตรฐาน TGO (องค์การบริหารจัดการก๊าซเรือนกระจก)
 * Version 3.0 — รองรับ:
 * - Scope 1: Stationary, Mobile, Fugitive, Process, CH₄ Septic/WW
 * - Scope 2: Electricity (Grid + Self-generated)
 * - Scope 3: CAT1, CAT3, CAT4, CAT5, CAT6, CAT7, CAT9
 * - Biogenic CO₂ แยกรายงาน
 * - Carbon Intensity
 */

import { getStationaryEF, getMobileEF, getElectricityEF, getWasteEF, getWastewaterEF, getRefrigerantGWP, CO2_EXTINGUISHER_GWP, CONVERSION, COMMON_FUELS } from './tgoFactors';
import { calcSepticCH4, calcWastewaterCH4, calcProcessEmissions } from './fugitiveCH4';
import { calcCat1, calcCat3, calcCat4, calcCat5, calcCat6, calcCat7, calcCat9 } from './scope3Categories';

function round(value, decimals = 4) {
  const n = Number(value);
  return Number.isFinite(n) ? Number(n.toFixed(decimals)) : 0;
}
function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

// ─── Scope 1: Stationary Combustion ────────────────────────────
function calcStationary(fuels = []) {
  let total = 0, biogenicTotal = 0;
  const details = [];
  for (const fuel of fuels) {
    const ef = fuel.fuelId ? getStationaryEF(fuel.fuelId) : (COMMON_FUELS[fuel.fuelType] || null);
    const efValue = ef?.ef ?? 0;
    const quantity = toNumber(fuel.quantity);
    const isBiogenic = fuel.isBiogenic || ef?.isBiogenic || false;
    const co2 = round(quantity * efValue);
    if (isBiogenic) biogenicTotal += co2; else total += co2;
    details.push({
      fuelType: fuel.fuelType || fuel.fuelId || 'unknown',
      name: fuel.name || ef?.name || 'ไม่ระบุ',
      quantity, unit: ef?.unit || 'unit', ef: efValue, co2_kg: co2,
      isBiogenic, sourceReference: fuel.sourceReference || null,
    });
  }
  return { total: round(total), biogenicTotal: round(biogenicTotal), details };
}

// ─── Scope 1: Mobile Combustion ────────────────────────────────
function calcMobile(vehicles = []) {
  let total = 0;
  const details = [];
  for (const v of vehicles) {
    let co2 = 0;
    if (toNumber(v.fuelQuantity) > 0) {
      const fuelEF = v.fuelType === 'offroad_diesel' ? 2.979283 : (COMMON_FUELS[v.fuelType]?.ef || 2.6993);
      co2 = round(toNumber(v.fuelQuantity) * fuelEF);
    } else if (toNumber(v.distanceKm) > 0) {
      const ef = v.vehicleId ? getMobileEF(v.vehicleId) : null;
      co2 = round(toNumber(v.distanceKm) * (ef?.ef || 0.1856));
    }
    total += co2;
    details.push({
      vehicleType: v.vehicleType || 'unknown',
      name: v.name || 'ยานพาหนะ',
      distanceKm: toNumber(v.distanceKm), fuelQuantity: toNumber(v.fuelQuantity),
      fuelType: v.fuelType || 'diesel', ef: 0, co2_kg: co2,
      sourceReference: v.sourceReference || null,
    });
  }
  return { total: round(total), details };
}

// ─── Scope 1: Fugitive (Refrigerants) ──────────────────────────
function calcFugitive(refrigerants = [], co2ExtinguisherKg = 0) {
  let total = 0;
  const details = [];
  for (const ref of refrigerants) {
    const gwp = getRefrigerantGWP(ref.refrigerantId);
    const leakKg = toNumber(ref.leakKg);
    const co2 = round(leakKg * gwp);
    total += co2;
    details.push({ type: 'refrigerant', name: ref.name || 'สารทำความเย็น', quantity: leakKg, unit: 'kg', gwp, co2_kg: co2, sourceReference: ref.sourceReference || null });
  }
  const extKg = toNumber(co2ExtinguisherKg);
  if (extKg > 0) {
    total += extKg;
    details.push({ type: 'co2_extinguisher', name: 'ถังดับเพลิง CO₂', quantity: extKg, unit: 'kg', gwp: 1, co2_kg: extKg });
  }
  return { total: round(total), details };
}

// ─── Scope 1: CH₄ Fugitive (Septic + Wastewater) ──────────────
function calcFugitiveCH4(septic, wastewater) {
  const septicResult = calcSepticCH4(septic?.employees, septic?.workDays);
  const wwResult = calcWastewaterCH4(wastewater?.volumeM3, wastewater?.codMgL, wastewater?.treatmentMethod);
  const total = round(septicResult.kgCO2e + wwResult.kgCO2e, 4);
  return { total, septic: septicResult, wastewater: wwResult };
}

// ─── Scope 1: Process Emissions ────────────────────────────────
function calcProcess(data = {}) {
  const result = calcProcessEmissions(data.co2Kg, data.ch4Kg, data.n2oKg);
  return { total: result.total, details: result.details };
}

// ─── Scope 2: Purchased Electricity ────────────────────────────
function calcElectricity(kwh = 0, gridArea = 'MEA') {
  const ef = getElectricityEF(gridArea);
  const quantity = toNumber(kwh);
  const co2 = round(quantity * ef?.value ?? ef);
  return { total: co2, details: { kwh: quantity, gridArea: gridArea?.toUpperCase() || 'MEA', ef: ef?.value ?? ef, co2_kg: co2 } };
}

// ─── Scope 2: Self-generated Electricity ────────────────────────
function calcSelfGenerated(kwh = 0, fuelType = 'natural_gas') {
  const efMap = { natural_gas: 0.05728, diesel: 2.6993, lpg: 3.1133, solar: 0 };
  const ef = efMap[fuelType] || 0;
  const quantity = toNumber(kwh);
  const co2 = round(quantity * ef);
  return { total: co2, details: { kwh: quantity, fuelType, ef, co2_kg: co2 } };
}

// ─── Scope 3: All Categories ──────────────────────────────────
function calcScope3(data = {}) {
  const result = { total: 0, details: [] };
  const cat1 = calcCat1(data.purchasedGoods || []);
  const cat3 = calcCat3(data.energyUpstreamKwh);
  const cat4 = calcCat4(data.upstreamTransport || []);
  const cat5 = calcCat5(data.wasteKg, data.wasteType);
  const cat6 = calcCat6(data.businessTravel || []);
  const cat7 = calcCat7(data.employees, data.avgKmPerDay, data.workDays);
  const cat9 = calcCat9(data.downstreamTransport || []);
  
  result.total = round(cat1.total + cat3.total + cat4.total + cat5.total + cat6.total + cat7.total + cat9.total, 2);
  result.details = { cat1, cat3, cat4, cat5, cat6, cat7, cat9 };
  return result;
}

// ─── MAIN CFO Calculation ────────────────────────────────────────
export function calculateCFO(data = {}) {
  const stationary = calcStationary(data.stationaryCombustion || []);
  const mobile = calcMobile(data.mobileCombustion || []);
  const fugitive = calcFugitive(data.fugitiveEmissions?.refrigerants || [], data.fugitiveEmissions?.co2ExtinguisherKg || 0);
  const fugitiveCH4 = calcFugitiveCH4(data.septic, data.fugitiveEmissions?.wastewater);
  const process = calcProcess(data.processEmissions || {});
  const biogenicFuels = calcStationary((data.stationaryCombustion || []).filter(f => f.isBiogenic));
  const electricity = calcElectricity(data.purchasedElectricity?.totalKwh || (data.purchasedElectricity?.monthlyKwh?.reduce((a, b) => a + toNumber(b), 0)) || 0, data.purchasedElectricity?.gridArea);
  const selfGen = calcSelfGenerated(data.selfGeneratedElectricity?.kwh, data.selfGeneratedElectricity?.fuelType);
  const waste = (() => { const w = data.wasteGeneration || {}; let t = 0; const d = []; [['landfillKg','landfill','ขยะทั่วไปฝังกลบ'],['recycleKg','recycle','ขยะรีไซเคิล'],['incinerationKg','incineration','ขยะเผา'],['organicKg','recycle','ขยะอินทรีย์'],['hazardKg','landfill','ขยะอันตราย']].forEach(([k,tp,ln])=>{const q = toNumber(w[k]);if(q>0){const ef = getWasteEF(tp);const c = round(q*ef);t+=c;d.push({name:ln,quantity:q,unit:'kg',ef,co2_kg:c})}}); return {total:round(t),details:d}; })();
  const wastewater = calcWastewaterCH4(data.wastewater?.volumeM3, data.wastewater?.codMgL || 0, data.wastewater?.treatmentMethod);
  const scope3 = calcScope3(data.scope3 || {});

  const scope1 = round(stationary.total + mobile.total + fugitive.total + fugitiveCH4.total + process.total);
  const scope2 = round(electricity.total + selfGen.total);
  const scope3Total = round(waste.total + (wastewater.kgCO2e || 0) + scope3.total);
  const total = round(scope1 + scope2 + scope3Total);
  const biogenicTotal = round(stationary.biogenicTotal + biogenicFuels.total);

  // Carbon Intensity
  const productOutput = toNumber(data.productOutput?.quantity);
  const carbonIntensity = productOutput > 0 ? round(total / productOutput, 4) : 0;

  return {
    scope1: {
      total: scope1, totalTonne: scope1 * CONVERSION.kgToTonne,
      stationary, mobile, fugitive,
      fugitiveCH4, process,
    },
    scope2: { total: scope2, totalTonne: scope2 * CONVERSION.kgToTonne, electricity, selfGenerated: selfGen },
    scope3: { total: scope3Total, totalTonne: scope3Total * CONVERSION.kgToTonne, waste, wastewater: { total: wastewater.kgCO2e, details: wastewater.details }, categories: scope3 },
    biogenic: { total: biogenicTotal, totalTonne: biogenicTotal * CONVERSION.kgToTonne, stationaryBiogenic: stationary.biogenicTotal },
    total: { kgCO2e: total, tCO2e: total * CONVERSION.kgToTonne },
    carbonIntensity: { value: carbonIntensity, unit: `tCO₂e/${productOutput > 0 ? (data.productOutput?.unit || 'หน่วย') : '-'}`, productOutput },
    metadata: { calculatedAt: new Date().toISOString(), efSource: 'TGO AR5 V2 / TGO CFO AR5 Feb 2026', efYear: 2026 },
  };
}

export default { calculateCFO };