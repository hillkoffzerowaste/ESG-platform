# Hillkoff Zero Waste Analytics

Next.js app สำหรับ ESG, Carbon Footprint, Zero Waste, รายงานผู้บริหาร และ AI chat ผ่าน API route ฝั่ง server
Next.js app สำหรับ ESG, Carbon Footprint, Zero Waste, รายงานผู้บริหาร และ AI chat ผ่าน Gemini API route ฝั่ง server

## Run

```powershell
npm install
$env:OPENAI_API_KEY="ใส่ OpenAI API key จริง"
$env:OPENAI_MODEL="gpt-4.1-mini"
$env:GEMINI_API_KEY="ใส่ Gemini API key จริง"
$env:GEMINI_MODEL="gemini-2.5-flash"
npm run dev
```

เปิดเว็บที่ `http://localhost:3000`

ถ้ายังไม่ตั้ง `OPENAI_API_KEY` ระบบ AI chat จะ fallback เป็นคำตอบจำลองจากข้อมูล dashboard เดิม เพื่อให้ UI ยังใช้งานได้
ถ้ายังไม่ตั้ง `GEMINI_API_KEY` ระบบ AI chat จะ fallback เป็นคำตอบจำลองจากข้อมูล dashboard เดิม เพื่อให้ UI ยังใช้งานได้

## Files

- `app/page.jsx` - โค้ด UI เต็มทั้งหมด
- `app/api/ai-chat/route.js` - API route สำหรับเชื่อมต่อ OpenAI Responses API
- `app/api/ai-chat/route.js` - API route สำหรับเชื่อมต่อ Gemini generateContent API
- `app/layout.jsx` - metadata และ root layout
- `package.json` - scripts และ dependencies
