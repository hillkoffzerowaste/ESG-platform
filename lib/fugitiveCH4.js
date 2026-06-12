/**
 * Fugitive CH₄ Emissions Calculator
 * ตามมาตรฐาน TGO / IPCC Guidelines
 * 
 * 1. CH₄ จาก Septic Tank (ห้องน้ำ)
 * 2. CH₄ จาก Wastewater (บ่อบำบัด) — COD-based
 */

// ─── Constants ─────────────────────────────────────────────────────
export const CH4_GWP = 28; // GWP100 AR5

// IPCC Defaults
export const SEPTIC_PARAMS = {
  bodPerPersonPerDay: 0.04, // kg BOD/person/day (default for Thailand)
  mcf_septic: 0.5,        // Methane Correction Factor for septic tank
  bo: 0.6,                // Maximum CH4 producing capacity (kg CH4/kg BOD)
  gwp: CH4_GWP,
};

export const WASTEWATER_PARAMS = {
  bo: 0.6,                 // kg CH4/kg COD
  mcf_anaerobic: 0.8,      // Deep anaerobic lagoon > 2m
  mcf_septic: 0.5,         // Septic tank
  mcf_aerobic: 0.1,        // Aerobic treatment
  mcf_none: 0.3,           // No treatment
  gwp: CH4_GWP,
};

function round(v, d = 4) {
  const n = Number(v);
  return Number.isFinite(n) ? Number(n.toFixed(d)) : 0;
}

function toNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

/**
 * คำนวณ CH₄ จาก Septic Tank (IPCC)
 * @param {number} employees - จำนวนพนักงานสูงสุด
 * @param {number} workDays - จำนวนวันทำงาน
 * @param {Object} params - Optional parameters (bodPerPerson, mcf)
 */
export function calcSepticCH4(employees = 0, workDays = 0, params = {}) {
  const emp = toNumber(employees);
  const days = toNumber(workDays);
  if (emp <= 0 || days <= 0) return { kgCH4: 0, kgCO2e: 0, details: null };

  const bodPerPerson = params.bodPerPerson || SEPTIC_PARAMS.bodPerPersonPerDay;
  const mcf = params.mcf || SEPTIC_PARAMS.mcf_septic;
  const bo = params.bo || SEPTIC_PARAMS.bo;

  // Total BOD = คน × วัน × BOD ต่อคนต่อวัน
  const totalBOD = emp * days * bodPerPerson; // kg BOD
  
  // CH₄ = BOD × B₀ × MCF
  const kgCH4 = round(totalBOD * bo * mcf, 6);
  const kgCO2e = round(kgCH4 * CH4_GWP, 4);

  return {
    kgCH4,
    kgCO2e,
    details: {
      employees: emp,
      workDays: days,
      totalBOD_kg: round(totalBOD, 2),
      bo,
      mcf,
      kgCH4,
      gwp: CH4_GWP,
      kgCO2e,
    },
  };
}

/**
 * คำนวณ CH₄ จาก Wastewater (COD-based — IPCC Tier 2)
 * @param {number} volumeM3 - ปริมาณน้ำเสีย (m³)
 * @param {number} codMgL - COD (mg/L)
 * @param {string} treatmentMethod - septic / anaerobic / aerobic / none
 * @param {Object} params - Optional parameters
 */
export function calcWastewaterCH4(volumeM3 = 0, codMgL = 0, treatmentMethod = 'septic', params = {}) {
  const vol = toNumber(volumeM3);
  const cod = toNumber(codMgL);
  if (vol <= 0 || cod <= 0) return { kgCH4: 0, kgCO2e: 0, details: null };

  const bo = params.bo || WASTEWATER_PARAMS.bo;

  const mcfMap = {
    septic: params.mcf || WASTEWATER_PARAMS.mcf_septic,
    anaerobic: WASTEWATER_PARAMS.mcf_anaerobic,
    aerobic: WASTEWATER_PARAMS.mcf_aerobic,
    none: WASTEWATER_PARAMS.mcf_none,
  };
  const mcf = mcfMap[treatmentMethod] || WASTEWATER_PARAMS.mcf_septic;

  // Total COD (kg) = m³ × mg/L × 0.001 (convert mg/L to kg/m³)
  const totalCOD_kg = round(vol * cod * 0.001, 6);

  // CH₄ = COD × B₀ × MCF
  const kgCH4 = round(totalCOD_kg * bo * mcf, 6);
  const kgCO2e = round(kgCH4 * CH4_GWP, 4);

  return {
    kgCH4,
    kgCO2e,
    details: {
      volumeM3: vol,
      codMgL: cod,
      totalCOD_kg: round(totalCOD_kg, 2),
      bo,
      mcf,
      kgCH4,
      gwp: CH4_GWP,
      kgCO2e,
    },
  };
}

/**
 * Process Emissions (CO₂ จากปฏิกิริยาเคมี)
 * @param {number} co2Kg - CO₂ ที่ปล่อยจากกระบวนการ (kg)
 */
export function calcProcessEmissions(co2Kg = 0, ch4Kg = 0, n2oKg = 0) {
  const co2 = toNumber(co2Kg);
  const ch4 = toNumber(ch4Kg);
  const n2o = toNumber(n2oKg);

  const total = round(co2 + (ch4 * CH4_GWP) + (n2o * 265), 4);

  return {
    total: round(total, 2),
    details: {
      co2_kg: co2,
      ch4_kg: ch4,
      n2o_kg: n2o,
      co2_from_ch4: round(ch4 * CH4_GWP, 2),
      co2_from_n2o: round(n2o * 265, 2),
      total_kgCO2e: total,
    },
  };
}

export default {
  calcSepticCH4,
  calcWastewaterCH4,
  calcProcessEmissions,
  CH4_GWP,
  SEPTIC_PARAMS,
  WASTEWATER_PARAMS,
};