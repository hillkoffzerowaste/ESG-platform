import { readDashboardState, writeDashboardState } from "../../../lib/googleFirestore";

export async function GET() {
  try {
    const state = await readDashboardState();
    return Response.json({ ok: true, state });
  } catch (error) {
    return Response.json({ ok: false, error: error.message || "Dashboard read failed" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const state = await req.json();
    await writeDashboardState(state);
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ ok: false, error: error.message || "Dashboard write failed" }, { status: 500 });
  }
}
