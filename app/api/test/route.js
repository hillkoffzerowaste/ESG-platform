import { NextResponse } from "next/server";
import { readDashboardState } from "@/lib/googleFirestore";

export async function GET() {
  try {
    const data = await readDashboardState();
    return NextResponse.json({
      success: true,
      source: "firestore",
      data
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      source: "firestore",
      error: error.message || "Firestore test failed"
    });
  }
}
