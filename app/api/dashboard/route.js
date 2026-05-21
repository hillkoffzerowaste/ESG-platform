import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { readDashboardState, writeDashboardState } from "@/lib/googleFirestore";

function getSupabaseServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/rest\/v1\/?$/, "");
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) return null;
  return createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

async function writeSupabaseReportSnapshot(state) {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    throw new Error("Missing Supabase URL or key");
  }

  const totalCo2 = (state?.branches || []).reduce((sum, branch) => sum + Number(branch?.co2 || 0), 0);
  const totalEntries = (state?.branches || []).reduce((sum, branch) => sum + Number(branch?.entries || 0), 0);
  const userId = state?.userProfile?.id || "00000000-0000-0000-0000-000000000000";
  const rows = [
    { user_id: userId, category: "dashboard_total_co2", value: Number(totalCo2.toFixed(4)) },
    { user_id: userId, category: "dashboard_total_entries", value: totalEntries }
  ];

  const { error } = await supabase.from("esg_reports").insert(rows);
  if (error) {
    throw new Error(error.message || "Supabase esg_reports write failed");
  }
}

export async function GET() {
  try {
    const state = await readDashboardState();
    return NextResponse.json({
      success: true,
      source: "firestore",
      savedAt: state?.savedAt || null,
      data: state
    });
  } catch (error) {
    return NextResponse.json({
      success: true,
      source: "local",
      savedAt: null,
      data: null,
      warning: error.message || "Dashboard read failed"
    });
  }
}

export async function POST(req) {
  try {
    const state = await req.json();
    const savedState = {
      ...state,
      savedAt: new Date().toISOString()
    };
    const results = await Promise.allSettled([
      writeDashboardState(savedState),
      writeSupabaseReportSnapshot(savedState)
    ]);
    const [firestoreResult, supabaseResult] = results;
    const saved = results.some(result => result.status === "fulfilled");

    if (!saved) {
      throw new Error(results.map(result => result.reason?.message).filter(Boolean).join("; ") || "Dashboard write failed");
    }

    return NextResponse.json({
      success: true,
      source: firestoreResult.status === "fulfilled" ? "firestore" : "supabase",
      savedAt: savedState.savedAt,
      firestore: firestoreResult.status,
      supabase: supabaseResult.status,
      warning: firestoreResult.status === "rejected" ? firestoreResult.reason?.message : undefined
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, source: "firestore", error: error.message || "Dashboard write failed" },
      { status: 500 }
    );
  }
}
