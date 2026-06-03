import crypto from "node:crypto";

const FIRESTORE_SCOPE = "https://www.googleapis.com/auth/datastore";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_API_TIMEOUT_MS = 15000;

function getServiceAccount() {
  const rawValue = process.env.GOOGLE_SERVICE_ACCOUNT_JSON_BASE64
    ? Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_JSON_BASE64, "base64").toString("utf8")
    : process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!rawValue) {
    throw new Error("Missing GOOGLE_SERVICE_ACCOUNT_JSON");
  }

  try {
    const raw = rawValue.trim().replace(/^(['"])([\s\S]*)\1$/, "$2");
    const serviceAccount = JSON.parse(raw);
    if (typeof serviceAccount.private_key === "string") {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
    }
    return serviceAccount;
  } catch {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON must be valid JSON");
  }
}

export function getFirestoreConfigStatus() {
  const hasBase64 = Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_JSON_BASE64);
  const hasJson = Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
  const serviceAccount = hasBase64 || hasJson ? getServiceAccount() : null;
  const projectId = process.env.GOOGLE_FIRESTORE_PROJECT_ID || serviceAccount?.project_id || "";

  return {
    ok: Boolean(serviceAccount?.client_email && serviceAccount?.private_key && projectId),
    hasBase64,
    hasJson,
    hasClientEmail: Boolean(serviceAccount?.client_email),
    hasPrivateKey: Boolean(serviceAccount?.private_key),
    projectId,
    database: "(default)",
    collection: "dashboards",
    documentId: "hillkoff"
  };
}

function base64Url(input) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function signJwt(serviceAccount) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: serviceAccount.client_email,
    scope: FIRESTORE_SCOPE,
    aud: TOKEN_URL,
    iat: now,
    exp: now + 3600
  };
  const unsigned = `${base64Url(JSON.stringify(header))}.${base64Url(JSON.stringify(payload))}`;
  const signer = crypto.createSign("RSA-SHA256");
  signer.update(unsigned);
  signer.end();
  const signature = signer
    .sign(serviceAccount.private_key)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return `${unsigned}.${signature}`;
}

async function getAccessToken(serviceAccount) {
  const assertion = signJwt(serviceAccount);
  const response = await fetch(TOKEN_URL, {
    method: "POST",
    signal: AbortSignal.timeout(GOOGLE_API_TIMEOUT_MS),
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion
    })
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error_description || data?.error || "Google token request failed");
  }
  return data.access_token;
}

function documentUrl(serviceAccount, collection = "dashboards", documentId = "hillkoff") {
  const projectId = process.env.GOOGLE_FIRESTORE_PROJECT_ID || serviceAccount.project_id;
  if (!projectId) {
    throw new Error("Missing Google project id");
  }
  return `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collection}/${documentId}`;
}

function collectionUrl(serviceAccount, collection = "dashboards") {
  const projectId = process.env.GOOGLE_FIRESTORE_PROJECT_ID || serviceAccount.project_id;
  if (!projectId) {
    throw new Error("Missing Google project id");
  }
  return `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collection}`;
}

function toFirestoreValue(value) {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === "boolean") return { booleanValue: value };
  if (typeof value === "number") {
    return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  }
  if (typeof value === "string") {
    if (/^\d{4}-\d{2}-\d{2}T/.test(value)) return { timestampValue: value };
    return { stringValue: value };
  }
  if (Array.isArray(value)) {
    return { arrayValue: { values: value.map(toFirestoreValue) } };
  }
  if (typeof value === "object") {
    return {
      mapValue: {
        fields: Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, toFirestoreValue(nested)]))
      }
    };
  }
  return { stringValue: String(value) };
}

function fromFirestoreValue(value = {}) {
  if ("nullValue" in value) return null;
  if ("booleanValue" in value) return value.booleanValue;
  if ("integerValue" in value) return Number(value.integerValue);
  if ("doubleValue" in value) return Number(value.doubleValue);
  if ("timestampValue" in value) return value.timestampValue;
  if ("stringValue" in value) return value.stringValue;
  if ("arrayValue" in value) return (value.arrayValue.values || []).map(fromFirestoreValue);
  if ("mapValue" in value) {
    return Object.fromEntries(Object.entries(value.mapValue.fields || {}).map(([key, nested]) => [key, fromFirestoreValue(nested)]));
  }
  return null;
}

function firestoreFieldsFromObject(value) {
  return Object.fromEntries(Object.entries(value || {}).map(([key, nested]) => [key, toFirestoreValue(nested)]));
}

function objectFromFirestoreFields(fields = {}) {
  return Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, fromFirestoreValue(value)]));
}

async function firestoreRequest(url, options = {}) {
  const serviceAccount = getServiceAccount();
  const token = await getAccessToken(serviceAccount);
  const response = await fetch(url(serviceAccount), {
    signal: AbortSignal.timeout(GOOGLE_API_TIMEOUT_MS),
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {})
    }
  });

  if (response.status === 404) return null;
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || "Firestore request failed");
  }
  return data;
}

export async function readDashboardState() {
  const serviceAccount = getServiceAccount();
  const token = await getAccessToken(serviceAccount);
  const response = await fetch(documentUrl(serviceAccount), {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(GOOGLE_API_TIMEOUT_MS),
    cache: "no-store"
  });

  if (response.status === 404) return null;

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || "Firestore read failed");
  }

  const payload = data?.fields?.payload?.stringValue;
  return payload ? JSON.parse(payload) : null;
}

export async function writeDashboardState(state) {
  const serviceAccount = getServiceAccount();
  const token = await getAccessToken(serviceAccount);
  const response = await fetch(documentUrl(serviceAccount), {
    method: "PATCH",
    signal: AbortSignal.timeout(GOOGLE_API_TIMEOUT_MS),
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      fields: {
        payload: { stringValue: JSON.stringify(state) },
        updatedAt: { timestampValue: new Date().toISOString() }
      }
    })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || "Firestore write failed");
  }
  return data;
}

export async function readCollectionDocuments(collection) {
  const data = await firestoreRequest(serviceAccount => collectionUrl(serviceAccount, collection), {
    cache: "no-store"
  });
  return (data?.documents || []).map(document => ({
    id: document.name?.split("/").pop(),
    ...objectFromFirestoreFields(document.fields || {})
  }));
}

export async function upsertCollectionDocument(collection, documentId, payload) {
  return firestoreRequest(serviceAccount => documentUrl(serviceAccount, collection, encodeURIComponent(documentId)), {
    method: "PATCH",
    body: JSON.stringify({ fields: firestoreFieldsFromObject(payload) })
  });
}

export async function createCollectionDocument(collection, payload) {
  return firestoreRequest(serviceAccount => collectionUrl(serviceAccount, collection), {
    method: "POST",
    body: JSON.stringify({ fields: firestoreFieldsFromObject(payload) })
  });
}

export async function writeFirestoreHealthCheck() {
  const serviceAccount = getServiceAccount();
  const token = await getAccessToken(serviceAccount);
  const checkedAt = new Date().toISOString();
  const response = await fetch(documentUrl(serviceAccount, "_health", "connection"), {
    method: "PATCH",
    signal: AbortSignal.timeout(GOOGLE_API_TIMEOUT_MS),
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      fields: {
        checkedAt: { timestampValue: checkedAt },
        status: { stringValue: "ok" }
      }
    })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || "Firestore health write failed");
  }

  return { checkedAt, data };
}
