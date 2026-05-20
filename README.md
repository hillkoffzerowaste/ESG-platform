# Hillkoff Zero Waste Analytics

Next.js app สำหรับ ESG, Carbon Footprint, Zero Waste, รายงานผู้บริหาร และ AI chat ผ่าน API route ฝั่ง server

## Run

```powershell
npm install
$env:OPENAI_API_KEY="ใส่ OpenAI API key จริง"
$env:OPENAI_MODEL="gpt-4.1-mini"
npm run dev
```

เปิดเว็บที่ `http://localhost:3000`

ถ้ายังไม่ตั้ง `OPENAI_API_KEY` ระบบ AI chat จะ fallback เป็นคำตอบจำลองจากข้อมูล dashboard เดิม เพื่อให้ UI ยังใช้งานได้

## Files

- `app/page.jsx` - โค้ด UI เต็มทั้งหมด
- `app/api/ai-chat/route.js` - API route สำหรับเชื่อมต่อ OpenAI Responses API
- `app/layout.jsx` - metadata และ root layout
- `package.json` - scripts และ dependencies

## สิ่งที่เพิ่มจากโค้ดเดิม

- Responsive layout สำหรับ mobile, tablet และ desktop
- Desktop sidebar navigation
- รายละเอียดรายงานผู้บริหารเมื่อคลิกแต่ละรายการ พร้อมสูตร หลักเกณฑ์ และแหล่งอ้างอิง
- AI chat เรียกผ่าน `/api/ai-chat` โดยไม่เปิดเผย API key ใน browser
