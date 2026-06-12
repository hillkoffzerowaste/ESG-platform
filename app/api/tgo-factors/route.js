import { NextResponse } from "next/server";
import { STATIONARY_FUELS, MOBILE_VEHICLES, GRID_AREAS, WASTE_TYPES, WASTEWATER_METHODS, REFRIGERANTS, COMMON_FUELS } from "@/lib/tgoFactors";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");

  const data = {
    gwp: { CO2: 1, "Fossil CH4": 30, CH4: 28, N2O: 265 },
    stationary: STATIONARY_FUELS,
    mobile: MOBILE_VEHICLES,
    electricity: GRID_AREAS,
    waste: WASTE_TYPES,
    wastewater: WASTEWATER_METHODS,
    refrigerants: REFRIGERANTS,
    commonFuels: Object.entries(COMMON_FUELS).map(([id, info]) => ({ id, ...info })),
  };

  if (category && data[category]) {
    return NextResponse.json({ success: true, category, factors: data[category] });
  }

  return NextResponse.json({ success: true, ...data });
}