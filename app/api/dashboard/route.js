import { NextResponse } from "next/server";
import { readDashboardState, writeDashboardState } from "@/lib/googleFirestore";

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
    await writeDashboardState(savedState);

    return NextResponse.json({
      success: true,
      source: "firestore",
      savedAt: savedState.savedAt,
      firestore: "fulfilled"
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, source: "firestore", error: error.message || "Dashboard write failed" },
      { status: 500 }
    );
  }
}
