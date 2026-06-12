/**
 * Benefit Calculator — คำนวณผลประโยชน์จากการลดก๊าซเรือนกระจก
 * ROI, Carbon Credit Value, Tree Equivalent, Cost Savings
 */

// ─── Constants ─────────────────────────────────────────────────────
export const TREE_CO2_SEQUESTRATION = 50; // 1 tCO₂e = 50 trees/year
export const CARBON_CREDIT_PRICE = 2500; // avg 2000-3000 THB/tCO₂e
export const ELECTRICITY_PRICE = 4.5; // THB/kWh
export const DIESEL_PRICE = 32; // THB/L
export const GASOLINE_PRICE = 38; // THB/L
export const EV_CHARGE_PRICE = 2.5; // THB/km

// ─── Reduction Measures ────────────────────────────────────────────
export const MEASURES = {
  solar: {
    name: 'ติดตั้ง Solar Roof',
    icon: '☀️',
    description: 'ติดตั้งแผงโซลาร์เซลล์บนหลังคาเพื่อผลิตไฟฟ้าใช้เอง',
    investmentPerKwp: 40000, // THB/kWp
    productionPerKwp: 1400, // kWh/year/kWp
    lifetime: 25, // years
    maintenancePerYear: 0.01, // 1% of investment/year
    ef: 0.4999, // kgCO₂e/kWh (replaced grid electricity)
  },
  ev: {
    name: 'เปลี่ยนรถเป็น EV',
    icon: '🚗',
    description: 'เปลี่ยนรถยนต์สันดาปภายในเป็นรถยนต์ไฟฟ้า',
    investmentPerCar: 800000, // THB
    kmPerYear: 20000, // default km/year
    dieselEf: 0.1856, // kgCO₂e/km (diesel replaced)
    savingPerKm: 7, // THB/km (diesel vs EV)
    lifetime: 8, // years
  },
  led: {
    name: 'เปลี่ยนหลอดไฟ LED',
    icon: '💡',
    description: 'เปลี่ยนหลอดฟลูออเรสเซนต์เป็น LED ทุกจุด',
    savingPercent: 0.7, // ลด 70%
    investmentPerKwh: 150, // THB/kWh of existing load (30% of total)
    ef: 0.4999,
  },
  foodWaste: {
    name: 'ลดขยะอาหาร',
    icon: '🍽️',
    description: 'ลดขยะอาหารจากโรงอาหาร/ร้านกาแฟ',
    landfillEf: 0.45, // kgCO₂e/kg waste
    savingPercent: 0.5,
  },
  biomass: {
    name: 'ใช้ชีวมวลแทนเชื้อเพลิง',
    icon: '🌿',
    description: 'ใช้เศษไม้/แกลบ แทน LPG หรือดีเซล',
    dieselEf: 2.6993,
    lpgEf: 3.1133,
  },
  recycle: {
    name: 'เพิ่ม Recycling Rate',
    icon: '♻️',
    description: 'เพิ่มสัดส่วนการรีไซเคิล ลดขยะฝังกลบ',
    landfillEf: 0.45,
  },
};

// ─── Calculator Functions ──────────────────────────────────────────

function round(v, d = 2) {
  const n = Number(v);
  return Number.isFinite(n) ? Number(n.toFixed(d)) : 0;
}

/**
 * คำนวณผลตอบแทนจากการติดตั้ง Solar
 */
export function calcSolar(kwp = 10) {
  const investment = kwp * MEASURES.solar.investmentPerKwp;
  const annualKwh = kwp * MEASURES.solar.productionPerKwp;
  const annualCo2 = round(annualKwh * MEASURES.solar.ef / 1000); // tCO₂e
  const annualCostSaving = round(annualKwh * ELECTRICITY_PRICE);
  const annualMaintenance = investment * MEASURES.solar.maintenancePerYear;
  const netAnnualSaving = round(annualCostSaving - annualMaintenance);
  const paybackYears = round(investment / netAnnualSaving, 1);
  const lifetimeCo2 = round(annualCo2 * MEASURES.solar.lifetime);
  const lifetimeSaving = round(netAnnualSaving * MEASURES.solar.lifetime);
  const trees = Math.round(annualCo2 * TREE_CO2_SEQUESTRATION);
  const creditValue = round(annualCo2 * CARBON_CREDIT_PRICE);

  return {
    measure: 'solar',
    name: MEASURES.solar.name,
    icon: MEASURES.solar.icon,
    investment,
    annualKwh,
    annualCo2,
    annualCostSaving,
    netAnnualSaving,
    paybackYears,
    lifetimeCo2,
    lifetimeSaving,
    trees,
    creditValue,
  };
}

/**
 * คำนวณผลตอบแทนจากการเปลี่ยนรถ EV
 */
export function calcEV(count = 1, kmPerYear = 20000) {
  const investment = count * MEASURES.ev.investmentPerCar;
  const annualKm = count * kmPerYear;
  const annualCo2 = round(annualKm * MEASURES.ev.dieselEf / 1000); // tCO₂e
  const annualFuelSaving = round(annualKm * MEASURES.ev.savingPerKm);
  const paybackYears = round(investment / annualFuelSaving, 1);
  const lifetimeCo2 = round(annualCo2 * MEASURES.ev.lifetime);
  const lifetimeSaving = round(annualFuelSaving * MEASURES.ev.lifetime);
  const trees = Math.round(annualCo2 * TREE_CO2_SEQUESTRATION);
  const creditValue = round(annualCo2 * CARBON_CREDIT_PRICE);

  return {
    measure: 'ev',
    name: MEASURES.ev.name,
    icon: MEASURES.ev.icon,
    investment,
    annualKm,
    annualCo2,
    annualFuelSaving,
    paybackYears,
    lifetimeCo2,
    lifetimeSaving,
    trees,
    creditValue,
  };
}

/**
 * คำนวณผลตอบแทนจากการเปลี่ยน LED
 */
export function calcLED(currentKwh = 50000) {
  const kwhReduction = round(currentKwh * MEASURES.led.savingPercent);
  const investment = round(currentKwh * 0.3 * MEASURES.led.investmentPerKwh);
  const annualCo2 = round(kwhReduction * MEASURES.led.ef / 1000);
  const annualCostSaving = round(kwhReduction * ELECTRICITY_PRICE);
  const paybackYears = round(investment / annualCostSaving, 1);
  const trees = Math.round(annualCo2 * TREE_CO2_SEQUESTRATION);
  const creditValue = round(annualCo2 * CARBON_CREDIT_PRICE);

  return {
    measure: 'led',
    name: MEASURES.led.name,
    icon: MEASURES.led.icon,
    investment,
    kwhReduction,
    annualCo2,
    annualCostSaving,
    paybackYears,
    trees,
    creditValue,
  };
}

/**
 * คำนวณผลตอบแทนจากการลดขยะอาหาร
 */
export function calcFoodWaste(currentKg = 1000) {
  const reductionKg = round(currentKg * MEASURES.foodWaste.savingPercent);
  const annualCo2 = round(reductionKg * MEASURES.foodWaste.landfillEf / 1000);
  const trees = Math.round(annualCo2 * TREE_CO2_SEQUESTRATION);
  const creditValue = round(annualCo2 * CARBON_CREDIT_PRICE);

  return {
    measure: 'foodWaste',
    name: MEASURES.foodWaste.name,
    icon: MEASURES.foodWaste.icon,
    reductionKg,
    annualCo2,
    trees,
    creditValue,
    investment: 0,
    paybackYears: 0,
  };
}

/**
 * คำนวณรวมหลายมาตรการ
 */
export function calcCombined(selections = {}) {
  const results = [];
  let totalInvestment = 0;
  let totalAnnualCo2 = 0;
  let totalAnnualSaving = 0;

  if (selections.solar?.kwp > 0) {
    const r = calcSolar(selections.solar.kwp);
    results.push(r);
    totalInvestment += r.investment;
    totalAnnualCo2 += r.annualCo2;
    totalAnnualSaving += r.netAnnualSaving;
  }

  if (selections.ev?.count > 0) {
    const r = calcEV(selections.ev.count, selections.ev.kmPerYear);
    results.push(r);
    totalInvestment += r.investment;
    totalAnnualCo2 += r.annualCo2;
    totalAnnualSaving += r.annualFuelSaving;
  }

  if (selections.led?.currentKwh > 0) {
    const r = calcLED(selections.led.currentKwh);
    results.push(r);
    totalInvestment += r.investment;
    totalAnnualCo2 += r.annualCo2;
    totalAnnualSaving += r.annualCostSaving;
  }

  if (selections.foodWaste?.currentKg > 0) {
    const r = calcFoodWaste(selections.foodWaste.currentKg);
    results.push(r);
    totalAnnualCo2 += r.annualCo2;
  }

  const totalTrees = Math.round(totalAnnualCo2 * TREE_CO2_SEQUESTRATION);
  const totalCreditValue = round(totalAnnualCo2 * CARBON_CREDIT_PRICE);
  const overallPayback = totalInvestment > 0 && totalAnnualSaving > 0
    ? round(totalInvestment / totalAnnualSaving, 1)
    : 0;

  return {
    results,
    summary: {
      totalInvestment,
      totalAnnualCo2: round(totalAnnualCo2, 2),
      totalAnnualSaving: round(totalAnnualSaving, 2),
      totalCreditValue,
      totalTrees,
      overallPayback,
    },
  };
}

/**
 * แปลง CO₂ เป็นจำนวนต้นไม้
 */
export function co2ToTrees(tco2e) {
  return Math.round(tco2e * TREE_CO2_SEQUESTRATION);
}

/**
 * แปลง CO₂ เป็นมูลค่า Carbon Credit
 */
export function co2ToCreditValue(tco2e) {
  return round(tco2e * CARBON_CREDIT_PRICE);
}

export default {
  calcSolar,
  calcEV,
  calcLED,
  calcFoodWaste,
  calcCombined,
  co2ToTrees,
  co2ToCreditValue,
  MEASURES,
  CONSTANTS: {
    TREE_CO2_SEQUESTRATION,
    CARBON_CREDIT_PRICE,
    ELECTRICITY_PRICE,
    DIESEL_PRICE,
    GASOLINE_PRICE,
  },
};