import { NextResponse } from "next/server";
import { readDashboardState, writeDashboardState } from "@/lib/googleFirestore";

export async function GET() {
  try {
    const state = await readDashboardState();
    return NextResponse.json({ success: true, data: state });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || "Dashboard read failed" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const state = await req.json();
    await writeDashboardState({
      ...state,
      savedAt: new Date().toISOString()
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || "Dashboard write failed" },
      { status: 500 }
    );
  }
}
