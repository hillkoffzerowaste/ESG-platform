# Code Map

Quick map for future fixes in the Hillkoff Zero Waste Analytics app.

## Runtime

- `package.json` - Next.js scripts and dependencies.
- `next.config.mjs` - Next.js config.
- `app/layout.jsx` - root metadata and layout wrapper.
- `app/globals.css` - global CSS loaded by the app.

## Main Dashboard

- `app/page.jsx` - main client dashboard, navigation, data entry, analytics, reports, settings, and AI panel.
- Key state in `app/page.jsx`:
  - `branches`, `monthlyCo2`, `yearlyStats`, `entriesLog` - dashboard operational data.
  - `loginHistory`, `userProfile` - settings/user metadata.
  - `databaseStatus` - UI status for Firestore connection.
- Persistence flow:
  - Load: `useEffect` calls `GET /api/dashboard`.
  - Save: state changes debounce into `POST /api/dashboard`.
  - No dashboard persistence should use `localStorage` or `sessionStorage`.

## Firebase

- `lib/firebase.js` - Firebase browser SDK setup for Auth and Firestore client config.
- `lib/googleFirestore.js` - server-side Firestore REST helper using `GOOGLE_SERVICE_ACCOUNT_JSON_BASE64` or `GOOGLE_SERVICE_ACCOUNT_JSON`.
- `app/api/dashboard/route.js` - Firestore-backed dashboard read/write API.
- `app/api/test/route.js` - simple Firestore read test.
- `app/api/firebase-health/route.js` - Firestore config/read health check; `POST` writes only to `_health/connection`.
- `app/login/page.js` - Firebase email/password and Google sign-in.
- `app/register/page.js` - Firebase email/password registration and email verification.
- `app/auth/callback/page.js` - redirect callback support.

## Firebase Cloud Functions OTP

- `firebase.json` - points Firebase Functions to `functions/`.
- `functions/package.json` - Cloud Functions dependencies and deploy scripts.
- `functions/index.js` - OTP request and verification endpoints.
- `requestOtp`:
  - Verifies Firebase ID token from `Authorization: Bearer <token>`.
  - Uses token email as source of truth.
  - Rejects users outside `@hillkoff.com` with HTTP 403.
  - Generates 6-digit OTP with 5-minute TTL.
  - Stores hash in Firestore `otpChallenges/{uid}`.
  - Sends via Nodemailer when `SMTP_URL` is set; otherwise logs a simulation.
- `verifyOtp`:
  - Verifies Firebase ID token again.
  - Checks 6-digit code, expiry, consumed state, and max attempts.
  - Sets custom claims `hillkoffOtpVerified` and `hillkoffOtpVerifiedAt`.
  - Frontend should refresh the ID token after success.

## Gemini AI

- `lib/gemini.js` - shared Gemini API key lookup, model fallback list, and request helper.
- `app/api/ai-chat/route.js` - primary AI chat endpoint used by the dashboard.
- `app/api/gemini/route.js` - compatibility Gemini endpoint.
- `app/api/ai-health/route.js` - live Gemini health check.
- Required env:
  - `GEMINI_API_KEY` preferred.
  - `GOOGLE_API_KEY` and `GOOGLE_GENERATIVE_AI_API_KEY` are fallback names.
  - `GEMINI_MODEL` optional; defaults through `lib/gemini.js`.

## Documents

- `app/api/document-analyze/route.js` - parses uploaded CSV/XLSX/PDF evidence and extracts dashboard metrics.
- Dependencies:
  - `exceljs` for Excel parsing.
  - `pdf-parse` for PDF text extraction.

## Reports

- Report definitions and export helpers live in `app/page.jsx`.
- Search for:
  - `REPORT_DETAILS` - report option metadata.
  - `projectWhitepaper` and `WHITE_PAPER_HTML` - white paper content.
  - `createReportHtml` - generated report HTML.
  - `downloadReport` - report file export logic.

## Environment Checklist

- Firebase browser config:
  - `NEXT_PUBLIC_FIREBASE_API_KEY`
  - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
  - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
  - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
  - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
  - `NEXT_PUBLIC_FIREBASE_APP_ID`
  - `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`
- Firestore server access:
  - `GOOGLE_SERVICE_ACCOUNT_JSON_BASE64` or `GOOGLE_SERVICE_ACCOUNT_JSON`
  - `GOOGLE_FIRESTORE_PROJECT_ID` only if overriding the service account project.
- Gemini:
  - `GEMINI_API_KEY`
  - `GEMINI_MODEL`
- Cloud Functions OTP secrets:
  - `OTP_HASH_SECRET`
  - Optional `SMTP_URL`
  - Optional `SMTP_FROM`

## Useful Checks

- Find forbidden browser persistence:
  - `rg -n "localStorage|sessionStorage|indexedDB" app lib`
- Check Gemini route:
  - `GET /api/ai-health`
- Check Firestore route:
  - `GET /api/firebase-health`
- Build:
  - `npm run build`
- Functions syntax:
  - `cd functions`
  - `npm run lint`
