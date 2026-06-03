export const HILLKOFF_BRANCHES = [
  { id: "br_hq", name: "สำนักงานใหญ่", nameEn: "HQ", type: "office_and_main", icon: "HQ", color: "#166534", legacyIds: ["HQ"] },
  { id: "br_chang_phuak", name: "สาขาช้างเผือก", nameEn: "Chang Phuak", type: "cafe_and_store", icon: "CP", color: "#15803D", legacyIds: ["CPK"] },
  { id: "br_mahidol", name: "สาขามหิดล", nameEn: "Mahidol", type: "cafe_and_store", icon: "MD", color: "#16A34A", legacyIds: ["MHD"] },
  { id: "br_pa_phaeng", name: "สาขาป่าแพ่ง", nameEn: "Pa Phaeng", type: "cafe_and_store", icon: "PP", color: "#22C55E", legacyIds: ["PPG"] },
  { id: "br_thap_duea", name: "สาขาทับเดื่อ", nameEn: "Thap Duea", type: "processing_and_roastery", icon: "TD", color: "#4ADE80", legacyIds: ["TD"] },
  { id: "br_ratika", name: "สาขาราติก้า", nameEn: "Ratika", type: "roastery_and_distribution", icon: "RT", color: "#0f766e", legacyIds: ["RTK"] }
];

const LEGACY_BRANCH_ID_MAP = HILLKOFF_BRANCHES.reduce((acc, branch) => {
  acc[branch.id] = branch.id;
  branch.legacyIds.forEach(id => {
    acc[id] = branch.id;
  });
  return acc;
}, {});

export const getCanonicalBranchId = branchId => LEGACY_BRANCH_ID_MAP[branchId] || branchId || HILLKOFF_BRANCHES[0].id;

export const getBranchById = branchId => {
  const canonicalId = getCanonicalBranchId(branchId);
  return HILLKOFF_BRANCHES.find(branch => branch.id === canonicalId) || HILLKOFF_BRANCHES[0];
};

export const BRANCH_ID_SET = new Set(HILLKOFF_BRANCHES.map(branch => branch.id));

export const ESG_FACTORS = {
  electricityKgCo2ePerKwh: 0.4999,
  lpgKgCo2ePerKg: 3.123,
  fuelKgCo2ePerLiter: 2.7,
  landfillWasteKgCo2ePerKg: 0.45
};

export function roundMetric(value, digits = 4) {
  const num = Number(value);
  if (!Number.isFinite(num)) return 0;
  return Number(num.toFixed(digits));
}

export function calculateCarbonMetrics({
  coffeeGroundsKg = 0,
  coffeeGroundsRecycled = 0,
  plasticKg = 0,
  paperCardboardKg = 0,
  foodWasteKg = 0,
  disposedMethod = "landfill",
  electricityKwh = 0,
  lpgKg = 0,
  fuelLiters = 0
} = {}) {
  const scope1 = roundMetric((Number(lpgKg) * ESG_FACTORS.lpgKgCo2ePerKg) + (Number(fuelLiters) * ESG_FACTORS.fuelKgCo2ePerLiter), 2);
  const scope2 = roundMetric(Number(electricityKwh) * ESG_FACTORS.electricityKgCo2ePerKwh, 2);
  const wasteTotal = Number(plasticKg) + Number(paperCardboardKg) + Number(foodWasteKg);
  const landfillWaste = disposedMethod === "landfill" ? wasteTotal : 0;
  const scope3 = roundMetric(landfillWaste * ESG_FACTORS.landfillWasteKgCo2ePerKg, 2);
  const totalWaste = Number(coffeeGroundsKg) + wasteTotal;
  const recycledWaste = disposedMethod === "recycled_and_composted" ? wasteTotal : 0;
  const diverted = totalWaste > 0 ? ((Number(coffeeGroundsRecycled) + recycledWaste) / totalWaste) * 100 : 0;

  return {
    scope1_kgCO2e: scope1,
    scope2_kgCO2e: scope2,
    scope3_kgCO2e: scope3,
    totalCarbon_kgCO2e: roundMetric(scope1 + scope2 + scope3, 2),
    wasteDivertedFromLandfillPercent: roundMetric(Math.max(0, Math.min(100, diverted)), 1)
  };
}

export function buildYearlyStats(entriesLog = []) {
  const initialBranches = Object.fromEntries(HILLKOFF_BRANCHES.map(branch => [
    branch.id,
    {
      branchId: branch.id,
      branchName: branch.name,
      branchType: branch.type,
      co2: 0,
      totalCarbon_kgCO2e: 0,
      elec: 0,
      fuel: 0,
      wasteKg: 0,
      coffeeGroundsKg: 0,
      entries: 0
    }
  ]));

  return entriesLog.reduce((acc, entry) => {
    const period = entry.period || entry.month || new Date().toISOString().slice(0, 7);
    const year = period.slice(0, 4);
    const branch = getBranchById(entry.branchId);
    const electricityKwh = Number(entry.energyMetrics?.electricityKwh ?? entry.elec ?? 0);
    const fuelLiters = Number(entry.energyMetrics?.fuelLiters ?? entry.fuel ?? 0);
    const totalCarbonKg = Number(entry.calculatedCarbon?.totalCarbon_kgCO2e ?? (Number(entry.co2 || 0) * 1000));
    const co2Tonnes = roundMetric(totalCarbonKg / 1000, 4);
    const wasteKg = Number(entry.wasteMetrics?.plasticKg ?? entry.waste?.recycle ?? 0)
      + Number(entry.wasteMetrics?.paperCardboardKg ?? entry.waste?.general ?? 0)
      + Number(entry.wasteMetrics?.foodWasteKg ?? entry.waste?.organic ?? 0);
    const coffeeGroundsKg = Number(entry.coffeeMetrics?.coffeeGroundsKg ?? 0);

    acc[year] ||= {
      co2: 0,
      totalCarbon_kgCO2e: 0,
      elec: 0,
      fuel: 0,
      wasteKg: 0,
      coffeeGroundsKg: 0,
      entries: 0,
      branches: Object.fromEntries(Object.entries(initialBranches).map(([branchId, stats]) => [branchId, { ...stats }]))
    };

    acc[year].co2 = roundMetric(acc[year].co2 + co2Tonnes, 4);
    acc[year].totalCarbon_kgCO2e = roundMetric(acc[year].totalCarbon_kgCO2e + totalCarbonKg, 2);
    acc[year].elec += electricityKwh;
    acc[year].fuel += fuelLiters;
    acc[year].wasteKg += wasteKg;
    acc[year].coffeeGroundsKg += coffeeGroundsKg;
    acc[year].entries += 1;

    const branchStats = acc[year].branches[branch.id];
    branchStats.co2 = roundMetric(branchStats.co2 + co2Tonnes, 4);
    branchStats.totalCarbon_kgCO2e = roundMetric(branchStats.totalCarbon_kgCO2e + totalCarbonKg, 2);
    branchStats.elec += electricityKwh;
    branchStats.fuel += fuelLiters;
    branchStats.wasteKg += wasteKg;
    branchStats.coffeeGroundsKg += coffeeGroundsKg;
    branchStats.entries += 1;

    return acc;
  }, {});
}
