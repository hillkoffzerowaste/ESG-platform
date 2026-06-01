import { getFirestoreConfigStatus, readDashboardState, writeFirestoreHealthCheck } from "@/lib/googleFirestore";

export async function GET() {
  try {
    const config = getFirestoreConfigStatus();
    const data = await readDashboardState();

    return Response.json({
      ok: true,
      config,
      firestore: {
        connected: true,
        source: "firestore",
        canRead: true,
        hasDashboardDocument: Boolean(data),
        savedAt: data?.savedAt || null
      },
      browserStorage: {
        usedForDashboardPersistence: false
      }
    });
  } catch (error) {
    return Response.json({
      ok: false,
      config: safeConfigStatus(),
      firestore: {
        connected: false,
        source: "firestore",
        canRead: false,
        error: error.message || "Firestore health check failed"
      },
      browserStorage: {
        usedForDashboardPersistence: false
      }
    }, { status: 500 });
  }
}

export async function POST() {
  try {
    const config = getFirestoreConfigStatus();
    const probe = await writeFirestoreHealthCheck();

    return Response.json({
      ok: true,
      config,
      firestore: {
        connected: true,
        source: "firestore",
        canRead: true,
        canWrite: true,
        checkedAt: probe.checkedAt
      },
      browserStorage: {
        usedForDashboardPersistence: false
      }
    });
  } catch (error) {
    return Response.json({
      ok: false,
      config: safeConfigStatus(),
      firestore: {
        connected: false,
        source: "firestore",
        canWrite: false,
        error: error.message || "Firestore write health check failed"
      },
      browserStorage: {
        usedForDashboardPersistence: false
      }
    }, { status: 500 });
  }
}

function safeConfigStatus() {
  try {
    return getFirestoreConfigStatus();
  } catch (error) {
    return {
      ok: false,
      error: error.message || "Invalid Firestore config",
      hasBase64: Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_JSON_BASE64),
      hasJson: Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_JSON)
    };
  }
}
