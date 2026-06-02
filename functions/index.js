const crypto = require("node:crypto");
const admin = require("firebase-admin");
const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const nodemailer = require("nodemailer");

admin.initializeApp();

const OTP_TTL_MS = 5 * 60 * 1000;
const ORGANIZATION_DOMAIN = "@hillkoff.com";
const OTP_COLLECTION = "otpChallenges";
const ORGANIZATION_ONLY_MESSAGE = "\u0e23\u0e30\u0e1a\u0e1a\u0e19\u0e35\u0e49\u0e2d\u0e19\u0e38\u0e0d\u0e32\u0e15\u0e40\u0e09\u0e1e\u0e32\u0e30\u0e04\u0e19\u0e43\u0e19\u0e2d\u0e07\u0e04\u0e4c\u0e01\u0e23 @hillkoff.com \u0e40\u0e17\u0e48\u0e32\u0e19\u0e31\u0e49\u0e19";

function isHillkoffEmail(email) {
  return typeof email === "string" && email.trim().toLowerCase().endsWith(ORGANIZATION_DOMAIN);
}

function getOtpHashSecret() {
  const secret = process.env.OTP_HASH_SECRET;
  if (!secret) {
    throw new Error("Missing OTP_HASH_SECRET");
  }
  return secret;
}

function json(res, status, payload) {
  res.status(status).json(payload);
}

function setCors(req, res) {
  res.set("Access-Control-Allow-Origin", req.get("origin") || "*");
  res.set("Access-Control-Allow-Headers", "Authorization, Content-Type");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
}

async function getSignedInUser(req) {
  const authHeader = req.get("authorization") || "";
  const match = authHeader.match(/^Bearer\s+(.+)$/i);

  if (!match) {
    const error = new Error("Missing Firebase ID token");
    error.status = 401;
    throw error;
  }

  const decoded = await admin.auth().verifyIdToken(match[1]);
  if (!decoded.email) {
    const error = new Error("Firebase user has no email");
    error.status = 400;
    throw error;
  }

  return {
    uid: decoded.uid,
    email: decoded.email.trim().toLowerCase(),
    emailVerified: decoded.email_verified === true
  };
}

function generateOtp() {
  return crypto.randomInt(100000, 1000000).toString();
}

function hashOtp({ uid, email, otp }) {
  return crypto
    .createHmac("sha256", getOtpHashSecret())
    .update(`${uid}:${email}:${otp}`)
    .digest("hex");
}

function challengeRef(uid) {
  return admin.firestore().collection(OTP_COLLECTION).doc(uid);
}

async function saveOtpChallenge({ uid, email, otp }) {
  const now = Date.now();
  const expiresAt = now + OTP_TTL_MS;

  await challengeRef(uid).set({
    uid,
    email,
    otpHash: hashOtp({ uid, email, otp }),
    createdAt: admin.firestore.Timestamp.fromMillis(now),
    expiresAt: admin.firestore.Timestamp.fromMillis(expiresAt),
    consumedAt: null,
    attempts: 0
  });

  return { expiresAt };
}

async function sendOtpEmail({ email, otp }) {
  const url = process.env.SMTP_URL;
  const from = process.env.SMTP_FROM || "Hillkoff ESG <no-reply@hillkoff.com>";

  if (!url) {
    logger.info("OTP email simulation", {
      email,
      otp,
      ttlMinutes: OTP_TTL_MS / 60000
    });
    return { simulated: true };
  }

  const transporter = nodemailer.createTransport(url);
  await transporter.sendMail({
    from,
    to: email,
    subject: "Hillkoff ESG login verification code",
    text: `Your Hillkoff ESG OTP is ${otp}. This code expires in 5 minutes.`,
    html: `<p>Your Hillkoff ESG OTP is <strong>${otp}</strong>.</p><p>This code expires in 5 minutes.</p>`
  });

  return { simulated: false };
}

exports.requestOtp = onRequest(
  {
    region: "asia-southeast1"
  },
  async (req, res) => {
    setCors(req, res);
    if (req.method === "OPTIONS") return res.status(204).send("");
    if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });

    try {
      const user = await getSignedInUser(req);

      if (!isHillkoffEmail(user.email)) {
        return json(res, 403, {
          error: ORGANIZATION_ONLY_MESSAGE
        });
      }

      const otp = generateOtp();
      const { expiresAt } = await saveOtpChallenge({ ...user, otp });
      const delivery = await sendOtpEmail({ email: user.email, otp });

      return json(res, 200, {
        success: true,
        email: user.email,
        expiresInSeconds: OTP_TTL_MS / 1000,
        expiresAt: new Date(expiresAt).toISOString(),
        delivery
      });
    } catch (error) {
      logger.error("requestOtp failed", error);
      return json(res, error.status || 500, {
        error: error.message || "OTP request failed"
      });
    }
  }
);

exports.verifyOtp = onRequest(
  {
    region: "asia-southeast1"
  },
  async (req, res) => {
    setCors(req, res);
    if (req.method === "OPTIONS") return res.status(204).send("");
    if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });

    try {
      const user = await getSignedInUser(req);
      const otp = String(req.body?.otp || "").trim();

      if (!isHillkoffEmail(user.email)) {
        return json(res, 403, {
          error: ORGANIZATION_ONLY_MESSAGE
        });
      }

      if (!/^\d{6}$/.test(otp)) {
        return json(res, 400, { error: "OTP must be a 6-digit number" });
      }

      const ref = challengeRef(user.uid);
      const snapshot = await ref.get();
      if (!snapshot.exists) {
        return json(res, 400, { error: "OTP not found or expired" });
      }

      const challenge = snapshot.data();
      const expiresAtMs = challenge.expiresAt?.toMillis?.() || 0;
      const attempts = Number(challenge.attempts || 0);

      if (challenge.consumedAt) {
        return json(res, 400, { error: "OTP has already been used" });
      }

      if (Date.now() > expiresAtMs) {
        await ref.delete();
        return json(res, 400, { error: "OTP expired" });
      }

      if (attempts >= 5) {
        await ref.delete();
        return json(res, 429, { error: "Too many OTP attempts" });
      }

      const expectedHash = hashOtp({ uid: user.uid, email: user.email, otp });
      if (challenge.otpHash !== expectedHash) {
        await ref.update({ attempts: attempts + 1 });
        return json(res, 400, { error: "Invalid OTP" });
      }

      await ref.update({
        consumedAt: admin.firestore.FieldValue.serverTimestamp(),
        attempts: attempts + 1
      });

      const authUser = await admin.auth().getUser(user.uid);
      await admin.auth().setCustomUserClaims(user.uid, {
        ...(authUser.customClaims || {}),
        hillkoffOtpVerified: true,
        hillkoffOtpVerifiedAt: Math.floor(Date.now() / 1000)
      });

      return json(res, 200, {
        success: true,
        email: user.email,
        message: "OTP verified"
      });
    } catch (error) {
      logger.error("verifyOtp failed", error);
      return json(res, error.status || 500, {
        error: error.message || "OTP verification failed"
      });
    }
  }
);
