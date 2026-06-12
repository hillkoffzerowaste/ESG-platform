/**
 * Net Zero Tracker
 * คำนวณความก้าวหน้าสู่ Net Zero ตามเป้าหมายขององค์กร
 * - Base Year 2018 (2561)
 * - Short Term Target 2030 (2573) — 50% reduction
 * - Net Zero 2050 (2593) — 100% reduction
 */

import { calculateCFO } from './cfoCalculator';
import { CONVERSION } from './tgoFactors';

// ─── Helpers ───────────────────────────────────────────────────────
function round(v, d = 4) {
  const n = Number(v);
  return Number.isFinite(n) ? Number(n.toFixed(d)) : 0;
}

/**
 * คำนวณแนวโน้ม Net Zero
 * @param {Array} yearlyEntries -  array of { year, scope1, scope2, scope3 }
 * @param {Object} targets - { baseYear, shortTerm { year, reductionPercent }, netZero { year } }
 * @param {Object} offsets - { purchasedCredits, retiredCredits }
 */
export function calcNetZeroProgress(yearlyEntries = [], targets = {}, offsets = {}) {
  const baseYear = targets.baseYear || 2018;
  const shortTerm = targets.shortTerm || { year: 2030, reductionPercent: 50 };
  const netZero = targets.netZero || { year: 2050, reductionPercent: 100 };
  
  // Find base year data
  const baseEntry = yearlyEntries.find(e => e.reportingYear === baseYear);
  const baseTotal = baseEntry 
    ? (Number(baseEntry.scope1) + Number(baseEntry.scope2) + Number(baseEntry.scope3)) 
    : 0;

  // Sort entries by year
  const sorted = [...yearlyEntries].sort((a, b) => a.reportingYear - b.reportingYear);
  
  // Current year (latest entry)
  const currentEntry = sorted[sorted.length - 1];
  const currentYear = currentEntry?.reportingYear || new Date().getFullYear();
  const currentTotal = currentEntry
    ? (Number(currentEntry.scope1) + Number(currentEntry.scope2) + Number(currentEntry.scope3))
    : 0;

  // Calculate change from base year
  const changeFromBase = baseTotal > 0 
    ? round(((currentTotal - baseTotal) / baseTotal) * 100, 1) 
    : 0;
  const reductionFromBase = baseTotal > 0 
    ? round(((baseTotal - currentTotal) / baseTotal) * 100, 1) 
    : 0;

  // Calculate trajectory
  const trajectory = sorted.map(e => ({
    year: e.reportingYear,
    actual: round(Number(e.scope1) + Number(e.scope2) + Number(e.scope3), 2),
    scope1: round(Number(e.scope1), 2),
    scope2: round(Number(e.scope2), 2),
    scope3: round(Number(e.scope3), 2),
  }));

  // Target emissions
  const shortTermTarget = baseTotal > 0 
    ? round(baseTotal * (1 - shortTerm.reductionPercent / 100), 2) 
    : 0;
  const netZeroTarget = 0;

  // Are we on track?
  const yearsToShortTerm = shortTerm.year - currentYear;
  const requiredAnnualReduction = yearsToShortTerm > 0 && baseTotal > 0
    ? round((baseTotal * (shortTerm.reductionPercent / 100)) / yearsToShortTerm, 2)
    : 0;
  const actualAnnualReduction = sorted.length > 1 && currentYear !== baseYear
    ? round((sorted[0]?.total || 0) - (sorted[sorted.length - 1]?.total || 0), 2)
    : 0;

  // Offsets
  const purchased = round(Number(offsets.purchasedCredits) || 0);
  const retired = round(Number(offsets.retiredCredits) || 0);
  const netEmission = round(currentTotal - retired);

  // Status
  let status = "insufficient_data";
  if (baseTotal > 0 && currentTotal > 0) {
    const yearsSinceBase = currentYear - baseYear;
    const annualChange = yearsSinceBase > 0 ? (currentTotal - baseTotal) / yearsSinceBase : 0;
    
    // Predict if we'll hit target
    const projected2030 = currentTotal + (annualChange * (shortTerm.year - currentYear));
    if (projected2030 <= shortTermTarget) {
      status = "on_track";
    } else if (projected2030 <= shortTermTarget * 1.2) {
      status = "needs_improvement";
    } else {
      status = "behind";
    }
  }

  // Scope breakdown for base year (if available)
  const scopeBreakdown = baseEntry ? {
    baseYear: {
      scope1: round(Number(baseEntry.scope1), 2),
      scope2: round(Number(baseEntry.scope2), 2),
      scope3: round(Number(baseEntry.scope3), 2),
    },
    currentYear: currentEntry ? {
      scope1: round(Number(currentEntry.scope1), 2),
      scope2: round(Number(currentEntry.scope2), 2),
      scope3: round(Number(currentEntry.scope3), 2),
    } : null,
  } : null;

  return {
    baseYear: {
      year: baseYear,
      total: round(baseTotal, 2),
      hasData: baseTotal > 0,
    },
    currentYear: {
      year: currentYear,
      total: round(currentTotal, 2),
      hasData: currentTotal > 0,
    },
    change: {
      fromBase: changeFromBase,
      reduction: reductionFromBase,
      absolute: round(currentTotal - baseTotal, 2),
    },
    targets: {
      shortTerm: {
        year: shortTerm.year,
        reductionPercent: shortTerm.reductionPercent,
        targetEmissions: shortTermTarget,
      },
      netZero: {
        year: netZero.year,
        reductionPercent: netZero.reductionPercent,
        targetEmissions: netZeroTarget,
      },
      requiredAnnualReduction,
      actualAnnualReduction,
    },
    trajectory,
    offsets: {
      purchased,
      retired,
      netEmission,
    },
    scopeBreakdown,
    status,
    allYears: sorted.map(e => e.reportingYear),
  };
}

/**
 * สร้าง data สำหรับ chart ง่ายๆ
 */
export function getChartData(netZeroResult) {
  if (!netZeroResult) return null;

  const years = netZeroResult.trajectory.map(t => t.year);
  const actuals = netZeroResult.trajectory.map(t => t.actual);
  
  // Build target line
  const targetYears = [
    netZeroResult.baseYear.year,
    ...netZeroResult.targets.shortTerm.year > netZeroResult.baseYear.year ? [netZeroResult.targets.shortTerm.year] : [],
    netZeroResult.targets.netZero.year,
  ];
  const targetValues = [
    netZeroResult.baseYear.total,
    netZeroResult.targets.shortTerm.targetEmissions,
    0,
  ].filter(v => v !== undefined);

  return {
    years,
    actuals,
    targetYears,
    targetValues,
    scope1: netZeroResult.trajectory.map(t => t.scope1),
    scope2: netZeroResult.trajectory.map(t => t.scope2),
    scope3: netZeroResult.trajectory.map(t => t.scope3),
  };
}

/**
 * ตรวจสอบความสม่ำเสมอของข้อมูล (YoY)
 * @param {Array} yearlyEntries 
 * @param {number} thresholdPercent - percentage change threshold to flag
 */
export function checkConsistency(yearlyEntries = [], thresholdPercent = 50) {
  const alerts = [];
  const sorted = [...yearlyEntries].sort((a, b) => a.reportingYear - b.reportingYear);

  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];

    // Check total
    const prevTotal = Number(prev.scope1) + Number(prev.scope2) + Number(prev.scope3);
    const currTotal = Number(curr.scope1) + Number(curr.scope2) + Number(curr.scope3);
    
    if (prevTotal > 0) {
      const change = Math.abs((currTotal - prevTotal) / prevTotal) * 100;
      if (change > thresholdPercent) {
        alerts.push({
          year: curr.reportingYear,
          field: "Total",
          prevValue: prevTotal,
          currValue: currTotal,
          changePercent: round(change, 1),
          severity: change > thresholdPercent * 1.5 ? "high" : "medium",
          message: `Total emission เปลี่ยนแปลง ${round(change, 1)}% จากปี ${prev.reportingYear} — ควรตรวจสอบ`,
        });
      }
    }

    // Check scope1
    const s1 = Number(prev.scope1);
    const s1c = Number(curr.scope1);
    if (s1 > 0 && Math.abs((s1c - s1) / s1) * 100 > thresholdPercent) {
      alerts.push({
        year: curr.reportingYear,
        field: "Scope 1",
        prevValue: s1,
        currValue: s1c,
        changePercent: round(Math.abs((s1c - s1) / s1) * 100, 1),
        severity: "medium",
        message: `Scope 1 เปลี่ยนแปลงมาก — ควรตรวจสอบข้อมูล`,
      });
    }

    // Check scope2
    const s2 = Number(prev.scope2);
    const s2c = Number(curr.scope2);
    if (s2 > 0 && Math.abs((s2c - s2) / s2) * 100 > thresholdPercent) {
      alerts.push({
        year: curr.reportingYear,
        field: "Scope 2",
        prevValue: s2,
        currValue: s2c,
        changePercent: round(Math.abs((s2c - s2) / s2) * 100, 1),
        severity: "medium",
        message: `Scope 2 เปลี่ยนแปลงมาก — ตรวจสอบบิลค่าไฟ`,
      });
    }
  }

  return alerts;
}

export default {
  calcNetZeroProgress,
  getChartData,
  checkConsistency,
};