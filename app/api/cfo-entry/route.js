import { NextResponse } from "next/server";
import { createCollectionDocument, readCollectionDocuments, upsertCollectionDocument } from "@/lib/googleFirestore";

export async function GET() {
  try {
    const entries = await readCollectionDocuments("cfoEntries").catch(() => []);
    return NextResponse.json({ success: true, entries });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const entry = await req.json();
    const id = `cfo-${entry.reportingYear || Date.now()}-${Date.now()}`;
    const saved = {
      ...entry,
      id,
      savedAt: new Date().toISOString(),
    };

    await createCollectionDocument("cfoEntries", saved);
    await upsertCollectionDocument("cfoEntries", id, saved);

    return NextResponse.json({ success: true, id, savedAt: saved.savedAt });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}