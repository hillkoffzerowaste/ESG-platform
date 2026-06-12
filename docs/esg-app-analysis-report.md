# รายงานการวิเคราะห์โครงการ ESG Platform — Hillkoff Zero Waste Analytics

**วันที่จัดทำ:** 11 มิถุนายน 2569  
**เวอร์ชัน:** 1.0 (อ้างอิงโค้ดล่าสุด)

---

## สารบัญ

1. [ภาพรวมโครงการ](#1-ภาพรวมโครงการ)
2. [สถาปัตยกรรมระบบ](#2-สถาปัตยกรรมระบบ)
3. [เทคโนโลยีที่ใช้ (Tech Stack)](#3-เทคโนโลยีที่ใช้-tech-stack)
4. [โครงสร้างโปรเจค](#4-โครงสร้างโปรเจค)
5. [ระบบ Authentication และความปลอดภัย](#5-ระบบ-authentication-และความปลอดภัย)
6. [Dashboard หลัก (app/page.jsx)](#6-dashboard-หลัก-apppagejsx)
7. [ระบบรายงานอัตโนมัติ](#7-ระบบรายงานอัตโนมัติ)
8. [AI Chat Assistant](#8-ai-chat-assistant)
9. [API Routes ทั้งหมด](#9-api-routes-ทั้งหมด)
10. [Data Layer และการจัดเก็บข้อมูล](#10-data-layer-และการจัดเก็บข้อมูล)
11. [ระบบ OTP (Firebase Cloud Functions)](#11-ระบบ-otp-firebase-cloud-functions)
12. [Emission Factor และหลักคำนวณ Carbon](#12-emission-factor-และหลักคำนวณ-carbon)
13. [คู่มือการติดตั้งและรัน](#13-คู่มือการติดตั้งและรัน)
14. [แผนผังการไหลของข้อมูล](#14-แผนผังการไหลของข้อมูล)
15. [ข้อแนะนำสำหรับผู้ดูแลระบบ](#15-ข้อแนะนำสำหรับผู้ดูแลระบบ)

---

## 1. ภาพรวมโครงการ

**Hillkoff Zero Waste Analytics** เป็นแพลตฟอร์มเว็บแอปพลิเคชันที่พัฒนาด้วย **Next.js** สำหรับจัดการข้อมูล ESG (Environmental, Social, Governance), Carbon Footprint, และ Zero Waste สำหรับกลุ่มบริษัท Hillkoff ซึ่งมี 6 สาขาหลัก

### วัตถุประสงค์หลัก

1. **รวบรวมข้อมูลการใช้ทรัพยากรรายสาขา** — ไฟฟ้า น้ำ เชื้อเพลิง ขยะ และการเบิกใช้วัสดุ
2. **คำนวณ Carbon Footprint** — แยกตาม Scope 1, 2, 3 ตามมาตรฐาน GHG Protocol
3. **จัดอันดับสาขา (Ranking)** — ด้วย Sustainability Score
4. **สร้างรายงานอัตโนมัติ** — ESG Report, Carbon Report, TCFD, Monthly, Branch Comparison
5. **AI Chat Assistant** — ถาม-ตอบข้อมูล ESG และ Carbon โดยใช้ Gemini AI
6. **Zero Waste Tracking** — ติดตามอัตราการรีไซเคิลและขยะอินทรีย์

### 6 สาขาในระบบ

| รหัส | ชื่อสาขา | ชื่ออังกฤษ | ประเภท |
|------|---------|-----------|--------|
| br_hq | สำนักงานใหญ่ | HQ | Office & Main |
| br_chang_phuak | สาขาช้างเผือก | Chang Phuak | Cafe & Store |
| br_mahidol | สาขามหิดล | Mahidol | Cafe & Store |
| br_pa_phaeng | สาขาป่าแพ่ง | Pa Phaeng | Cafe & Store |
| br_thap_duea | สาขาทับเดื่อ | Thap Duea | Processing & Roastery |
| br_ratika | สาขาราติก้า | Ratika | Roastery & Distribution |

---

## 2. สถาปัตยกรรมระบบ

```
┌─────────────────────────────────────────────┐
│              Client Browser                  │
│  Next.js App (React) + Tailwind CSS         │
│  - 6 Pages: Home, Upload, Analytics,        │
│    Ranking, Reports, Settings               │
│  - AI Panel (Chat)                          │
│  - Bottom Navigation / Sidebar (Desktop)    │
└─────────────┬───────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────┐
│          Next.js API Routes                 │
│  ┌──────────┐ ┌──────────┐ ┌─────────────┐ │
│  │Dashboard │ │ AI Chat  │ │ Document    │ │
│  │/api/     │ │/api/ai-  │ │ Analyze     │ │
│  │dashboard │ │chat      │ │/api/doc...  │ │
│  ├──────────┤ ├──────────┤ ├─────────────┤ │
│  │Gemini    │ │AI Health │ │Firebase     │ │
│  │/api/     │ │/api/ai-  │ │Health       │ │
│  │gemini    │ │health    │ │/api/fire... │ │
│  └──────────┘ └──────────┘ └─────────────┘ │
└─────────────┬───────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────┐
│         Google Firebase / Firestore         │
│  - Firebase Authentication (Google Sign-In) │
│  - Firestore Database                       │
│    collections: dashboards, entriesLog,     │
│    yearlyStats, auditLogs, otpChallenges    │
└─────────────┬───────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────┐
│      Firebase Cloud Functions               │
│  - requestOtp (asia-southeast1)             │
│  - verifyOtp (asia-southeast1)             │
└─────────────┬───────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────┐
│         Google Gemini AI API                │
│  - ใช้ในการตอบคำถาม ESG / Carbon           │
│  - System Prompt เฉพาะสำหรับ Hillkoff       │
└─────────────────────────────────────────────┘
```

---

## 3. เทคโนโลยีที่ใช้ (Tech Stack)

| หมวดหมู่ | เทคโนโลยี | รายละเอียด |
|---------|----------|-----------|
| **Framework** | Next.js (App Router) | React Framework สำหรับ SSR/SSG |
| **ภาษา** | JavaScript (JSX) | Client-side + Server-side |
| **Styling** | Tailwind CSS + Inline styles | Responsive Design |
| **Authentication** | Firebase Authentication | Google Sign-In (Popup) |
| **Database** | Google Firestore | NoSQL, REST API |
| **AI** | Google Gemini API | fallback model chain |
| **Cloud Functions** | Firebase Cloud Functions | OTP (asia-southeast1) |
| **Fonts** | Google Fonts (Prompt, DM Mono) | ภาษาไทย, Monospace |
| **Deployment** | Firebase Hosting | Next.js export |

### Dependencies (จาก package.json)

- **next**, **react**, **react-dom** — Core framework
- **firebase** — Firebase Client SDK (auth, firestore)
- **firebase-admin** — Firebase Admin SDK (functions)
- **firebase-functions** — Cloud Functions runtime
- **nodemailer** — สำหรับส่ง OTP ทางอีเมล (optional)
- **tailwindcss**, **postcss**, **autoprefixer** — CSS Framework

---

## 4. โครงสร้างโปรเจค

```
ESG/
├── app/
│   ├── page.jsx                    # MAIN DASHBOARD (1924 บรรทัด)
│   ├── layout.jsx                  # Root Layout
│   ├── globals.css                 # Global CSS
│   ├── api/
│   │   ├── dashboard/route.js      # CRUD Dashboard state (Firestore)
│   │   ├── ai-chat/route.js        # AI Chat (Gemini)
│   │   ├── gemini/route.js         # Gemini API (compatibility)
│   │   ├── ai-health/route.js      # Gemini Health Check
│   │   └── firebase-health/route.js# Firebase/Firestore Health Check
│   ├── auth/
│   ├── login/page.js               # Login Page (Google + OTP)
│   ├── register/page.js            # Register Page
│   └── dashboard/
├── lib/
│   ├── esgMasterData.js            # Master data, Carbon calc, Yearly stats
│   ├── firebase.js                 # Firebase client setup
│   ├── gemini.js                   # Gemini API helper + fallback
│   ├── googleFirestore.js          # Firestore REST helper
│   └── otpClient.js                # OTP frontend helper
├── functions/
│   ├── index.js                    # Cloud Functions (requestOtp, verifyOtp)
│   ├── package.json
│   └── package-lock.json
├── public/
├── firebase.json                   # Firebase config
├── next.config.mjs                 # Next.js config
├── tailwind.config.js              # Tailwind config
├── postcss.config.js               # PostCSS config
├── package.json
└── jsconfig.json
```

---

## 5. ระบบ Authentication และความปลอดภัย

### 5.1 กระบวนการ Login

```
1. ผู้ใช้คลิก "Continue with Google"
2. Firebase Auth popup → user signs in with Google
3. Firebase onAuthStateChanged ตรวจสอบ custom claim
4. ถ้า hillkoffOtpVerified !== true → ส่ง OTP อัตโนมัติ
5. ผู้ใช้กรอก OTP 6 หลัก → verifyOtp (Cloud Function)
6. ตั้ง custom claim: hillkoffOtpVerified = true
7. Redirect ไป / (Dashboard)
```

### 5.2 ข้อกำหนดด้านความปลอดภัย

| รายการ | รายละเอียด |
|--------|-----------|
| **Google Sign-In เท่านั้น** | ไม่มี email/password login |
| **OTP เฉพาะ @hillkoff.com** | ตรวจสอบโดเมนอีเมล |
| **OTP หมดอายุ 5 นาที** | เก็บใน Firestore พร้อม TTL |
| **OTP ถูก hash** | HMAC-SHA256 ด้วย OTP_HASH_SECRET |
| **จำกัดจำนวนครั้ง OTP** | สูงสุด 5 ครั้ง → ลบ challenge ทิ้ง |
| **Custom Claims** | hillkoffOtpVerified, hillkoffOtpVerifiedAt |
| **Authorized Domains** | ต้องเพิ่มใน Firebase Console |
| **ผู้ดูแลข้อมูล** | online_marketing@hillkoff.com (รีเซ็ตข้อมูลได้) |

### 5.3 ไฟล์ที่เกี่ยวข้อง

- `app/login/page.js` — UI สำหรับ login + OTP
- `lib/otpClient.js` — เรียก Cloud Functions จาก frontend
- `functions/index.js` — Cloud Functions (requestOtp, verifyOtp)

---

## 6. Dashboard หลัก (app/page.jsx)

ไฟล์ `app/page.jsx` (1924 บรรทัด) เป็น Single-Page Application ที่ประกอบด้วย 6 หน้า views:

### 6.1 PageHome — หน้าหลัก

| Component | รายละเอียด |
|-----------|-----------|
| **Hero Section** | Carbon Footprint รวม, จำนวนรายการ, kWh, จำนวนสาขา |
| **Branch Grid** | แสดง BranchCard ทุกสาขา (2-6 columns responsive) |
| **BranchCard** | icon, ชื่อ, CO2, Score bar, status dot |
| **Carbon รายเดือน** | MiniBarChart tCO2e รายเดือน |
| **การใช้ทรัพยากรรวม** | metric grid (ไฟฟ้า, น้ำ, เชื้อเพลิง) |

### 6.2 PageUpload — หน้ากรอก/นำเข้าข้อมูล

| ส่วน | รายละเอียด |
|------|-----------|
| **เลือกสาขา/เดือน** | dropdown + month picker |
| **อัปโหลดไฟล์** | Drag & Drop, รองรับ .xlsx, .csv, .pdf |
| **ค่าสาธารณูปโภค** | ไฟฟ้า (kWh/บาท), น้ำ (m³/บาท), เชื้อเพลิง (ลิตร + type) |
| **รายการเบิกวัสดุ (MAT_CATALOG)** | หมวดหมู่ café/office/clean/roast/pack/general รวม 106 รายการ |
| **ปริมาณขยะ** | แยก 12 ประเภทย่อยใน 4 กลุ่มหลัก |
| **วิเคราะห์/บันทึก** | คำนวณ Carbon + save to Firestore |

### 6.3 PageAnalytics — หน้าวิเคราะห์

| ฟีเจอร์ | รายละเอียด |
|---------|-----------|
| **Branch Filter** | เลือกดูเฉพาะสาขา |
| **AI Carbon Forecast** | คาดการณ์ 3 เดือนล่วงหน้า (+2.5%/เดือน) |
| **เปรียบเทียบรายเดือน** | MoM Change (ดีขึ้น/แย่ลง) |
| **Donut Chart** | สัดส่วน Carbon (ไฟฟ้า/น้ำ/เชื้อเพลิง) |
| **Top Materials/Waste** | วิเคราะห์ขยะและวัสดุรายเดือน |

### 6.4 PageRanking — หน้าจัดอันดับ

| โหมดจัดอันดับ | เกณฑ์ |
|--------------|-------|
| **Sustainability** | Score สูงสุด |
| **Carbon ต่ำสุด** | CO2 น้อย → มาก |
| **ประหยัดพลังงาน** | kWh น้อย → มาก |
| **ESG Radar** | Radar Chart เปรียบเทียบทุกสาขา |

### 6.5 PageReports — หน้ารายงาน (สำคัญที่สุด)

| ประเภทรายงาน | รายละเอียด |
|--------------|-----------|
| **Executive ESG Report** | สรุป ESG + KPI + Carbon + Zero Waste |
| **Carbon Emission Report** | Scope 1, 2, 3 รายสาขา |
| **TCFD Disclosure Report** | Governance, Strategy, Risk, Metrics |
| **Monthly Sustainability Report** | รายเดือน พร้อม MoM |
| **Branch Comparison Report** | เปรียบเทียบทุกสาขา |

**รูปแบบที่รองรับ:** HTML, PDF-ready HTML, Excel (.xls), CSV

### 6.6 PageSettings — หน้าการตั้งค่า

- Database connection status
- Profile management (ชื่อ, แผนก)
- Search documents/entries
- Login history
- Data audit trail
- White Paper download
- Reset operational data / Reset all data (admin only)

---

## 7. ระบบรายงานอัตโนมัติ

### 7.1 createReportHtml()

ฟังก์ชันหลักที่สร้างรายงานในรูปแบบ HTML ประกอบด้วย:

1. **KPI Cards** — Total Carbon, Entries, Carbon Credits, Active Branches
2. **Branch Summary Table** — ทุกสาขา (Entries, kWh, Water, Fuel, tCO2e, Score)
3. **Monthly Carbon Table** — รายเดือน 12 เดือน
4. **Yearly Statistics Table** — รายปี (Entries, CO2)
5. **Top Materials by Month** — วัสดุที่เบิกใช้มากที่สุด
6. **Top Waste by Month** — ขยะแต่ละประเภท
7. **Project Whitepaper** — คำอธิบายโครงการ

### 7.2 REPORT_DETAILS

รายละเอียดของรายงานแต่ละประเภทมี:
- **title** — ชื่อรายงาน
- **icon** — อีโมจิ
- **basis** — คำอธิบาย
- **formulas** — สูตรคำนวณ
- **sources** — แหล่งอ้างอิง

### 7.3 หลักเกณฑ์การคำนวณ

| รายงาน | สูตรสำคัญ |
|--------|----------|
| **ESG** | Carbon = Elec+Water+Fuel, Zero Waste Rate = (Recycle+Organic)/Total×100, Score = 50+(Recycle×0.5)-(CO2/entry×10) |
| **Carbon** | Scope 1 Fuel = Qty×EF/1000, Scope 2 Elec = kWh×0.4716/1000, Water = m³×0.00149 |
| **TCFD** | Governance/Strategy/Risk/Metrics 4 เสาหลัก |
| **Monthly** | Carbon เดือน, MoM Change, Intensity/entry |
| **Branch** | Ranking Carbon, Energy, Score |

### 7.4 Emission Factors

| ประเภท | ค่า EF | หน่วย |
|--------|-------|-------|
| ไฟฟ้า | 0.4716 (dashboard) / 0.4999 (esgMasterData) | kgCO2e/kWh |
| น้ำ | 0.00149 | tCO2e/m³ |
| ดีเซล | 2.67 | kgCO2e/L |
| เบนซิน | 2.31 | kgCO2e/L |
| LPG | 2.98 (dashboard) / 3.123 (esgMasterData) | kgCO2e/kg |
| CNG | 2.15 | kgCO2e/kg |
| Landfill | 0.45 | kgCO2e/kg |

---

## 8. AI Chat Assistant

### 8.1 การทำงาน

```
1. ผู้ใช้พิมพ์คำถามใน AI Panel (🤖)
2. หน้า frontend ส่ง POST /api/ai-chat
3. API ส่ง request ไป Gemini API
4. Gemini ตอบกลับตาม system prompt + context
5. ถ้า Gemini API ล้มเหลว → fallbackResponse()
   - ถามเกี่ยวกับ dashboard → คำนวณจากข้อมูลในเครื่อง
   - คำถามทั่วไป → ให้คำแนะนำเบื้องต้น
```

### 8.2 System Prompt (สำหรับ Gemini)

AI Assistant ถูกตั้งค่าให้:
- ตอบเป็นภาษาไทย (ยกเว้นขอภาษาอื่น)
- ใช้ข้อมูล Dashboard context เป็นหลัก
- แจ้ง anomaly เมื่อค่าสูงผิดปกติ
- อ้างอิงเอกสาร หลักฐาน แหล่งที่มา
- เน้น coffee waste circularity และ energy/carbon anomalies

### 8.3 Context ที่ส่งให้ AI

- masterBranches — ข้อมูลสาขาทั้ง 6
- totals — Carbon รวม, entries
- branches — ข้อมูลแต่ละสาขา
- entriesLog — 40 รายการล่าสุด
- documents — 25 เอกสารล่าสุด

### 8.4 Model Fallback Chain

```
gemini-3.5-flash → gemini-3.1-flash-lite → gemini-2.5-flash-lite → gemini-2.5-flash
```

---

## 9. API Routes ทั้งหมด

| Route | Method | ฟังก์ชัน | การทำงาน |
|-------|--------|---------|---------|
| `/api/dashboard` | GET | อ่าน Dashboard State | ดึงข้อมูลจาก Firestore document |
| `/api/dashboard` | POST | บันทึก Dashboard State | เขียน Firestore + entriesLog + yearlyStats + auditLogs |
| `/api/ai-chat` | POST | AI Chat | ส่งข้อความไป Gemini + context |
| `/api/gemini` | POST | Gemini API (compat) | เช่น ai-chat แต่ temperature 0.4 |
| `/api/ai-health` | GET | ตรวจสอบ Gemini | ทดสอบ API key + model |
| `/api/firebase-health` | GET | ตรวจสอบ Firebase | ทดสอบ Firestore read |
| `/api/firebase-health` | POST | ตรวจสอบ Firebase | ทดสอบ Firestore write |
| `/api/document-analyze` | POST | วิเคราะห์ไฟล์ | อ่านข้อมูลจาก PDF/Excel/CSV |

### 9.1 รายละเอียด API แต่ละตัว

**GET /api/dashboard**
- response: `{ success, source, savedAt, data: { branches, monthlyCo2, yearlyStats, entriesLog, loginHistory, userProfile } }`

**POST /api/dashboard**
- body: `{ branches, monthlyCo2, yearlyStats, entriesLog, loginHistory, userProfile }`
- response: `{ success, source, savedAt, mirroredCollections }`

**POST /api/ai-chat**
- body: `{ message, context }`
- response: `{ reply, model }`

---

## 10. Data Layer และการจัดเก็บข้อมูล

### 10.1 Firebase Firestore Collections

| Collection | Document ID | รายละเอียด |
|-----------|------------|-----------|
| `dashboards` | `hillkoff` | Dashboard state (JSON payload) |
| `entriesLog` | auto-generated | รายการบันทึกข้อมูลแต่ละครั้ง |
| `yearlyStats` | ปี (e.g., "2026") | สถิติรายปี |
| `auditLogs` | auto-generated | ประวัติการแก้ไข |
| `otpChallenges` | user uid | OTP challenge records |
| `_health` | `connection` | Health check record |

### 10.2 Dashboard State Structure

```javascript
{
  branches: [{ id, name, nameEn, icon, color, elec, water, fuel, co2, score, entries, hasData, waste: { general, recycle, organic, hazard }, status }],
  monthlyCo2: [0,0,...],        // 12 elements
  yearlyStats: { year: { co2, totalCarbon_kgCO2e, elec, fuel, wasteKg, coffeeGroundsKg, entries } },
  entriesLog: [{ id, branchId, period, elec, water, fuel, co2, waste, materials, documents, ... }],
  loginHistory: [{ at, email, userId, userAgent }],
  userProfile: { name, role, email, id },
  savedAt: ISO timestamp
}
```

### 10.3 Firestore REST API (googleFirestore.js)

- **readDashboardState()** — GET document `dashboards/hillkoff`
- **writeDashboardState(state)** — PATCH document with JSON payload
- **readCollectionDocuments(collection)** — GET all documents
- **upsertCollectionDocument(collection, id, payload)** — PATCH specific document
- **createCollectionDocument(collection, payload)** — POST new document
- **writeFirestoreHealthCheck()** — PATCH `_health/connection`

### 10.4 Service Account Authentication

ใช้ JWT (RS256) signed ด้วย Service Account private key เพื่อขอ access token จาก Google OAuth2:

```
1. สร้าง JWT assertion ด้วย client_email + private_key
2. POST https://oauth2.googleapis.com/token
3. รับ access token (Bearer)
4. ใช้ token เรียก Firestore REST API
```

---

## 11. ระบบ OTP (Firebase Cloud Functions)

### 11.1 requestOtp

```
POST /requestOtp
Header: Authorization: Bearer <Firebase ID Token>

1. ตรวจสอบ ID Token → extract email
2. ตรวจสอบ @hillkoff.com → ถ้าไม่ใช่ return 403
3. Generate OTP 6 หลัก (randomInt)
4. Hash ด้วย HMAC-SHA256 (OTP_HASH_SECRET)
5. เก็บใน Firestore (otpChallenges/{uid})
6. ส่งอีเมล (nodemailer) หรือ log (ถ้าไม่มี SMTP)
7. return { success, email, expiresInSeconds, expiresAt }
```

### 11.2 verifyOtp

```
POST /verifyOtp
Header: Authorization: Bearer <Firebase ID Token>
Body: { otp: "123456" }

1. ตรวจสอบ ID Token
2. ตรวจสอบ @hillkoff.com
3. Validate OTP format (6 digits)
4. อ่าน challenge จาก Firestore
5. ตรวจสอบ expired / consumed / attempts ≥ 5
6. ตรวจสอบ hash
7. อัปเดต consumedAt
8. setCustomUserClaims(hillkoffOtpVerified, hillkoffOtpVerifiedAt)
9. return { success, email, message }
```

### 11.3 Environment Variables (Functions)

| Variable | รายละเอียด |
|---------|-----------|
| OTP_HASH_SECRET | **Required** — Secret สำหรับ hash OTP |
| SMTP_URL | Optional — Nodemailer connection string |
| SMTP_FROM | Optional — Sender email address |

---

## 12. Emission Factor และหลักคำนวณ Carbon

### 12.1 calculateCarbonMetrics() (ใน esgMasterData.js)

```javascript
Input Parameters:
- coffeeGroundsKg, coffeeGroundsRecycled
- plasticKg, paperCardboardKg, foodWasteKg
- disposedMethod (landfill | recycled_and_composted)
- electricityKwh, lpgKg, fuelLiters

Output:
{
  scope1_kgCO2e,      // (lpgKg * 3.123) + (fuelLiters * 2.7)
  scope2_kgCO2e,      // electricityKwh * 0.4999
  scope3_kgCO2e,      // landfillWaste * 0.45
  totalCarbon_kgCO2e, // scope1 + scope2 + scope3
  wasteDivertedFromLandfillPercent
}
```

### 12.2 การแบ่ง Scope

| Scope | แหล่งปล่อย | วิธีการคำนวณ |
|-------|-----------|-------------|
| **Scope 1** | เชื้อเพลิงโดยตรง (LPG, ดีเซล, เบนซิน, CNG) | ปริมาณ × Emission Factor |
| **Scope 2** | ไฟฟ้าที่ซื้อมา | kWh × 0.4716 (หรือ 0.4999) |
| **Scope 3** | ขยะฝังกลบ upstream | น้ำหนักขยะ × 0.45 |

### 12.3 Sustainability Score

```
Score = max(1, min(100, 50 + (RecycleRate × 0.5) - (CO2_per_entry × 10)))

โดยที่:
- RecycleRate = (Recycle + Organic) / Total Waste × 100
- CO2_per_entry = Total CO2 / Number of entries
```

### 12.4 Carbon Credits

```
Carbon Credits = Total CO2 (tCO2e) × 2.4

มูลค่าตลาดโดยประมาณ: Credits × 2,000 บาท
```

---

## 13. คู่มือการติดตั้งและรัน

### 13.1 Local Development

```powershell
# 1. ติดตั้ง dependencies
npm install

# 2. ตั้งค่า Environment Variables
$env:GEMINI_API_KEY="your Gemini API key"
$env:GEMINI_MODEL="gemini-2.5-flash-lite"
$env:NEXT_PUBLIC_FIREBASE_API_KEY="Firebase web API key"
$env:NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
$env:NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
$env:NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
$env:NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
$env:NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"
$env:NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="your-measurement-id"
$env:GOOGLE_SERVICE_ACCOUNT_JSON="Firebase service account JSON"
# หรือใช้ GOOGLE_SERVICE_ACCOUNT_JSON_BASE64 แทน

# 3. รัน dev server
npm run dev
```

### 13.2 Firebase Setup

1. สร้าง Firebase Project
2. เปิดใช้งาน Authentication > Google provider
3. ตั้งค่า Firestore Database
4. เพิ่ม Authorized domains (localhost, production domain)
5. รับ Service Account JSON (Firebase Console > Project Settings > Service accounts)

### 13.3 Firebase Cloud Functions Setup

```powershell
# 1. เข้าไปใน functions directory
cd functions
npm install

# 2. ตั้งค่า Environment Variables
# คัดลอก .env.example → .env และกรอกค่าต่างๆ

# 3. Deploy functions
firebase deploy --only functions
# หรือ deploy เฉพาะ OTP functions
firebase deploy --only functions:requestOtp,functions:verifyOtp
```

### 13.4 Firebase Hosting Deployment

```powershell
# Build Next.js static export
npm run build

# Deploy to Firebase
firebase deploy --only hosting
```

### 13.5 Required Environment Variables Summary

| Variable | จำเป็น | ใช้ที่ไหน |
|---------|-------|---------|
| GEMINI_API_KEY | ✅ | AI Chat |
| GEMINI_MODEL | ❌ (มี default) | AI Chat |
| NEXT_PUBLIC_FIREBASE_* | ✅ | Client-side Firebase |
| GOOGLE_SERVICE_ACCOUNT_JSON | ✅ | Server-side Firestore |
| OTP_HASH_SECRET | ✅ | Cloud Functions |
| SMTP_URL | ❌ | Email OTP |
| SMTP_FROM | ❌ | Email OTP |

---

## 14. แผนผังการไหลของข้อมูล

### 14.1 Data Entry Flow

```
User Input (Manual / File Upload)
        │
        ▼
PageUpload Component
  - รับข้อมูล utilities, waste, materials
  - รับไฟล์ (PDF/Excel/CSV)
        │
        ▼
simulateFileExtraction() / /api/document-analyze
  - แยกข้อมูลจากไฟล์
  - Fallback: สุ่มค่าตามชนิดไฟล์
        │
        ▼
calculateCarbonMetrics()
  - คำนวณ Scope 1, 2, 3
  - คำนวณ Sustainability Score
        │
        ▼
handleSave() → update state
  - update branches[]
  - update monthlyCo2[]
  - update entriesLog[]
  - update yearlyStats[]
        │
        ▼
POST /api/dashboard (auto-save debounced 500ms)
  - writeDashboardState() → Firestore
  - upsertCollectionDocument() → entriesLog, yearlyStats
  - createCollectionDocument() → auditLogs
```

### 14.2 Data Read Flow

```
Page Load
        │
        ▼
Firebase Auth → onAuthStateChanged
        │
        ▼
GET /api/dashboard
  - readDashboardState() from Firestore
  - readCollectionDocuments("entriesLog")
        │
        ▼
normalizeDashboardState()
  - Merge branch data
  - Build yearlyStats
        │
        ▼
Render Dashboard UI
  - PageHome, PageUpload, PageAnalytics, PageRanking, PageReports, PageSettings
```

### 14.3 Report Generation Flow

```
User selects report type (ESG/Carbon/TCFD/Monthly/Branch)
        │
        ▼
ReportDetailModal → show details + formulas
        │
        ▼
User clicks download
        │
        ▼
createReportHtml() → HTML
  - KPI Cards
  - Branch Summary
  - Monthly Carbon
  - Yearly Stats
  - Top Materials/Waste
  - Whitepaper
        │
        ▼
downloadBlob() → { html | csv | xls | pdf-ready-html }
```

---

## 15. ข้อแนะนำสำหรับผู้ดูแลระบบ

### 15.1 ก่อนใช้งานจริง

- [ ] เปลี่ยน Emission Factor ให้เป็นค่าล่าสุดจากประกาศของ กกพ. หรือ IPCC
- [ ] ทดสอบ Cloud Functions OTP ก่อนเปิด production
- [ ] ตั้งค่า SMTP สำหรับส่ง OTP จริง (ปัจจุบัน fallback เป็น log)
- [ ] ตั้งค่า Firebase Authorized domains ให้ครบ
- [ ] เปิดใช้งาน Google provider ใน Firebase Authentication
- [ ] ทดสอบการอัปโหลดไฟล์ (PDF, Excel, CSV) ทุกประเภท
- [ ] ตั้งค่า GEMINI_API_KEY ใน Firebase runtime environment variables

### 15.2 การบริหารจัดการข้อมูล

| การกระทำ | ผู้ที่สามารถทำได้ | ผลลัพธ์ |
|---------|----------------|---------|
| Reset incorrect data | admin (online_marketing@hillkoff.com) | ล้าง branches, monthlyCo2, yearlyStats, entriesLog |
| Reset all data | admin | ล้างทุกอย่างรวม loginHistory, userProfile |
| Audit trail | admin | ตรวจสอบ auditLogs collection |

### 15.3 แนวทางการปรับปรุง (Future Improvements)

1. **รองรับหลายภาษา** — ปัจจุบันเป็นภาษาไทย + อังกฤษผสมกัน
2. **API Authentication** — เพิ่ม middleware ยืนยันตัวตนสำหรับ API routes
3. **Export PDF จริง** — ปัจจุบันเป็น PDF-ready HTML ต้อง Print to PDF เอง
4. **Real-time updates** — เพิ่ม Firestore onSnapshot สำหรับ real-time sync
5. **Multiple users edit** — ปัจจุบันใช้ single document อาจมี conflict
6. **File storage** — อัปโหลดไฟล์ไป Firebase Storage แทน FormData
7. **Unit tests** — เพิ่ม testing สำหรับ carbon calculation และ data validation
8. **Data backup** — schedule backup ของ Firestore collections

### 15.4 การตรวจสอบระบบ

- `GET /api/ai-health` — ตรวจสอบ Gemini API key และ model
- `GET /api/firebase-health` — ตรวจสอบ Firestore read access
- `POST /api/firebase-health` — ตรวจสอบ Firestore write access
- หน้า Settings → แสดง Database connection status

---

## สรุป

**Hillkoff Zero Waste Analytics** เป็นระบบ Enterprise ESG Platform ที่ครอบคลุมการทำงานครบวงจร:

1. ✅ **Data Collection** — รองรับทั้ง manual input และ file upload (PDF/Excel/CSV)
2. ✅ **Carbon Calculation** — ครบทั้ง Scope 1, 2, 3 ตาม GHG Protocol
3. ✅ **Dashboard & Analytics** — 6 หน้า views พร้อมกราฟและการคาดการณ์
4. ✅ **Branch Benchmarking** — Ranking พร้อม Sustainability Score
5. ✅ **Automated Reports** — 5 ประเภท報告 รองรับ HTML/CSV/Excel/PDF-ready
6. ✅ **AI Assistant** — Gemini AI ช่วยวิเคราะห์ข้อมูล ESG
7. ✅ **Security** — Google Sign-In + OTP verification + Custom claims
8. ✅ **Data Persistence** — Firestore พร้อม Audit Trail

ระบบนี้เป็นเครื่องมือสำคัญสำหรับสนับสนุนการเปลี่ยนผ่านสู่องค์กรที่ยั่งยืน (Net Zero) และเป็นรูปธรรม (Circular Operations) ตามเป้าหมายระยะยาวของ Hillkoff