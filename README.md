# Hillkoff Zero Waste Analytics

Next.js app for ESG, Carbon Footprint, Zero Waste dashboards, executive reporting, and AI chat.

## Run

```powershell
npm install
$env:GEMINI_API_KEY="your Gemini API key"
$env:GEMINI_MODEL="gemini-2.5-flash-lite"
$env:NEXT_PUBLIC_FIREBASE_API_KEY="Firebase web API key"
$env:NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
$env:NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
$env:NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
$env:NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
$env:NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"
$env:NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="your-measurement-id"
$env:GOOGLE_SERVICE_ACCOUNT_JSON="Firebase service account JSON for Firestore REST API"
npm run dev
```

Open `http://localhost:3000`.

## Firebase

- Client auth uses Firebase Authentication from `lib/firebase.js`.
- Dashboard persistence uses Firestore through `lib/googleFirestore.js`.
- Enable Email/Password and Google providers in Firebase Authentication before testing login flows.
- `GOOGLE_SERVICE_ACCOUNT_JSON_BASE64` can be used instead of `GOOGLE_SERVICE_ACCOUNT_JSON` for server-side Firestore access.
- Dashboard data is not persisted with `localStorage`; reads and writes go through `/api/dashboard` backed by Firestore.
- Use `/api/firebase-health` to verify Firestore read access, and `POST /api/firebase-health` to verify a harmless write to `_health/connection`.

## Gemini AI

- Set `GEMINI_API_KEY` in the local environment and in Firebase runtime environment variables.
- `GOOGLE_API_KEY` and `GOOGLE_GENERATIVE_AI_API_KEY` are accepted as fallback names, but `GEMINI_API_KEY` is preferred.
- Use `/api/ai-health` to verify that the key and selected model can reach Gemini.

## Firebase Cloud Functions OTP

- `functions/index.js` exposes `requestOtp` and `verifyOtp`.
- Both endpoints require `Authorization: Bearer <Firebase ID token>` from the frontend Google login.
- `requestOtp` rejects non-`@hillkoff.com` users with HTTP 403, then creates a 6-digit OTP that expires in 5 minutes.
- OTP records are stored in Firestore collection `otpChallenges` as a hash, not as plain text.
- `verifyOtp` checks the code, deletes expired challenges, limits failed attempts, and sets Firebase custom claims:
  - `hillkoffOtpVerified: true`
  - `hillkoffOtpVerifiedAt: <unix seconds>`

Set Cloud Functions secrets:

```powershell
firebase functions:secrets:set OTP_HASH_SECRET
```

`SMTP_URL` and `SMTP_FROM` are optional environment variables for Nodemailer. If `SMTP_URL` is blank, the function logs the OTP instead of sending email. For production, use an SMTP URL supported by Nodemailer.

## Files

- `app/page.jsx` - main dashboard UI.
- `app/login/page.js` - Firebase email/password and Google login.
- `app/register/page.js` - Firebase email/password registration.
- `app/api/dashboard/route.js` - dashboard read/write API backed by Firestore.
- `app/api/ai-chat/route.js` - primary Gemini-backed AI chat route.
- `app/api/gemini/route.js` - compatibility Gemini API route.
- `app/api/ai-health/route.js` - Gemini API health check.
- `app/api/firebase-health/route.js` - Firebase/Firestore health check.
- `functions/index.js` - Firebase Cloud Functions for Hillkoff-only OTP request/verification.
- `lib/firebase.js` - Firebase client setup.
- `lib/googleFirestore.js` - Firestore REST helper.
- `lib/gemini.js` - shared Gemini API helper and model fallback logic.
- `app/layout.jsx` - metadata and root layout.
- `package.json` - scripts and dependencies.
