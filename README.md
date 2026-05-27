# Hillkoff Zero Waste Analytics

Next.js app for ESG, Carbon Footprint, Zero Waste dashboards, executive reporting, and AI chat.

## Run

```powershell
npm install
$env:OPENAI_API_KEY="your OpenAI API key"
$env:OPENAI_MODEL="gpt-4.1-mini"
$env:GEMINI_API_KEY="your Gemini API key"
$env:GEMINI_MODEL="gemini-2.5-flash"
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

## Files

- `app/page.jsx` - main dashboard UI.
- `app/login/page.js` - Firebase email/password and Google login.
- `app/register/page.js` - Firebase email/password registration.
- `app/api/dashboard/route.js` - dashboard read/write API backed by Firestore.
- `app/api/ai-chat/route.js` - OpenAI Responses API route.
- `app/api/gemini/route.js` - Gemini API route.
- `lib/firebase.js` - Firebase client setup.
- `lib/googleFirestore.js` - Firestore REST helper.
- `app/layout.jsx` - metadata and root layout.
- `package.json` - scripts and dependencies.
