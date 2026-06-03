import { NextResponse } from "next/server";
import {
  createCollectionDocument,
  readCollectionDocuments,
  readDashboardState,
  upsertCollectionDocument,
  writeDashboardState
} from "@/lib/googleFirestore";
import {
  BRANCH_ID_SET,
  buildYearlyStats,
  calculateCarbonMetrics,
  getBranchById,
  getCanonicalBranchId
} from "@/lib/esgMasterData";

const sortDeep = value => {
  if (Array.isArray(value)) return value.map(sortDeep);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.keys(value).sort().map(key => [key, sortDeep(value[key])]));
};

const stableJson = value => JSON.stringify(sortDeep(value || {}));

const toNumber = value => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

function normalizeEntry(entry = {}) {
  const branchId = getCanonicalBranchId(entry.branchId);
  if (!BRANCH_ID_SET.has(branchId)) {
    throw new Error(`Invalid branchId: ${entry.branchId}`);
  }

  const branch = getBranchById(branchId);
  const period = entry.period || entry.month || new Date().toISOString().slice(0, 7);
  const coffeeGroundsKg = toNumber(entry.coffeeMetrics?.coffeeGroundsKg ?? entry.waste?.organic ?? 0);
  const coffeeGroundsRecycled = toNumber(entry.coffeeMetrics?.coffeeGroundsRecycled ?? coffeeGroundsKg);
  const plasticKg = toNumber(entry.wasteMetrics?.plasticKg ?? entry.waste?.recycle ?? 0);
  const paperCardboardKg = toNumber(entry.wasteMetrics?.paperCardboardKg ?? entry.waste?.general ?? 0);
  const foodWasteKg = toNumber(entry.wasteMetrics?.foodWasteKg ?? entry.waste?.organic ?? 0);
  const disposedMethod = entry.wasteMetrics?.disposedMethod || (toNumber(entry.waste?.hazard) > 0 ? "landfill" : "recycled_and_composted");
  const electricityKwh = toNumber(entry.energyMetrics?.electricityKwh ?? entry.elec ?? 0);
  const lpgKg = toNumber(entry.energyMetrics?.lpgKg ?? (entry.fuelType === "lpg" ? entry.fuel : 0));
  const fuelLiters = toNumber(entry.energyMetrics?.fuelLiters ?? (entry.fuelType === "lpg" ? 0 : entry.fuel ?? 0));
  const calculatedCarbon = calculateCarbonMetrics({
    coffeeGroundsKg,
    coffeeGroundsRecycled,
    plasticKg,
    paperCardboardKg,
    foodWasteKg,
    disposedMethod,
    electricityKwh,
    lpgKg,
    fuelLiters
  });
  const id = entry.id || `${period}-${branchId}-${Date.now()}`;

  return {
    ...entry,
    id,
    branchId,
    branchName: branch.name,
    period,
    month: period,
    recordedAt: entry.recordedAt || entry.createdAt || new Date().toISOString(),
    recordedBy: entry.recordedBy || entry.user?.id || entry.userId || "unknown",
    coffeeMetrics: {
      coffeeGroundsKg,
      coffeeGroundsRecycled,
      coffeeChaffKg: toNumber(entry.coffeeMetrics?.coffeeChaffKg),
      cascaraKg: toNumber(entry.coffeeMetrics?.cascaraKg)
    },
    wasteMetrics: {
      plasticKg,
      paperCardboardKg,
      foodWasteKg,
      disposedMethod
    },
    energyMetrics: {
      electricityKwh,
      lpgKg,
      fuelLiters
    },
    calculatedCarbon,
    evidenceUrl: entry.evidenceUrl || entry.documents?.[0]?.reference || "",
    isVerified: Boolean(entry.isVerified),
    elec: electricityKwh,
    fuel: lpgKg + fuelLiters,
    co2: toNumber(entry.co2 || calculatedCarbon.totalCarbon_kgCO2e / 1000)
  };
}

function normalizeState(state = {}) {
  const entriesLog = (Array.isArray(state.entriesLog) ? state.entriesLog : []).map(normalizeEntry);
  return {
    ...state,
    entriesLog,
    yearlyStats: buildYearlyStats(entriesLog),
    savedAt: new Date().toISOString()
  };
}

export async function GET() {
  try {
    const state = await readDashboardState();
    const entryDocuments = await readCollectionDocuments("entriesLog").catch(() => []);
    const entriesLog = entryDocuments.length ? entryDocuments : state?.entriesLog;
    const data = state
      ? {
          ...state,
          entriesLog,
          yearlyStats: buildYearlyStats(entriesLog || [])
        }
      : (entryDocuments.length ? { entriesLog: entryDocuments, yearlyStats: buildYearlyStats(entryDocuments) } : null);

    return NextResponse.json({
      success: true,
      source: "firestore",
      savedAt: data?.savedAt || null,
      data
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        source: "firestore",
        savedAt: null,
        data: null,
        error: error.message || "Dashboard read failed"
      },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const state = await req.json();
    const beforeState = await readDashboardState().catch(() => null);
    const beforeEntries = new Map((beforeState?.entriesLog || []).map(entry => [entry.id, entry]));
    const savedState = normalizeState(state);

    await writeDashboardState(savedState);
    await Promise.all((savedState.entriesLog || []).map(entry => upsertCollectionDocument("entriesLog", entry.id, entry)));
    await Promise.all(Object.entries(savedState.yearlyStats || {}).map(([year, stats]) => upsertCollectionDocument("yearlyStats", year, { year, ...stats, updatedAt: savedState.savedAt })));

    const auditEntries = (savedState.entriesLog || [])
      .map(entry => {
        const before = beforeEntries.get(entry.id);
        if (before && stableJson(before) === stableJson(entry)) return null;
        return {
          action: before ? "UPDATE_ENTRY" : "CREATE_ENTRY",
          entryId: entry.id,
          timestamp: savedState.savedAt,
          userId: entry.recordedBy || "unknown",
          userEmail: entry.user?.email || state.userProfile?.email || "unknown",
          changes: {
            before: before || {},
            after: entry
          }
        };
      })
      .filter(Boolean);

    await Promise.all(auditEntries.map(audit => createCollectionDocument("auditLogs", audit)));

    return NextResponse.json({
      success: true,
      source: "firestore",
      savedAt: savedState.savedAt,
      firestore: "fulfilled",
      mirroredCollections: {
        entriesLog: savedState.entriesLog?.length || 0,
        auditLogs: auditEntries.length,
        yearlyStats: Object.keys(savedState.yearlyStats || {}).length
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, source: "firestore", error: error.message || "Dashboard write failed" },
      { status: 500 }
    );
  }
}
