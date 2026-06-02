const FUNCTIONS_REGION = process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_REGION || "asia-southeast1";

function functionsBaseUrl() {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) {
    throw new Error("Missing NEXT_PUBLIC_FIREBASE_PROJECT_ID");
  }
  return `https://${FUNCTIONS_REGION}-${projectId}.cloudfunctions.net`;
}

function functionUrl(name) {
  const envName = name === "requestOtp" ? "NEXT_PUBLIC_REQUEST_OTP_URL" : "NEXT_PUBLIC_VERIFY_OTP_URL";
  const legacyEnvName = `NEXT_PUBLIC_${name.toUpperCase()}_URL`;
  const override = process.env[envName] || process.env[legacyEnvName];
  return override || `${functionsBaseUrl()}/${name}`;
}

async function callOtpFunction({ name, token, body }) {
  const response = await fetch(functionUrl(name), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body || {})
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.error || `${name} failed`);
  }

  return data;
}

export async function requestOtpForUser(user) {
  const token = await user.getIdToken();
  return callOtpFunction({ name: "requestOtp", token });
}

export async function verifyOtpForUser(user, otp) {
  const token = await user.getIdToken();
  const result = await callOtpFunction({ name: "verifyOtp", token, body: { otp } });
  await user.getIdToken(true);
  return result;
}

export async function hasOtpClaim(user) {
  const token = await user.getIdTokenResult(true);
  return token.claims?.hillkoffOtpVerified === true;
}
