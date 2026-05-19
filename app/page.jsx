"use client";
import { GoogleGenAI } from '@google/genai';
import { useState, useEffect, useRef, useCallback } from "react";

// ─── Material Catalog (90 items) ──────────────────────────────────────────────
const MAT_CATALOG = {
  cafe: {
    label: "☕ วัสดุร้านกาแฟ",
    items: [
      { name: "แก้วกระดาษ", unit: "ใบ" }, { name: "แก้วพลาสติกใส", unit: "ใบ" },
      { name: "แก้วพลาสติกสี", unit: "ใบ" }, { name: "หลอดดูดพลาสติก", unit: "ชิ้น" },
      { name: "หลอดดูดกระดาษ", unit: "ชิ้น" }, { name: "ฝาแก้วแบน", unit: "ชิ้น" },
      { name: "ฝาแก้วโดม", unit: "ชิ้น" }, { name: "ฝาแก้วมีรู", unit: "ชิ้น" },
      { name: "ถุงพลาสติกหูหิ้ว", unit: "ใบ" }, { name: "ถุงกระดาษ", unit: "ใบ" },
      { name: "ซองน้ำตาล", unit: "ชิ้น" }, { name: "ซองครีมเทียม", unit: "ชิ้น" },
      { name: "ผ้าเช็ดมือ (ทิชชู)", unit: "แพ็ค" }, { name: "กล่องกระดาษใส่ขนม", unit: "ใบ" },
      { name: "ไม้คนกาแฟ", unit: "ชิ้น" }, { name: "ผ้ากรองกาแฟ", unit: "แผ่น" },
      { name: "แคปซูลกาแฟ", unit: "กล่อง" }, { name: "ผงกาแฟ", unit: "กิโลกรัม" },
    ],
  },
  office: {
    label: "🖊️ เครื่องเขียน/สำนักงาน",
    items: [
      { name: "กระดาษ A4", unit: "รีม" }, { name: "กระดาษ A3", unit: "รีม" },
      { name: "ปากกาลูกลื่น", unit: "ด้าม" }, { name: "ดินสอ", unit: "แท่ง" },
      { name: "ปากกาเมจิก", unit: "ด้าม" }, { name: "แฟ้มเอกสาร", unit: "อัน" },
      { name: "แฟ้มซอง", unit: "อัน" }, { name: "คลิปดำ", unit: "กล่อง" },
      { name: "คลิปหนีบกระดาษ", unit: "กล่อง" }, { name: "สติ๊กเกอร์ Post-it", unit: "แพ็ค" },
      { name: "เทปใสเล็ก", unit: "ม้วน" }, { name: "กาวแท่ง", unit: "แท่ง" },
      { name: "กรรไกร", unit: "อัน" }, { name: "ลวดเย็บกระดาษ", unit: "กล่อง" },
      { name: "ตลับหมึก Printer", unit: "ตลับ" }, { name: "หมึกเติม Printer", unit: "ขวด" },
      { name: "แฟ้ม Ring binder", unit: "อัน" }, { name: "ปฏิทินตั้งโต๊ะ", unit: "อัน" },
    ],
  },
  clean: {
    label: "🧹 วัสดุทำความสะอาด",
    items: [
      { name: "น้ำยาล้างจาน", unit: "ขวด" }, { name: "น้ำยาถูพื้น", unit: "ขวด" },
      { name: "น้ำยาฆ่าเชื้อ", unit: "ขวด" }, { name: "ผงซักฟอก", unit: "ถุง" },
      { name: "น้ำยาปรับผ้านุ่ม", unit: "ขวด" }, { name: "สก็อตไบรท์", unit: "แผ่น" },
      { name: "ฟองน้ำล้างจาน", unit: "แผ่น" }, { name: "ผ้าไมโครไฟเบอร์", unit: "ผืน" },
      { name: "ถุงขยะดำ", unit: "แพ็ค" }, { name: "ถุงขยะสี", unit: "แพ็ค" },
      { name: "กระดาษทิชชู ม้วนใหญ่", unit: "ม้วน" }, { name: "กระดาษเช็ดมือ", unit: "แพ็ค" },
      { name: "สบู่ล้างมือ", unit: "ขวด" }, { name: "แอลกอฮอล์เจล", unit: "ขวด" },
      { name: "แปรงขัดห้องน้ำ", unit: "อัน" }, { name: "น้ำยาขัดสุขภัณฑ์", unit: "ขวด" },
      { name: "น้ำหอมปรับอากาศ", unit: "กระป๋อง" },
    ],
  },
  roast: {
    label: "🔥 โรงคั่วกาแฟ",
    items: [
      { name: "เมล็ดกาแฟดิบ", unit: "กิโลกรัม" }, { name: "ถุงบรรจุเมล็ดกาแฟ", unit: "ใบ" },
      { name: "ซิปล็อคกาแฟ", unit: "ใบ" }, { name: "วาล์วระบายแก๊ส", unit: "ชิ้น" },
      { name: "ป้ายสินค้า", unit: "แผ่น" }, { name: "กล่องบรรจุภัณฑ์กาแฟ", unit: "ใบ" },
      { name: "ถุงอลูมิเนียมฟอยล์", unit: "ใบ" }, { name: "กระป๋องกาแฟ", unit: "ใบ" },
      { name: "ซีลฝา", unit: "ชิ้น" }, { name: "ฉลากสินค้า", unit: "ม้วน" },
      { name: "น้ำมันหล่อลื่นเครื่อง", unit: "ขวด" }, { name: "ผ้ากรองคั่ว", unit: "แผ่น" },
    ],
  },
  pack: {
    label: "📦 แพ็คสินค้า/คลังสินค้า",
    items: [
      { name: "แอร์บับเบิล (กันกระแทก)", unit: "ม้วน" }, { name: "กล่องพัสดุ เบอร์ S", unit: "ใบ" },
      { name: "กล่องพัสดุ เบอร์ M", unit: "ใบ" }, { name: "กล่องพัสดุ เบอร์ L", unit: "ใบ" },
      { name: "ซองไปรษณีย์พลาสติก", unit: "ใบ" }, { name: "ซองกันกระแทก", unit: "ใบ" },
      { name: "เทปปิดกล่อง", unit: "ม้วน" }, { name: "เทปใสขนาดใหญ่", unit: "ม้วน" },
      { name: "ฟิล์มยืดพันพาเลท", unit: "ม้วน" }, { name: "เชือกฟาง", unit: "ม้วน" },
      { name: "เคเบิ้ลไทร์", unit: "ถุง" }, { name: "สติ๊กเกอร์ Fragile", unit: "ม้วน" },
      { name: "สติ๊กเกอร์ส่งด่วน", unit: "ม้วน" }, { name: "สติ๊กเกอร์โลโก้บริษัท", unit: "ม้วน" },
      { name: "เครื่องยิงเทป", unit: "อัน" }, { name: "คัตเตอร์งานคลัง", unit: "อัน" },
      { name: "ถุงซิปล็อค", unit: "แพ็ค" }, { name: "ถุงคราฟท์", unit: "แพ็ค" },
      { name: "ถุงกระดาษ", unit: "แพ็ค" }, { name: "ถุงพลาสติกใส", unit: "กิโลกรัม" },
      { name: "ป้ายแท็กสินค้า", unit: "แพ็ค" }, { name: "เครื่องชั่งสินค้า", unit: "เครื่อง" },
      { name: "กระดาษใบปะหน้า", unit: "รีม" }, { name: "หมึกเครื่องปริ้นใบปะหน้า", unit: "ตลับ" },
    ],
  },
  general: {
    label: "🔧 อุปกรณ์ทั่วไปองค์กร",
    items: [
      { name: "หลอดไฟ", unit: "หลอด" }, { name: "ถ่าน AA", unit: "ก้อน" },
      { name: "ถ่าน AAA", unit: "ก้อน" }, { name: "ปลั๊กไฟ", unit: "อัน" },
      { name: "สายไฟต่อพ่วง", unit: "เส้น" }, { name: "พัดลม", unit: "เครื่อง" },
      { name: "อุปกรณ์ปฐมพยาบาล", unit: "ชุด" }, { name: "หน้ากากอนามัย", unit: "กล่อง" },
      { name: "หมวกคลุมผม", unit: "แพ็ค" }, { name: "ผ้ากันเปื้อน", unit: "ตัว" },
      { name: "รองเท้าบูท", unit: "คู่" }, { name: "ถุงมือยาง", unit: "กล่อง" },
      { name: "ไม้กวาด", unit: "อัน" }, { name: "ที่โกยผง", unit: "อัน" },
      { name: "ไม้ม็อบ", unit: "อัน" },
    ],
  },
};

const BRANCHES_INIT = [
  { id: "HQ",  name: "สำนักงานใหญ่",  nameEn: "Headquarters", icon: "🏢", color: "#166534" },
  { id: "CPK", name: "สาขาช้างเผือก", nameEn: "Chang Phueak",  icon: "🌿", color: "#15803D" },
  { id: "MHD", name: "สาขามหิดล",     nameEn: "Mahidol",       icon: "🎓", color: "#16A34A" },
  { id: "PPG", name: "สาขาป่าแพ่ง",   nameEn: "Pa Phaeng",     icon: "🌳", color: "#22C55E" },
  { id: "TD",  name: "สาขาทับเดื่อ",  nameEn: "Thap Duea",     icon: "☕", color: "#4ADE80" },
  { id: "RTK", name: "สาขาราติก้า",   nameEn: "Ratica",        icon: "🫘", color: "#0f766e" },
];

const MONTHS = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];

const numFmt = (n) => n >= 1000 ? (Math.round(n / 100) / 10) + "k" : n;

// ─── Simulate file data extraction based on file type ─────────────────────────
function simulateFileExtraction(fileName, branchId) {
  const ext = fileName.split(".").pop().toLowerCase();
  const seed = fileName.length + branchId.charCodeAt(0);
  const rng = (min, max, s = seed) => {
    const x = Math.sin(s * 9301 + 49297) * 233280;
    return Math.round((x - Math.floor(x)) * (max - min) + min);
  };

  if (ext === "pdf") {
    // Simulate utility bill PDF
    return {
      source: "pdf",
      elec: rng(800, 3500, seed + 1),
      water: rng(20, 120, seed + 2),
      fuel: rng(50, 400, seed + 3),
      wGen: rng(10, 80, seed + 4),
      wRec: rng(5, 40, seed + 5),
      wOrg: rng(5, 30, seed + 6),
      wHaz: rng(0, 10, seed + 7),
      matCount: rng(3, 12, seed + 8),
      description: `ข้อมูลบิลค่าสาธารณูปโภค (PDF: ${fileName})`,
    };
  } else if (ext === "xlsx") {
    // Simulate Excel data sheet
    return {
      source: "excel",
      elec: rng(1000, 5000, seed + 1),
      water: rng(30, 200, seed + 2),
      fuel: rng(100, 600, seed + 3),
      wGen: rng(20, 100, seed + 4),
      wRec: rng(15, 60, seed + 5),
      wOrg: rng(10, 50, seed + 6),
      wHaz: rng(0, 15, seed + 7),
      matCount: rng(8, 25, seed + 8),
      description: `ข้อมูลจากตาราง Excel (${fileName})`,
    };
  } else {
    // CSV
    return {
      source: "csv",
      elec: rng(600, 2800, seed + 1),
      water: rng(15, 90, seed + 2),
      fuel: rng(30, 300, seed + 3),
      wGen: rng(8, 60, seed + 4),
      wRec: rng(4, 35, seed + 5),
      wOrg: rng(3, 25, seed + 6),
      wHaz: rng(0, 8, seed + 7),
      matCount: rng(2, 10, seed + 8),
      description: `ข้อมูลจากไฟล์ CSV (${fileName})`,
    };
  }
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{
    --g1:#0f4c2a;--g2:#166534;--g3:#15803d;--g4:#16a34a;--g5:#22c55e;
    --g6:#4ade80;--g7:#86efac;--g8:#bbf7d0;--g9:#dcfce7;--g10:#f0fdf4;
    --bg:#f0fdf4;--card:#ffffff;--text:#14532d;--text2:#166534;
    --text3:#6b7280;--border:#d1fae5;
    --shadow:0 4px 24px rgba(22,101,52,.08);
    --shadow-lg:0 8px 40px rgba(22,101,52,.14);
    --radius:20px;--font:'Prompt',sans-serif;--mono:'DM Mono',monospace;
    --nav-h:72px;
  }
  html{scroll-behavior:smooth}
  body{font-family:var(--font);background:var(--bg);color:var(--text);overflow-x:hidden}
  @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
  @keyframes slideIn{from{transform:translateX(120%)}to{transform:translateX(0)}}
  @keyframes blink{0%,100%{opacity:1}50%{opacity:.4}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes progress{from{width:0}to{width:100%}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
  .fadeUp{animation:fadeUp .35s ease}
  canvas{border-radius:12px}
  input[type=number]::-webkit-inner-spin-button,
  input[type=number]::-webkit-outer-spin-button{opacity:1}
`;

// ─── Mini Bar Chart (pure CSS) ─────────────────────────────────────────────────
function MiniBarChart({ data, labels, color = "#16a34a" }) {
  const max = Math.max(...data, 0.001);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 80, padding: "0 4px" }}>
      {data.map((v, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
          <div style={{
            width: "100%", background: v > 0 ? color + "cc" : "#e5e7eb",
            borderRadius: "3px 3px 0 0",
            height: `${(v / max) * 64}px`,
            minHeight: v > 0 ? 4 : 2,
            transition: "height .6s ease"
          }} />
          <span style={{ fontSize: 8, color: "#9ca3af", whiteSpace: "nowrap" }}>{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Donut Chart (SVG) ─────────────────────────────────────────────────────────
function DonutChart({ slices, labels }) {
  const total = slices.reduce((s, v) => s + v, 0);
  const colors = ["#16a34a", "#22d3ee", "#f59e0b"];
  let cumAngle = -Math.PI / 2;
  const r = 44, cx = 60, cy = 60;

  const paths = total > 0 ? slices.map((v, i) => {
    const angle = (v / total) * 2 * Math.PI;
    const x1 = cx + r * Math.cos(cumAngle);
    const y1 = cy + r * Math.sin(cumAngle);
    cumAngle += angle;
    const x2 = cx + r * Math.cos(cumAngle);
    const y2 = cy + r * Math.sin(cumAngle);
    const large = angle > Math.PI ? 1 : 0;
    return <path key={i} d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} Z`} fill={colors[i]} opacity={0.85} />;
  }) : <circle cx={cx} cy={cy} r={r} fill="#e5e7eb" />;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <svg width={120} height={120}>
        {paths}
        <circle cx={cx} cy={cy} r={28} fill="white" />
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize="9" fill="#6b7280">tCO₂e</text>
        <text x={cx} y={cy + 8} textAnchor="middle" fontSize="10" fontWeight="700" fill="#14532d">{total > 0 ? total.toFixed(2) : "—"}</text>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {labels.map((l, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: colors[i], flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: "#374151" }}>{l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Radar Chart (SVG) ────────────────────────────────────────────────────────
function RadarChart({ branches }) {
  const axes = ["Score", "ประสิทธิภาพ", "ลด Carbon", "ค่าไฟ↓", "น้ำ↓"];
  const n = axes.length;
  const cx = 100, cy = 100, r = 70;
  const angleStep = (2 * Math.PI) / n;
  const angleOf = (i) => -Math.PI / 2 + i * angleStep;

  const rings = [25, 50, 75, 100];
  const ringPaths = rings.map(pct => {
    const rr = (pct / 100) * r;
    const pts = axes.map((_, i) => `${cx + rr * Math.cos(angleOf(i))},${cy + rr * Math.sin(angleOf(i))}`);
    return <polygon key={pct} points={pts.join(" ")} fill="none" stroke="#e5e7eb" strokeWidth={1} />;
  });

  const axisLines = axes.map((ax, i) => {
    const x = cx + r * Math.cos(angleOf(i));
    const y = cy + r * Math.sin(angleOf(i));
    const lx = cx + (r + 14) * Math.cos(angleOf(i));
    const ly = cy + (r + 14) * Math.sin(angleOf(i));
    return (
      <g key={i}>
        <line x1={cx} y1={cy} x2={x} y2={y} stroke="#e5e7eb" strokeWidth={1} />
        <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fontSize="9" fill="#6b7280">{ax}</text>
      </g>
    );
  });

  const dataPolygons = branches.filter(b => b.hasData).map((b, bi) => {
    const vals = [b.score, Math.min(100, b.score + 5), Math.min(100, b.score - 5), Math.min(100, b.score + 2), Math.min(100, b.score - 3)];
    const pts = vals.map((v, i) => {
      const rr = (v / 100) * r;
      return `${cx + rr * Math.cos(angleOf(i))},${cy + rr * Math.sin(angleOf(i))}`;
    });
    return <polygon key={bi} points={pts.join(" ")} fill={b.color + "33"} stroke={b.color} strokeWidth={2} />;
  });

  return (
    <svg width="100%" viewBox="0 0 200 200">
      {ringPaths}{axisLines}{dataPolygons}
    </svg>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, show }) {
  return (
    <div style={{
      position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)",
      background: "#0f4c2a", color: "#fff", padding: "10px 20px", borderRadius: 20,
      fontSize: 13, fontWeight: 500, zIndex: 300,
      boxShadow: "0 8px 40px rgba(22,101,52,.14)",
      opacity: show ? 1 : 0, transition: "opacity .25s", pointerEvents: "none",
      whiteSpace: "nowrap", fontFamily: "var(--font)"
    }}>{msg}</div>
  );
}

// ─── Branch Card ──────────────────────────────────────────────────────────────
function BranchCard({ b, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: "#fff", borderRadius: 18, padding: 14,
      boxShadow: "0 4px 24px rgba(22,101,52,.08)",
      border: "1px solid #d1fae5", cursor: "pointer",
      transition: "all .2s", position: "relative", overflow: "hidden",
      fontFamily: "var(--font)"
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 40px rgba(22,101,52,.14)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 4px 24px rgba(22,101,52,.08)"; }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: b.color, borderRadius: "18px 18px 0 0" }} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 22 }}>{b.icon}</span>
        <div style={{
          width: 8, height: 8, borderRadius: "50%",
          background: b.hasData ? "#22c55e" : "#86efac",
          boxShadow: b.hasData ? "0 0 0 3px rgba(34,197,94,.2)" : "0 0 0 3px rgba(134,239,172,.2)"
        }} />
      </div>
      <div style={{ fontSize: 12, fontWeight: 600, color: "#14532d" }}>{b.name}</div>
      <div style={{ fontSize: 10, color: "#6b7280" }}>{b.nameEn} · {b.id}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: b.hasData ? "#166534" : "#6b7280", margin: "6px 0 2px" }}>
        {b.hasData ? b.co2 : "—"}
      </div>
      <div style={{ fontSize: 9, color: "#6b7280", letterSpacing: ".5px" }}>{b.hasData ? "tCO₂e" : "ยังไม่มีข้อมูล"}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
        <div style={{ flex: 1, height: 4, background: "#dcfce7", borderRadius: 4, overflow: "hidden" }}>
          <div style={{ height: "100%", borderRadius: 4, background: "linear-gradient(90deg,#16a34a,#22c55e)", width: `${b.score}%`, transition: "width 1s ease" }} />
        </div>
        <span style={{ fontSize: 10, fontWeight: 600, color: b.hasData ? "#15803d" : "#6b7280" }}>{b.hasData ? b.score : "—"}</span>
      </div>
    </div>
  );
}

// ─── Branch Modal ─────────────────────────────────────────────────────────────
function BranchModal({ b, onClose, onGoUpload }) {
  if (!b) return null;
  const wTotal = (b.waste.general || 0) + (b.waste.recycle || 0) + (b.waste.organic || 0) + (b.waste.hazard || 0);
  const rr = wTotal > 0 ? (((b.waste.recycle || 0) + (b.waste.organic || 0)) / wTotal * 100).toFixed(1) : "-";
  const rows = b.hasData ? [
    ["Carbon Emission", b.co2 + " tCO₂e"],
    ["Sustainability Score", b.score + " / 100"],
    ["ไฟฟ้า", b.elec.toLocaleString() + " kWh"],
    ["น้ำ", b.water + " m³"],
    ["เชื้อเพลิง", b.fuel + " ลิตร"],
    ["ขยะทิ้ง", b.waste.general + " กก."],
    ["รีไซเคิล + ปุ๋ย", ((b.waste.recycle || 0) + (b.waste.organic || 0)) + " กก."],
    ["อัตรา Zero Waste", rr + "%", "#15803d"],
    ["Carbon Credits", Math.round(b.co2 * 2.4) + " credits"],
    ["รายการที่กรอก", b.entries + " รายการ"],
    ["สถานะ", b.status === "excellent" ? "🟢 ดีเยี่ยม" : b.status === "good" ? "🔵 ดี" : "🟡 ปานกลาง",
      b.status === "excellent" ? "#16a34a" : b.status === "good" ? "#15803d" : "#d97706"],
  ] : [];

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,.4)",
      backdropFilter: "blur(6px)", display: "flex", alignItems: "flex-end",
      zIndex: 200, padding: "0 0 var(--nav-h)", opacity: 1
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "#fff", borderRadius: "28px 28px 0 0", padding: 20,
        width: "100%", maxWidth: 600, margin: "0 auto", fontFamily: "var(--font)",
        maxHeight: "80dvh", overflowY: "auto"
      }}>
        <div style={{ width: 40, height: 4, background: "#bbf7d0", borderRadius: 4, margin: "0 auto 16px" }} />
        <button onClick={onClose} style={{
          position: "absolute", top: 16, right: 16, background: "#f0fdf4",
          border: "none", borderRadius: 10, width: 32, height: 32, fontSize: 16,
          cursor: "pointer", color: "#6b7280"
        }}>✕</button>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#14532d" }}>{b.icon} {b.name}</div>
        <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 16 }}>{b.nameEn} · {b.id}</div>
        {!b.hasData ? (
          <div style={{ textAlign: "center", padding: "32px 20px", color: "#6b7280" }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>📋</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#14532d", marginBottom: 6 }}>ยังไม่มีข้อมูล</div>
            <button onClick={() => { onClose(); onGoUpload(); }} style={{
              marginTop: 14, padding: "10px 20px", background: "#166534", color: "#fff",
              border: "none", borderRadius: 12, fontFamily: "var(--font)", fontSize: 13,
              fontWeight: 600, cursor: "pointer"
            }}>📝 ไปกรอกข้อมูล</button>
          </div>
        ) : (
          <>
            {rows.map(([lbl, val, col], i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: i < rows.length - 1 ? "1px solid #d1fae5" : "none" }}>
                <span style={{ fontSize: 13, color: "#6b7280" }}>{lbl}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: col || "#14532d" }}>{val}</span>
              </div>
            ))}
            <button style={{
              width: "100%", padding: 14, marginTop: 16,
              background: "linear-gradient(135deg,#166534,#16a34a)", color: "#fff",
              border: "none", borderRadius: 14, fontFamily: "var(--font)",
              fontSize: 14, fontWeight: 700, cursor: "pointer"
            }}>📄 สร้างรายงานสาขา</button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── AI Panel ─────────────────────────────────────────────────────────────────
function AIPanel({ open, onClose, branches }) {
  const [msgs, setMsgs] = useState([{ type: "bot", text: "สวัสดีครับ! ผมคือ AI ที่ช่วยวิเคราะห์ข้อมูล ESG, Carbon Footprint และ Zero Waste ของ Hillkoff กรอกข้อมูลหรืออัปโหลดไฟล์ในหน้า Upload แล้วถามผมได้เลยครับ 🌱" }]);
  const [input, setInput] = useState("");
  const msgsRef = useRef(null);

  const hasData = branches.some(b => b.hasData);
  const totals = branches.reduce((acc, b) => ({ co2: acc.co2 + b.co2, elec: acc.elec + b.elec, entries: acc.entries + b.entries }), { co2: 0, elec: 0, entries: 0 });

 const send = async () => {
    if (!input.trim()) return;
    const txt = input.trim();
    setInput("");

    // 1. แสดงข้อความของฝั่งยูสเซอร์ และใส่สถานะกำลังโหลด (...)
    setMsgs(m => [...m, { type: "user", text: txt }, { type: "bot", text: "...", loading: true }]);

    try {
      // 2. เรียกใช้งาน Gemini SDK โดยส่ง API Key ผ่าน Environment Variable
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
      
      // ดึงรายละเอียดข้อมูลขยะและพลังงานของทุกสาขามาทำเป็น Text สรุปให้ AI อ่านแบบเจาะลึก
      const branchDetailsText = branches.map(b => {
const branchDetailsText = branches.map(b => {
        if (!b.hasData) return `- สาขา ${b.name} (${b.id}): ยังไม่มีการกรอกข้อมูลในระบบ`;
        const wTotal = (b.waste.general || 0) + (b.waste.recycle || 0) + (b.waste.organic || 0) + (b.waste.hazard || 0);
        const zeroWasteRate = wTotal > 0 ? (((b.waste.recycle || 0) + (b.waste.organic || 0)) / wTotal * 100).toFixed(1) : "0";
        return `
        - สาขา ${b.name} (${b.id}):
          * คาร์บอนที่ปล่อย: ${b.co2} tCO2e (คะแนนความยั่งยืน: ${b.score}/100)
          * การใช้พลังงาน: ไฟฟ้า ${b.elec.toLocaleString()} kWh, น้ำ ${b.water} m³, เชื้อเพลิง ${b.fuel} ลิตร
          * การจัดการขยะ: ขยะทั่วไป ${b.waste.general} กก., ขยะรีไซเคิล ${b.waste.recycle} กก., ขยะอินทรีย์/กากกาแฟ ${b.waste.organic} กก., ขยะอันตราย ${b.waste.hazard} กก.
          * อัตรา Zero Waste (การนำขยะไปรีไซเคิล/ทำปุ๋ย): ${zeroWasteRate}%
          * สถานะสาขา: ${b.status === "excellent" ? "ดีเยี่ยม" : b.status === "good" ? "ดี" : "ปานกลาง"}
        `;
      }).join("\n");

      const systemContext = `
        คุณคือ "AI Sustainability Assistant" ผู้เชี่ยวชาญระดับสูงด้าน ESG, Carbon Footprint และ Zero Waste ของบริษัทกาแฟ Hillkoff
        
        หน้าที่ของคุณคือวิเคราะห์ข้อมูล ตอบคำถาม และให้คำแนะนำเชิงกลยุทธ์ในการลดคาร์บอนและการจัดการขยะอย่างละเอียด ถี่ถ้วน และเป็นมืออาชีพแต่เป็นกันเอง
        
        นี่คือข้อมูลสถานะปัจจุบันของทั้งองค์กร Hillkoff:
        [ภาพรวมทั้งบริษัท]
        - มีการกรอกข้อมูลรวมแล้วหรือไม่: ${hasData ? "กรอกแล้ว" : "ยังไม่มีข้อมูลในระบบ"}
        - คาร์บอนรวมรวมทุกสาขา: ${totals.co2.toFixed(2)} tCO2e
        - การใช้ไฟฟ้ารวม: ${totals.elec.toLocaleString()} kWh
        - จำนวนรายการบันทึกทั้งหมด: ${totals.entries} รายการ
        
        [ข้อมูลเจาะลึกรายสาขา]
        ${branchDetailsText}
        
        แนวทางการตอบคำถาม:
        1. หากผู้ใช้ถามภาพรวม ให้สรุปตัวเลขสำคัญ และวิเคราะห์ว่าสาขาไหนทำได้ดี (เช่น อัตรา Zero Waste สูง) หรือสาขาไหนควรปรับปรุง (เช่น ปล่อย Carbon สูง หรือใช้ไฟเยอะ)
        2. หากผู้ใช้ขอคำแนะนำ ให้แนะนำวิธีลดขยะ หรือลดการใช้ไฟฟ้าที่สอดคล้องกับธุรกิจกาแฟ (เช่น การจัดการกากกาแฟ, บรรจุภัณฑ์รักษ์โลก, การประหยัดไฟเครื่องคั่วหรือเครื่องชง)
        3. ตอบคำถามอย่างครอบคลุม มีการจัดหัวข้อข้อความ (ใช้ Bullet points) ให้อ่านง่าย สรุปใจความชัดเจน และสุภาพเรียบร้อย
      `;
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          { role: 'user', parts: [{ text: `${systemContext}\n\nคำถามจากผู้ใช้: ${txt}` }] }
        ],
      });

      const replyText = response.text || "ขออภัยครับ ระบบไม่สามารถดึงข้อมูลคำตอบได้";

      // 3. แทนที่สถานะโหลดด้วยคำตอบจริงที่ส่งกลับมาจาก Gemini
      setMsgs(m => {
        const copy = [...m];
        copy[copy.length - 1] = { type: "bot", text: replyText };
        return copy;
      });

    } catch (error) {
      console.error("Gemini API Error:", error);
      setMsgs(m => {
        const copy = [...m];
        copy[copy.length - 1] = { type: "bot", text: "เกิดข้อผิดพลาดในการเชื่อมต่อกับ AI กรุณาลองใหม่อีกครั้งครับ 😥" };
        return copy;
      });
    }
  };

  useEffect(() => { if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight; }, [msgs]);

  return (
    <>
      <button onClick={onClose} style={{
        position: "fixed", bottom: "calc(var(--nav-h) + 16px)", right: 16,
        width: 52, height: 52, background: "linear-gradient(135deg,#166534,#16a34a)",
        border: "none", borderRadius: "50%", fontSize: 24, cursor: "pointer",
        boxShadow: "0 4px 20px rgba(22,101,52,.4)", zIndex: 90,
        display: "flex", alignItems: "center", justifyContent: "center"
      }}>🤖</button>
      <div style={{
        position: "fixed", bottom: "calc(var(--nav-h) + 76px)", right: 16,
        width: "min(340px,calc(100vw - 32px))", background: "#fff",
        borderRadius: 24, boxShadow: "0 8px 40px rgba(22,101,52,.14)",
        border: "1px solid #d1fae5", zIndex: 90, overflow: "hidden",
        transform: open ? "scale(1) translateY(0)" : "scale(.9) translateY(20px)",
        opacity: open ? 1 : 0, pointerEvents: open ? "all" : "none",
        transition: "all .25s cubic-bezier(.4,0,.2,1)", transformOrigin: "bottom right",
        fontFamily: "var(--font)"
      }}>
        <div style={{ background: "linear-gradient(135deg,#0f4c2a,#15803d)", padding: "14px 16px", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 22 }}>🤖</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>AI Sustainability Assistant</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,.65)" }}>วิเคราะห์ ESG · Carbon · Zero Waste</div>
          </div>
        </div>
        <div ref={msgsRef} style={{ padding: 14, height: 220, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
          {msgs.map((m, i) => (
            <div key={i} style={{
              padding: "10px 12px", borderRadius: 14, fontSize: 12, lineHeight: 1.5,
              maxWidth: "88%", opacity: m.loading ? .6 : 1,
              alignSelf: m.type === "user" ? "flex-end" : "flex-start",
              background: m.type === "user" ? "#166534" : "#f0fdf4",
              color: m.type === "user" ? "#fff" : "#14532d",
              borderBottomLeftRadius: m.type === "bot" ? 4 : 14,
              borderBottomRightRadius: m.type === "user" ? 4 : 14,
            }}>{m.text}</div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, padding: "12px 14px", borderTop: "1px solid #d1fae5" }}>
          <input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send()}
            placeholder="ถามเกี่ยวกับ ESG / Carbon / ขยะ..."
            style={{ flex: 1, padding: "9px 12px", border: "1px solid #d1fae5", borderRadius: 12, fontFamily: "var(--font)", fontSize: 12, background: "#f0fdf4", color: "#14532d", outline: "none" }} />
          <button onClick={send} style={{ width: 36, height: 36, background: "#166534", color: "#fff", border: "none", borderRadius: 10, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>➤</button>
        </div>
      </div>
    </>
  );
}

// ─── PAGE: HOME ───────────────────────────────────────────────────────────────
function PageHome({ branches, monthlyCo2, onBranchClick, onGoUpload }) {
  const totals = branches.reduce((acc, b) => ({ co2: +(acc.co2 + b.co2).toFixed(4), elec: acc.elec + b.elec, water: acc.water + b.water, fuel: acc.fuel + b.fuel, entries: acc.entries + b.entries }), { co2: 0, elec: 0, water: 0, fuel: 0, entries: 0 });
  const hasData = branches.some(b => b.hasData);

  return (
    <div style={{ animation: "fadeUp .35s ease" }}>
      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg,#0f4c2a 0%,#166534 50%,#15803d 100%)", padding: "20px 20px 32px", margin: "0 -16px", marginBottom: 24, borderRadius: "0 0 32px 32px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, opacity: .04, backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4z' fill='white'/%3E%3C/svg%3E\")" }} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 40, height: 40, background: "rgba(255,255,255,.15)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, border: "1px solid rgba(255,255,255,.2)" }}>☕</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", lineHeight: 1 }}>Hillkoff</div>
              <div style={{ fontSize: 10, fontWeight: 300, color: "rgba(255,255,255,.75)", marginTop: 2 }}>Zero Waste Analytics</div>
            </div>
          </div>
          <div style={{ background: "rgba(255,255,255,.15)", border: "1px solid rgba(255,255,255,.25)", borderRadius: 20, padding: "4px 12px", color: "#fff", fontSize: 10, fontWeight: 500 }}>📊 Analytics Platform</div>
        </div>
        <div style={{ background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.2)", borderRadius: 24, padding: 20, backdropFilter: "blur(12px)", position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 500, color: "rgba(255,255,255,.65)", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 4 }}>Carbon Footprint รวมองค์กร</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 4 }}>
            <div style={{ fontSize: 52, fontWeight: 800, color: "#fff", lineHeight: 1, letterSpacing: -2 }}>{totals.co2}</div>
            <div style={{ color: "rgba(255,255,255,.6)", fontSize: 13, marginBottom: 10 }}>tCO₂e</div>
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,.6)", marginTop: 4 }}>{hasData ? "ข้อมูลสะสมทุกสาขา" : "ยังไม่มีข้อมูล — เริ่มกรอกหรืออัปโหลดในหน้า Upload"}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, margin: "14px 0" }}>
            {[totals.entries, totals.elec > 0 ? numFmt(totals.elec) : "0", "6"].map((v, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,.1)", borderRadius: 12, padding: "10px 8px", textAlign: "center", border: "1px solid rgba(255,255,255,.12)" }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>{v}</div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,.6)", marginTop: 2 }}>{["รายการ", "kWh", "สาขา"][i]}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {["ESG", "Net Zero", "Scope 1·2·3", "TCFD", "Zero Waste"].map(t => (
              <span key={t} style={{ padding: "3px 10px", borderRadius: 20, fontSize: 9, fontWeight: 600, letterSpacing: ".6px", textTransform: "uppercase", border: "1px solid rgba(255,255,255,.25)", color: "rgba(255,255,255,.85)", background: "rgba(255,255,255,.08)" }}>{t}</span>
            ))}
          </div>
          <button onClick={onGoUpload} style={{ width: "100%", marginTop: 14, padding: 13, background: "rgba(255,255,255,.95)", color: "#166534", border: "none", borderRadius: 14, fontFamily: "var(--font)", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 4px 20px rgba(0,0,0,.15)" }}>
            📝 กรอก / อัปโหลดข้อมูลสาขา
          </button>
        </div>
      </div>

      <SectionTitle>สาขาทั้งหมด</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 }}>
        {branches.map((b, i) => <BranchCard key={i} b={b} onClick={() => onBranchClick(i)} />)}
      </div>

      <SectionTitle style={{ marginTop: 32 }}>Carbon รายเดือน</SectionTitle>
      <div style={{ background: "#fff", borderRadius: 20, padding: 18, boxShadow: "0 4px 24px rgba(22,101,52,.08)", border: "1px solid #d1fae5" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#14532d" }}>Carbon Emission 2024</div>
        <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 14 }}>tCO₂e รายเดือน</div>
        <MiniBarChart data={monthlyCo2} labels={MONTHS} color="#16a34a" />
      </div>

      <SectionTitle style={{ marginTop: 32 }}>การใช้ทรัพยากรรวม</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
        {[["⚡", totals.elec, "kWh", "ไฟฟ้า"], ["💧", totals.water, "m³", "น้ำ"], ["⛽", totals.fuel, "L", "เชื้อเพลิง"]].map(([icon, val, unit, lbl]) => (
          <div key={lbl} style={{ background: "#fff", borderRadius: 16, padding: "14px 12px", textAlign: "center", boxShadow: "0 4px 24px rgba(22,101,52,.08)", border: "1px solid #d1fae5" }}>
            <div style={{ fontSize: 22, marginBottom: 4 }}>{icon}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: val > 0 ? "#166534" : "#6b7280", lineHeight: 1 }}>{val > 0 ? numFmt(val) : "0"}</div>
            <div style={{ fontSize: 9, fontWeight: 500, color: "#6b7280" }}>{unit}</div>
            <div style={{ fontSize: 10, color: "#6b7280", marginTop: 3 }}>{lbl}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 32, background: "linear-gradient(135deg,#0f4c2a,#166534)", borderRadius: 20, padding: 20, color: "#fff", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: -10, bottom: -10, fontSize: 80, opacity: .1 }}>🌿</div>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>🌱 Zero Waste & Sustainability</div>
        <div style={{ fontSize: 12, lineHeight: 1.7, opacity: .8 }}>"ระบบนี้ถูกพัฒนาขึ้นภายใต้แนวคิด Zero Waste และ Sustainability เพื่อช่วยให้องค์กรเห็นภาพการใช้ทรัพยากรได้ชัดขึ้น ลดต้นทุน ลด Carbon Emission และสนับสนุนแนวทาง ESG / Net Zero อย่างเป็นรูปธรรม"</div>
      </div>
    </div>
  );
}

// ─── PAGE: UPLOAD ─────────────────────────────────────────────────────────────
function PageUpload({ branches, onSave, showToast }) {
  const [branchId, setBranchId] = useState("HQ");
  const [month, setMonth] = useState("2024-06");
  const [elec, setElec] = useState(""); const [elecThb, setElecThb] = useState("");
  const [water, setWater] = useState(""); const [waterThb, setWaterThb] = useState("");
  const [fuel, setFuel] = useState(""); const [fuelType, setFuelType] = useState("diesel");
  const [matCat, setMatCat] = useState(""); const [matItemIdx, setMatItemIdx] = useState("");
  const [matQty, setMatQty] = useState("");
  const [matEntries, setMatEntries] = useState([]);
  const [waste, setWaste] = useState({ food: "", paper: "", plastic: "", rPaper: "", rPlastic: "", rMetal: "", oCoffee: "", oFood: "", oOther: "", hChem: "", hBatt: "", hLandfill: "" });
  const [note, setNote] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  // Track which files are "done" and ready to analyze
  const [readyFiles, setReadyFiles] = useState([]);
  const fileRef = useRef();

  const currentItems = matCat && MAT_CATALOG[matCat] ? MAT_CATALOG[matCat].items : [];
  const currentUnit = matCat && matItemIdx !== "" && MAT_CATALOG[matCat]?.items[parseInt(matItemIdx)] ? MAT_CATALOG[matCat].items[parseInt(matItemIdx)].unit : "—";

  // Check if there's anything to analyze (manual input OR uploaded files)
  const hasManualData = (parseFloat(elec) || 0) > 0 || (parseFloat(water) || 0) > 0 || (parseFloat(fuel) || 0) > 0 || matEntries.length > 0;
  const hasFileData = readyFiles.length > 0;
  const canAnalyze = hasManualData || hasFileData;

  const addMat = () => {
    if (!matCat) { showToast("⚠️ เลือกหมวดหมู่ก่อน"); return; }
    if (matItemIdx === "") { showToast("⚠️ เลือกรายการก่อน"); return; }
    const q = parseFloat(matQty); if (!q || q <= 0) { showToast("⚠️ กรอกจำนวนให้ถูกต้อง"); return; }
    const item = MAT_CATALOG[matCat].items[parseInt(matItemIdx)];
    const catLabel = MAT_CATALOG[matCat].label.replace(/^[^ ]+ /, "");
    setMatEntries(prev => {
      const ex = prev.find(e => e.cat === matCat && e.name === item.name);
      if (ex) return prev.map(e => e.cat === matCat && e.name === item.name ? { ...e, qty: e.qty + q } : e);
      return [...prev, { cat: matCat, catLabel, name: item.name, qty: q, unit: item.unit }];
    });
    setMatQty("");
  };

  const handleFile = (file) => {
    const ext = file.name.split(".").pop().toLowerCase();
    if (!["xlsx", "csv", "pdf"].includes(ext)) { showToast("⚠️ ไฟล์นี้ไม่รองรับ"); return; }
    const id = Date.now() + Math.random();
    setUploadedFiles(prev => [{ id, name: file.name, ext, size: file.size > 1048576 ? (file.size / 1048576).toFixed(1) + "MB" : Math.round(file.size / 1024) + "KB", status: "processing" }, ...prev]);
    // After 2s mark as done and add to readyFiles
    setTimeout(() => {
      setUploadedFiles(prev => prev.map(f => f.id === id ? { ...f, status: "done" } : f));
      setReadyFiles(prev => [...prev, { id, name: file.name, ext }]);
      showToast("✅ นำเข้าสำเร็จ: " + file.name + " — กด 'วิเคราะห์' เพื่อประมวลผล");
    }, 2000);
  };

  const analyze = () => {
    if (!canAnalyze) { showToast("⚠️ กรุณากรอกข้อมูลหรืออัปโหลดไฟล์อย่างน้อย 1 รายการ"); return; }
    setAnalyzing(true);

    setTimeout(() => {
      // ── Aggregate manual input ──
      let totalElec = parseFloat(elec) || 0;
      let totalWater = parseFloat(water) || 0;
      let totalFuel = parseFloat(fuel) || 0;
      let totalWGen = 0, totalWRec = 0, totalWOrg = 0, totalWHaz = 0;
      let totalMatCount = matEntries.length;
      let fileDescriptions = [];

      // Add manual waste
      totalWGen += (parseFloat(waste.food) || 0) + (parseFloat(waste.paper) || 0) + (parseFloat(waste.plastic) || 0);
      totalWRec += (parseFloat(waste.rPaper) || 0) + (parseFloat(waste.rPlastic) || 0) + (parseFloat(waste.rMetal) || 0);
      totalWOrg += (parseFloat(waste.oCoffee) || 0) + (parseFloat(waste.oFood) || 0) + (parseFloat(waste.oOther) || 0);
      totalWHaz += (parseFloat(waste.hChem) || 0) + (parseFloat(waste.hBatt) || 0) + (parseFloat(waste.hLandfill) || 0);

      // ── Aggregate file data ──
      for (const f of readyFiles) {
        const extracted = simulateFileExtraction(f.name, branchId);
        totalElec += extracted.elec;
        totalWater += extracted.water;
        totalFuel += extracted.fuel;
        totalWGen += extracted.wGen;
        totalWRec += extracted.wRec;
        totalWOrg += extracted.wOrg;
        totalWHaz += extracted.wHaz;
        totalMatCount += extracted.matCount;
        fileDescriptions.push(extracted.description);
      }

      // ── Carbon calculation ──
      const ff = { diesel: 2.67, gasoline: 2.31, lpg: 2.98, cng: 2.15 }[fuelType] || 2.31;
      const co2Elec = +(totalElec * 0.4716 / 1000).toFixed(4);
      const co2Water = +(totalWater * 0.00149).toFixed(4);
      const co2Fuel = +(totalFuel * ff / 1000).toFixed(4);
      const co2Total = +(co2Elec + co2Water + co2Fuel).toFixed(4);

      const wTotal = totalWGen + totalWRec + totalWOrg + totalWHaz;
      const rr = wTotal > 0 ? ((totalWRec + totalWOrg) / wTotal * 100).toFixed(1) : 0;

      onSave({
        branchId, month, elec: totalElec, water: totalWater, fuel: totalFuel,
        co2Total, co2Elec, co2Water, co2Fuel,
        wGen: totalWGen, wRec: totalWRec, wOrg: totalWOrg, wHaz: totalWHaz,
        matCount: totalMatCount, recycleRate: rr
      });

      setResult({
        co2Elec, co2Water, co2Fuel, co2Total,
        elec: totalElec, water: totalWater, fuel: totalFuel,
        wGen: totalWGen, wRec: totalWRec, wOrg: totalWOrg, wHaz: totalWHaz,
        wTotal, rr, matCount: totalMatCount,
        matEntries: [...matEntries],
        branchName: branches.find(b => b.id === branchId)?.name || branchId,
        filesUsed: readyFiles.length,
        fileDescriptions,
        hasManual: hasManualData,
      });

      // Clear after analysis
      setMatEntries([]);
      setReadyFiles([]);
      setAnalyzing(false);
    }, 1400);
  };

  const inp = (val, set, ph = "0") => (
    <input type="number" value={val} onChange={e => set(e.target.value)} placeholder={ph} min="0"
      style={{ padding: "9px 12px", border: "1.5px solid #d1fae5", borderRadius: 10, fontFamily: "var(--font)", fontSize: 13, color: "#14532d", background: "#f0fdf4", outline: "none", width: "100%" }} />
  );
  const sel = (val, set, opts) => (
    <select value={val} onChange={e => set(e.target.value)}
      style={{ padding: "9px 12px", border: "1.5px solid #d1fae5", borderRadius: 10, fontFamily: "var(--font)", fontSize: 13, color: "#14532d", background: "#f0fdf4", outline: "none", width: "100%", appearance: "none", cursor: "pointer" }}>
      {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
    </select>
  );
  const WasteIn = ({ label, k }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <div style={{ fontSize: 10, color: "#6b7280" }}>{label}</div>
      <input type="number" value={waste[k]} onChange={e => setWaste(p => ({ ...p, [k]: e.target.value }))} placeholder="0" min="0"
        style={{ padding: "8px 10px", border: "1.5px solid #d1fae5", borderRadius: 8, fontFamily: "var(--mono)", fontSize: 12, color: "#14532d", background: "#f0fdf4", outline: "none", textAlign: "right" }} />
    </div>
  );

  return (
    <div style={{ animation: "fadeUp .35s ease" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg,#0f4c2a,#15803d)", padding: "20px 20px 14px", margin: "0 -16px 24px", borderRadius: "0 0 32px 32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 40, height: 40, background: "rgba(255,255,255,.15)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, border: "1px solid rgba(255,255,255,.2)" }}>☕</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>Hillkoff</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,.75)" }}>Zero Waste Analytics</div>
          </div>
        </div>
        <div style={{ background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.2)", borderRadius: 16, padding: "12px 16px", marginTop: 14 }}>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,.65)", letterSpacing: "1.5px", textTransform: "uppercase" }}>Data Entry & File Import</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4 }}>
            <span style={{ fontSize: 28 }}>📝</span>
            <div>
              <div style={{ color: "#fff", fontSize: 15, fontWeight: 700 }}>กรอกข้อมูล / นำเข้าไฟล์</div>
              <div style={{ color: "rgba(255,255,255,.65)", fontSize: 11 }}>กรอกบิล · ขยะ · วัสดุ หรืออัปโหลด Excel/CSV/PDF แล้วกดวิเคราะห์</div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Step indicator ─── */}
      <div style={{ background: "#fff", borderRadius: 16, padding: "12px 16px", border: "1px solid #d1fae5", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>💡</div>
        <div style={{ fontSize: 12, color: "#374151", lineHeight: 1.6 }}>
          <b style={{ color: "#14532d" }}>วิธีใช้:</b> อัปโหลดไฟล์ <b>หรือ</b> กรอกข้อมูลด้วยตนเอง อย่างใดอย่างหนึ่งก็ได้ แล้วกด <b>"วิเคราะห์"</b>
        </div>
      </div>

      {/* Upload Zone */}
      <SectionTitle>① อัปโหลดไฟล์ (Excel / CSV / PDF)</SectionTitle>
      <div onClick={() => fileRef.current?.click()} style={{ border: "2px dashed #86efac", borderRadius: 20, padding: "40px 20px", textAlign: "center", background: "#f0fdf4", cursor: "pointer", transition: "all .2s" }}
        onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); Array.from(e.dataTransfer.files).forEach(handleFile); }}>
        <input ref={fileRef} type="file" multiple accept=".xlsx,.csv,.pdf" style={{ display: "none" }} onChange={e => Array.from(e.target.files).forEach(handleFile)} />
        <div style={{ fontSize: 44, marginBottom: 10 }}>📂</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#14532d" }}>ลากไฟล์มาวางที่นี่</div>
        <div style={{ fontSize: 12, color: "#6b7280" }}>หรือคลิกเพื่อเลือกไฟล์</div>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 10 }}>
          {["Excel", "CSV", "PDF"].map(t => <span key={t} style={{ padding: "4px 10px", borderRadius: 8, fontSize: 10, fontWeight: 600, background: "#fff", color: "#15803d", border: "1px solid #d1fae5" }}>{t}</span>)}
        </div>
      </div>

      {/* Upload History */}
      {uploadedFiles.length > 0 && (
        <>
          <SectionTitle style={{ marginTop: 16 }}>ไฟล์ที่นำเข้า</SectionTitle>
          {uploadedFiles.map(f => (
            <div key={f.id} style={{ background: "#fff", borderRadius: 14, padding: "12px 14px", marginBottom: 8, display: "flex", alignItems: "center", gap: 12, border: "1px solid #d1fae5", boxShadow: "0 4px 24px rgba(22,101,52,.08)", animation: "fadeUp .3s ease" }}>
              <span style={{ fontSize: 28 }}>{({ xlsx: "📊", csv: "📋", pdf: "📄" })[f.ext] || "📄"}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#14532d", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</div>
                <div style={{ fontSize: 10, color: "#6b7280", marginTop: 2 }}>{f.size} · {f.ext.toUpperCase()}</div>
                {f.status === "processing" && (
                  <div style={{ width: "100%", height: 3, background: "#dcfce7", borderRadius: 3, marginTop: 6, overflow: "hidden" }}>
                    <div style={{ height: "100%", borderRadius: 3, background: "linear-gradient(90deg,#16a34a,#22c55e)", animation: "progress 1.5s ease forwards" }} />
                  </div>
                )}
                {f.status === "done" && (
                  <div style={{ fontSize: 10, color: "#15803d", marginTop: 3 }}>✓ พร้อมวิเคราะห์ — กดปุ่มด้านล่างเพื่อประมวลผล</div>
                )}
              </div>
              <span style={{ fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 8, background: f.status === "done" ? "#dcfce7" : "#fef9c3", color: f.status === "done" ? "#166534" : "#854d0e" }}>
                {f.status === "done" ? "✓ พร้อม" : "กำลังอ่าน..."}
              </span>
            </div>
          ))}
        </>
      )}

      {/* Ready to analyze banner */}
      {hasFileData && (
        <div style={{ background: "linear-gradient(90deg,#166534,#15803d)", borderRadius: 14, padding: "12px 16px", marginBottom: 4, display: "flex", alignItems: "center", gap: 10, animation: "fadeUp .3s ease" }}>
          <span style={{ fontSize: 22 }}>📂</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{readyFiles.length} ไฟล์พร้อมวิเคราะห์</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,.7)", marginTop: 1 }}>ระบบจะอ่านข้อมูลจากไฟล์และคำนวณ Carbon อัตโนมัติ</div>
          </div>
          <span style={{ fontSize: 10, padding: "3px 10px", borderRadius: 20, background: "rgba(255,255,255,.2)", color: "#fff", fontWeight: 700 }}>AI Ready</span>
        </div>
      )}

      {/* Divider */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "20px 0 16px" }}>
        <div style={{ flex: 1, height: 1, background: "#d1fae5" }} />
        <span style={{ fontSize: 11, color: "#6b7280", fontWeight: 600, whiteSpace: "nowrap" }}>หรือกรอกข้อมูลด้วยตนเอง</span>
        <div style={{ flex: 1, height: 1, background: "#d1fae5" }} />
      </div>

      {/* Manual Entry */}
      <SectionTitle>② กรอกข้อมูลด้วยตนเอง (ถ้ามี)</SectionTitle>

      {/* ① Branch + Month */}
      <FormCard title="🏢 เลือกสาขาและช่วงเวลา" sub="เลือกสาขาที่ต้องการบันทึก และระบุเดือน/ปี">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <FormGroup label="สาขา">{sel(branchId, setBranchId, [["HQ", "🏢 สำนักงานใหญ่"], ["CPK", "🌿 ช้างเผือก"], ["MHD", "🎓 มหิดล"], ["PPG", "🌳 ป่าแพ่ง"], ["TD", "☕ ทับเดื่อ"], ["RTK", "🫘 ราติก้า"]])}</FormGroup>
          <FormGroup label="เดือน / ปี"><input type="month" value={month} onChange={e => setMonth(e.target.value)} style={{ padding: "9px 12px", border: "1.5px solid #d1fae5", borderRadius: 10, fontFamily: "var(--font)", fontSize: 13, color: "#14532d", background: "#f0fdf4", outline: "none", width: "100%" }} /></FormGroup>
        </div>
      </FormCard>

      {/* ② Utilities */}
      <FormCard title="⚡ ค่าสาธารณูปโภค" sub="กรอกข้อมูลจากบิลค่าน้ำ ค่าไฟ และเชื้อเพลิง (ไม่บังคับหากอัปโหลดไฟล์)">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
          <FormGroup label="ค่าไฟฟ้า (kWh)"><div>{inp(elec, setElec)}</div></FormGroup>
          <FormGroup label="ค่าไฟฟ้า (บาท)"><div>{inp(elecThb, setElecThb)}</div></FormGroup>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
          <FormGroup label="ค่าน้ำประปา (m³)">{inp(water, setWater)}</FormGroup>
          <FormGroup label="ค่าน้ำประปา (บาท)">{inp(waterThb, setWaterThb)}</FormGroup>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <FormGroup label="เชื้อเพลิง (ลิตร)">{inp(fuel, setFuel)}</FormGroup>
          <FormGroup label="ประเภทเชื้อเพลิง">{sel(fuelType, setFuelType, [["diesel", "ดีเซล"], ["gasoline", "เบนซิน"], ["lpg", "LPG (กก.)"], ["cng", "CNG (กก.)"]])}</FormGroup>
        </div>
      </FormCard>

      {/* ③ Materials */}
      <FormCard title="📦 รายการเบิกใช้วัสดุ" sub="เลือกหมวดหมู่ → เลือกรายการ → กรอกจำนวน → กด เพิ่ม">
        <div style={{ border: "1.5px solid #d1fae5", borderRadius: 12, overflow: "hidden", background: "#f0fdf4" }}>
          <div style={{ display: "flex", gap: 8, padding: "10px 12px", background: "#f0fdf4", borderBottom: "1.5px solid #d1fae5", flexWrap: "wrap" }}>
            <select value={matCat} onChange={e => { setMatCat(e.target.value); setMatItemIdx(""); }}
              style={{ flex: 1, minWidth: 0, padding: "8px 12px", border: "1.5px solid #d1fae5", borderRadius: 9, fontFamily: "var(--font)", fontSize: 12, color: "#14532d", background: "#fff", outline: "none", cursor: "pointer" }}>
              <option value="">— เลือกหมวด —</option>
              {Object.entries(MAT_CATALOG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <select value={matItemIdx} onChange={e => setMatItemIdx(e.target.value)}
              style={{ flex: 1.5, minWidth: 0, padding: "8px 12px", border: "1.5px solid #d1fae5", borderRadius: 9, fontFamily: "var(--font)", fontSize: 12, color: "#14532d", background: "#fff", outline: "none", cursor: "pointer" }}>
              <option value="">— เลือกรายการ —</option>
              {currentItems.map((item, i) => <option key={i} value={i}>{item.name}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", background: "#f0fdf4", borderBottom: "1.5px solid #d1fae5" }}>
            <input type="number" value={matQty} onChange={e => setMatQty(e.target.value)} onKeyDown={e => e.key === "Enter" && addMat()} placeholder="0" min="0"
              style={{ width: 90, padding: "8px 10px", border: "1.5px solid #d1fae5", borderRadius: 9, fontFamily: "var(--mono)", fontSize: 13, color: "#14532d", background: "#fff", outline: "none", textAlign: "right" }} />
            <span style={{ fontSize: 11, color: "#6b7280", whiteSpace: "nowrap" }}>{currentUnit}</span>
            <button onClick={addMat} style={{ padding: "8px 16px", background: "#166534", color: "#fff", border: "none", borderRadius: 9, fontFamily: "var(--font)", fontSize: 12, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>+ เพิ่มรายการ</button>
          </div>
          <div style={{ padding: 12 }}>
            {matEntries.length === 0 ? (
              <div style={{ textAlign: "center", padding: 20, color: "#6b7280", fontSize: 12, border: "1.5px dashed #d1fae5", borderRadius: 10 }}>ยังไม่มีรายการ — เลือกและกด "เพิ่มรายการ"</div>
            ) : matEntries.map((e, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", background: "#f0fdf4", borderRadius: 10, border: "1px solid #d1fae5", marginBottom: 6, animation: "fadeUp .2s ease" }}>
                <span style={{ fontSize: 9, fontWeight: 600, padding: "2px 7px", borderRadius: 6, background: "#dcfce7", color: "#166634", whiteSpace: "nowrap", border: "1px solid #d1fae5" }}>{e.catLabel}</span>
                <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: "#14532d" }}>{e.name}</span>
                <span style={{ fontFamily: "var(--mono)", fontSize: 12, fontWeight: 600, color: "#166534", whiteSpace: "nowrap" }}>{e.qty} {e.unit}</span>
                <button onClick={() => setMatEntries(prev => prev.filter((_, j) => j !== i))} style={{ width: 24, height: 24, border: "none", background: "rgba(239,68,68,.1)", borderRadius: 6, color: "#ef4444", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: "linear-gradient(90deg,#0f4c2a,#15803d)", borderRadius: "0 0 10px 10px" }}>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,.8)" }}>รายการที่เพิ่มแล้ว</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{matEntries.length} รายการ</span>
          </div>
        </div>
      </FormCard>

      {/* ④ Waste */}
      <FormCard title="♻️ ปริมาณขยะ" sub="บันทึกขยะแต่ละประเภทที่เกิดขึ้นในเดือนนี้ (กิโลกรัม)">
        {[
          ["🗑️ ขยะทั่วไป (ทิ้ง)", [["อาหาร/เศษอาหาร","food"],["กระดาษ","paper"],["พลาสติก","plastic"]]],
          ["♻️ รีไซเคิล", [["กระดาษ","rPaper"],["พลาสติก/แก้ว","rPlastic"],["โลหะ/อื่นๆ","rMetal"]]],
          ["🌱 ขยะอินทรีย์ (ทำปุ๋ย)", [["กากกาแฟ","oCoffee"],["เศษอาหาร","oFood"],["อื่นๆ","oOther"]]],
          ["⚠️ ขยะอันตราย / ฝังกลบ", [["สารเคมี","hChem"],["แบตเตอรี่","hBatt"],["ฝังกลบอื่นๆ","hLandfill"]]],
        ].map(([lbl, fields]) => (
          <div key={lbl}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#14532d", display: "flex", alignItems: "center", gap: 6, margin: "10px 0 6px", padding: "6px 10px", background: "#f0fdf4", borderRadius: 8 }}>{lbl}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              {fields.map(([l, k]) => <WasteIn key={k} label={l} k={k} />)}
            </div>
          </div>
        ))}
      </FormCard>

      {/* ⑤ Note */}
      <FormCard title="📝 หมายเหตุเพิ่มเติม">
        <FormGroup label="บันทึกข้อความ (ถ้ามี)">
          <textarea value={note} onChange={e => setNote(e.target.value)} rows={3} placeholder="เช่น มีการปิดปรับปรุง / กิจกรรมพิเศษในเดือนนี้..."
            style={{ padding: "9px 12px", border: "1.5px solid #d1fae5", borderRadius: 10, fontFamily: "var(--font)", fontSize: 13, color: "#14532d", background: "#f0fdf4", outline: "none", width: "100%", resize: "vertical", lineHeight: 1.6 }} />
        </FormGroup>
      </FormCard>

      {/* ─── Analyze Button ─── */}
      <button onClick={analyze} disabled={analyzing} style={{
        width: "100%", padding: 16,
        background: canAnalyze
          ? "linear-gradient(135deg,#166534,#16a34a)"
          : "#d1fae5",
        color: canAnalyze ? "#fff" : "#6b7280",
        border: "none", borderRadius: 16, fontFamily: "var(--font)",
        fontSize: 15, fontWeight: 700, cursor: analyzing ? "not-allowed" : canAnalyze ? "pointer" : "not-allowed",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
        boxShadow: canAnalyze ? "0 4px 20px rgba(22,101,52,.35)" : "none",
        marginTop: 14, transition: "all .3s",
        opacity: analyzing ? .7 : 1
      }}>
        {analyzing
          ? <><span style={{ display: "inline-block", animation: "spin .8s linear infinite" }}>⏳</span> กำลังคำนวณ Carbon...</>
          : canAnalyze
            ? <>🔍 วิเคราะห์และบันทึกข้อมูล {hasFileData ? `(${readyFiles.length} ไฟล์${hasManualData ? " + ข้อมูลด้วยตนเอง" : ""})` : ""}</>
            : "🔍 วิเคราะห์และบันทึกข้อมูล"
        }
      </button>
      {!canAnalyze && (
        <div style={{ textAlign: "center", fontSize: 11, color: "#6b7280", marginTop: 6 }}>
          อัปโหลดไฟล์ หรือ กรอกข้อมูลอย่างน้อย 1 รายการ แล้วกดวิเคราะห์
        </div>
      )}

      {/* ─── Result ─── */}
      {result && (
        <div style={{ marginTop: 12, animation: "fadeUp .3s ease" }}>
          <div style={{ background: "linear-gradient(135deg,#0f4c2a,#15803d)", borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 28 }}>✅</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>บันทึกสำเร็จ — {result.branchName} · {month}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,.7)", marginTop: 2 }}>
                Carbon: {result.co2Total} tCO₂e · ขยะรีไซเคิล: {result.rr}%
                {result.filesUsed > 0 && ` · จากไฟล์: ${result.filesUsed} ไฟล์`}
                {result.matCount > 0 && ` · วัสดุ: ${result.matCount} รายการ`}
              </div>
            </div>
          </div>

          {/* Source breakdown */}
          {result.filesUsed > 0 && (
            <div style={{ background: "#fff", borderRadius: 12, padding: 12, marginTop: 8, border: "1px solid #d1fae5" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#14532d", marginBottom: 6 }}>📂 ข้อมูลที่อ่านได้จากไฟล์</div>
              {result.fileDescriptions.map((d, i) => (
                <div key={i} style={{ fontSize: 11, color: "#6b7280", padding: "4px 0", borderBottom: i < result.fileDescriptions.length - 1 ? "1px solid #f0fdf4" : "none" }}>
                  ✓ {d}
                </div>
              ))}
            </div>
          )}

          <div style={{ background: "#fff", borderRadius: 14, padding: 12, marginTop: 8, border: "1px solid #d1fae5" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[
                ["ไฟฟ้า", result.elec + " kWh", "→ " + result.co2Elec + " tCO₂e"],
                ["น้ำ", result.water + " m³", "→ " + result.co2Water + " tCO₂e"],
                ["เชื้อเพลิง", result.fuel + " ลิตร", "→ " + result.co2Fuel + " tCO₂e"],
                ["อัตรารีไซเคิล", result.rr + "%", "ของขยะทั้งหมด"],
              ].map(([l, v, u]) => (
                <div key={l} style={{ textAlign: "center", padding: 10, background: "#f0fdf4", borderRadius: 10 }}>
                  <div style={{ fontSize: 9, color: "#6b7280" }}>{l}</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "#166534" }}>{v}</div>
                  <div style={{ fontSize: 9, color: "#6b7280" }}>{u}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 10, padding: 10, background: "linear-gradient(135deg,#f0fdf4,#dcfce7)", borderRadius: 10, border: "1px solid #bbf7d0", textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "#6b7280" }}>Carbon Emission รวม</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#166534" }}>{result.co2Total} <span style={{ fontSize: 13, fontWeight: 500 }}>tCO₂e</span></div>
            </div>
            {result.wTotal > 0 && (
              <div style={{ marginTop: 8, padding: 10, background: "#fef9c3", borderRadius: 10, border: "1px solid #fde68a" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#92400e", marginBottom: 4 }}>♻️ สรุปขยะ</div>
                <div style={{ fontSize: 11, color: "#78350f", lineHeight: 1.7 }}>
                  ทิ้ง: <b>{result.wGen.toFixed(1)} กก.</b> · รีไซเคิล: <b>{result.wRec.toFixed(1)} กก.</b> · ปุ๋ย: <b>{result.wOrg.toFixed(1)} กก.</b> · อันตราย: <b>{result.wHaz.toFixed(1)} กก.</b><br />
                  รวม: <b>{result.wTotal.toFixed(1)} กก.</b> · Zero Waste Rate: <b>{result.rr}%</b>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── PAGE: ANALYTICS ──────────────────────────────────────────────────────────
function PageAnalytics({ branches, monthlyCo2 }) {
  const hasData = branches.some(b => b.hasData);
  const totals = branches.reduce((acc, b) => ({ co2: +(acc.co2 + b.co2).toFixed(4), elec: acc.elec + b.elec, water: acc.water + b.water, fuel: acc.fuel + b.fuel, entries: acc.entries + b.entries }), { co2: 0, elec: 0, water: 0, fuel: 0, entries: 0 });

  const baseCO2 = totals.co2;
  const futureMonths = ["ก.ค.", "ส.ค.", "ก.ย."];
  const forecasts = futureMonths.map((m, i) => {
    const seed = (baseCO2 * 1000 + i * 77) | 0;
    const r = ((seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
    const trend = (r - .4) * 8;
    return { month: m, val: (baseCO2 * (1 + trend / 100)).toFixed(2), trend };
  });

  const e = +(totals.elec * 0.4716 / 1000).toFixed(2);
  const w = +(totals.water * 0.00149).toFixed(2);
  const f = +(totals.fuel * 2.31 / 1000).toFixed(2);

  return (
    <div style={{ animation: "fadeUp .35s ease" }}>
      <PageHeader title="📊 Analytics + AI Forecast" sub="วิเคราะห์และคาดการณ์ด้วย AI" />

      <SectionTitle>AI Forecast · คาดการณ์</SectionTitle>
      <div style={{ background: "#fff", borderRadius: 20, padding: 16, border: "1px solid #d1fae5", boxShadow: "0 4px 24px rgba(22,101,52,.08)", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: 20 }}>🤖</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#14532d" }}>AI Carbon Forecast (3 เดือนข้างหน้า)</span>
          <span style={{ marginLeft: "auto", fontSize: 9, padding: "2px 8px", borderRadius: 8, background: "linear-gradient(90deg,#7c3aed,#4f46e5)", color: "#fff", fontWeight: 600 }}>AI Powered</span>
        </div>
        {!hasData ? (
          <div style={{ textAlign: "center", padding: "24px 20px", color: "#6b7280" }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>🤖</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#14532d", marginBottom: 6 }}>ยังไม่มีข้อมูลสำหรับคาดการณ์</div>
            <div style={{ fontSize: 12 }}>กรอกข้อมูลหรืออัปโหลดไฟล์อย่างน้อย 1 รายการเพื่อให้ AI เริ่มคาดการณ์ได้</div>
          </div>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
              {forecasts.map(fc => (
                <div key={fc.month} style={{ background: "#f0fdf4", borderRadius: 12, padding: 10, textAlign: "center", border: "1px solid #d1fae5" }}>
                  <div style={{ fontSize: 10, color: "#6b7280", marginBottom: 4 }}>{fc.month} 2024</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#166534" }}>{fc.val}</div>
                  <div style={{ fontSize: 9, color: "#6b7280" }}>tCO₂e</div>
                  <div style={{ fontSize: 9, marginTop: 2, fontWeight: 600, color: fc.trend > 0 ? "#ef4444" : "#16a34a" }}>
                    {fc.trend > 0 ? "▲" : "▼"} {Math.abs(fc.trend).toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
            <div style={{ background: "rgba(124,58,237,.08)", border: "1px solid rgba(124,58,237,.2)", borderRadius: 12, padding: 12, marginTop: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#7c3aed", marginBottom: 6 }}>💡 AI Insight</div>
              <div style={{ fontSize: 11, lineHeight: 1.6, color: "#6b7280" }}>
                จากข้อมูล {totals.entries} รายการ — Carbon Emission รวม {totals.co2} tCO₂e แนะนำติดตามการใช้ไฟฟ้าเป็นหลัก เพราะเป็นแหล่ง Scope 2 ที่ใหญ่ที่สุด 🌱
              </div>
            </div>
          </>
        )}
      </div>

      <SectionTitle>วิเคราะห์ข้อมูล</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8, marginBottom: 14 }}>
        {[["Carbon รวม", totals.co2, "tCO₂e", totals.co2 > 0], ["ไฟฟ้ารวม", totals.elec > 0 ? numFmt(totals.elec) : "0", "kWh", totals.elec > 0], ["น้ำรวม", totals.water > 0 ? numFmt(totals.water) : "0", "m³", totals.water > 0], ["เชื้อเพลิง", totals.fuel > 0 ? numFmt(totals.fuel) : "0", "ลิตร", totals.fuel > 0]].map(([lbl, val, unit, hasD]) => (
          <div key={lbl} style={{ background: "#fff", borderRadius: 14, padding: 12, border: "1px solid #d1fae5", boxShadow: "0 4px 24px rgba(22,101,52,.08)" }}>
            <div style={{ fontSize: 10, color: "#6b7280", fontWeight: 500, marginBottom: 4 }}>{lbl}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: hasD ? "#166534" : "#6b7280", lineHeight: 1 }}>{val}</div>
            <div style={{ fontSize: 10, color: "#6b7280" }}>{unit}</div>
          </div>
        ))}
      </div>

      <div style={{ background: "#fff", borderRadius: 20, padding: 18, boxShadow: "0 4px 24px rgba(22,101,52,.08)", border: "1px solid #d1fae5", marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#14532d" }}>Carbon รายเดือน</div>
        <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 14 }}>tCO₂e แต่ละเดือน</div>
        <MiniBarChart data={monthlyCo2} labels={MONTHS} />
      </div>

      <SectionTitle>เปรียบเทียบสาขา</SectionTitle>
      <div style={{ background: "#fff", borderRadius: 20, padding: 18, boxShadow: "0 4px 24px rgba(22,101,52,.08)", border: "1px solid #d1fae5", marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#14532d", marginBottom: 4 }}>Sustainability Score</div>
        <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 12 }}>คะแนนความยั่งยืนแต่ละสาขา</div>
        {branches.map((b, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div style={{ width: 28, textAlign: "center", fontSize: 14 }}>{b.icon}</div>
            <div style={{ width: 32, fontSize: 10, color: "#6b7280" }}>{b.id}</div>
            <div style={{ flex: 1, height: 10, background: "#f0fdf4", borderRadius: 5, overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: 5, background: b.hasData ? b.color : "#e5e7eb", width: `${b.score}%`, transition: "width 1s ease" }} />
            </div>
            <div style={{ width: 28, textAlign: "right", fontSize: 11, fontWeight: 700, color: b.hasData ? "#166534" : "#6b7280" }}>{b.hasData ? b.score : "—"}</div>
          </div>
        ))}
      </div>

      <SectionTitle>Carbon Breakdown</SectionTitle>
      <div style={{ background: "#fff", borderRadius: 20, padding: 18, boxShadow: "0 4px 24px rgba(22,101,52,.08)", border: "1px solid #d1fae5" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#14532d", marginBottom: 4 }}>สัดส่วน Carbon Emission</div>
        <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 14 }}>แยกตามแหล่งกำเนิด</div>
        <DonutChart slices={[e, w, f]} labels={["ไฟฟ้า · " + e + " tCO₂e", "น้ำ · " + w + " tCO₂e", "เชื้อเพลิง · " + f + " tCO₂e"]} />
      </div>
    </div>
  );
}

// ─── PAGE: RANKING ────────────────────────────────────────────────────────────
function PageRanking({ branches, onBranchClick }) {
  const [mode, setMode] = useState("score");
  const hasData = branches.some(b => b.hasData);

  let sorted = [...branches];
  sorted.sort((a, b) => {
    if (a.hasData && !b.hasData) return -1;
    if (!a.hasData && b.hasData) return 1;
    if (mode === "score") return b.score - a.score;
    if (mode === "carbon") return a.co2 - b.co2;
    return a.elec - b.elec;
  });

  const withData = sorted.filter(b => b.hasData);
  const maxVal = withData.length > 0 ? (mode === "score" ? 100 : mode === "carbon" ? Math.max(...withData.map(b => b.co2)) : Math.max(...withData.map(b => b.elec))) : 1;
  const medals = ["🥇", "🥈", "🥉"];
  const unit = mode === "score" ? "pts" : mode === "carbon" ? "tCO₂e" : "kWh";

  return (
    <div style={{ animation: "fadeUp .35s ease" }}>
      <PageHeader title="🏆 Ranking" sub="จัดอันดับสาขา Sustainability" />
      <SectionTitle>จัดอันดับสาขา</SectionTitle>
      <div style={{ display: "flex", gap: 6, marginBottom: 16, overflowX: "auto", paddingBottom: 2 }}>
        {[["score", "Sustainability"], ["carbon", "Carbon ต่ำสุด"], ["energy", "ประหยัดพลังงาน"]].map(([k, l]) => (
          <button key={k} onClick={() => setMode(k)} style={{ padding: "7px 16px", borderRadius: 20, fontFamily: "var(--font)", fontSize: 12, fontWeight: 600, border: "1px solid #d1fae5", background: mode === k ? "#166534" : "#fff", color: mode === k ? "#fff" : "#6b7280", cursor: "pointer", whiteSpace: "nowrap", transition: "all .2s" }}>{l}</button>
        ))}
      </div>

      {!hasData ? (
        <div style={{ background: "#fff", borderRadius: 20, padding: "32px 20px", border: "1px solid #d1fae5", textAlign: "center", color: "#6b7280" }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>🏆</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#14532d", marginBottom: 6 }}>ยังไม่มีข้อมูลจัดอันดับ</div>
          <div style={{ fontSize: 12 }}>กรอกข้อมูลหรืออัปโหลดไฟล์ในหน้า Upload เพื่อเริ่มการจัดอันดับ</div>
        </div>
      ) : sorted.map((b, i) => {
        const val = mode === "score" ? b.score : mode === "carbon" ? b.co2 : b.elec;
        const pct = b.hasData ? Math.round((mode === "carbon" || mode === "energy" ? (maxVal - val) / maxVal : val / maxVal) * 100) : 0;
        const rankIdx = withData.indexOf(b);
        return (
          <div key={b.id} onClick={() => onBranchClick(branches.indexOf(b))} style={{
            background: "#fff", borderRadius: 20, padding: 16, boxShadow: "0 4px 24px rgba(22,101,52,.08)",
            border: "1px solid #d1fae5", marginBottom: 10, display: "flex", alignItems: "center", gap: 14,
            cursor: "pointer", transition: "all .2s", animation: "fadeUp .3s ease"
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateX(4px)"; e.currentTarget.style.boxShadow = "0 8px 40px rgba(22,101,52,.14)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 4px 24px rgba(22,101,52,.08)"; }}
          >
            <div style={{ fontSize: 28, fontWeight: 800, minWidth: 40, textAlign: "center", color: rankIdx === 0 ? "#f59e0b" : rankIdx === 1 ? "#94a3b8" : rankIdx === 2 ? "#b45309" : "#86efac" }}>
              {b.hasData && rankIdx < 3 ? medals[rankIdx] : b.hasData ? rankIdx + 1 : "—"}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#14532d" }}>{b.icon} {b.name}</div>
              <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>{b.hasData ? b.nameEn : "ยังไม่มีข้อมูล"}</div>
              <div style={{ marginTop: 6, height: 6, background: "#f0fdf4", borderRadius: 6, overflow: "hidden" }}>
                <div style={{ height: "100%", borderRadius: 6, background: "linear-gradient(90deg,#16a34a,#22c55e)", width: `${pct}%`, transition: "width 1s ease" }} />
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: b.hasData ? "#166534" : "#6b7280" }}>{b.hasData ? val : "—"}</div>
              <div style={{ fontSize: 9, color: "#6b7280" }}>{b.hasData ? unit : ""}</div>
            </div>
          </div>
        );
      })}

      <SectionTitle style={{ marginTop: 8 }}>ESG Radar</SectionTitle>
      <div style={{ background: "#fff", borderRadius: 20, padding: 18, boxShadow: "0 4px 24px rgba(22,101,52,.08)", border: "1px solid #d1fae5" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#14532d", marginBottom: 4 }}>ประสิทธิภาพรอบด้าน</div>
        <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 8 }}>Score · Efficiency · Reduction · ทุกสาขา</div>
        <RadarChart branches={branches} />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
          {branches.filter(b => b.hasData).map(b => (
            <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: b.color }} />
              <span style={{ fontSize: 10, color: "#374151" }}>{b.id}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── PAGE: REPORTS ────────────────────────────────────────────────────────────
function PageReports({ branches, showToast }) {
  const totals = branches.reduce((acc, b) => ({ co2: +(acc.co2 + b.co2).toFixed(4) }), { co2: 0 });
  const credits = Math.round(parseFloat(totals.co2) * 2.4);

  const downloadReport = (type) => {
    const names = { esg: "Executive ESG Report", carbon: "Carbon Emission Report", tcfd: "TCFD Disclosure Report", monthly: "Monthly Sustainability Report", branch: "Branch Comparison Report" };
    showToast("📥 กำลังสร้าง " + names[type] + "...");
    setTimeout(() => showToast("✅ พร้อมดาวน์โหลด " + names[type]), 2000);
  };

  return (
    <div style={{ animation: "fadeUp .35s ease" }}>
      <PageHeader title="📄 AI Reports" sub="TCFD · Carbon Credit · ESG Platform" />

      <SectionTitle>รายงานอัตโนมัติ · AI</SectionTitle>
      <div style={{ background: "linear-gradient(135deg,#0f4c2a,#166534)", borderRadius: 20, padding: 18, marginBottom: 12, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: -8, bottom: -12, fontSize: 70, opacity: .1 }}>📊</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 4 }}>🤖 สร้าง ESG Report อัตโนมัติ</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,.65)", marginBottom: 14 }}>AI วิเคราะห์ข้อมูลทั้งหมดและสร้างรายงานพร้อมส่งผู้บริหาร</div>
        <button onClick={() => { showToast("🤖 AI กำลังวิเคราะห์..."); setTimeout(() => showToast("✅ ESG Report พร้อมแล้ว"), 3000); }}
          style={{ background: "rgba(255,255,255,.95)", color: "#166534", border: "none", borderRadius: 12, padding: "10px 20px", fontFamily: "var(--font)", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
          ✨ สร้างรายงานทันที
        </button>
      </div>

      <SectionTitle>TCFD Framework</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
        {[["🏛️", "Governance", "การกำกับดูแลด้านสภาพภูมิอากาศ", "✓ 92%", "#15803d"], ["⚠️", "Risk & Opp.", "ความเสี่ยงและโอกาสด้านภูมิอากาศ", "● 74%", "#d97706"], ["🎯", "Strategy", "กลยุทธ์รับมือการเปลี่ยนแปลง", "✓ 88%", "#15803d"], ["📏", "Metrics", "ตัวชี้วัดและเป้าหมาย Net Zero", "✓ 95%", "#15803d"]].map(([icon, title, desc, score, col]) => (
          <div key={title} style={{ background: "#fff", borderRadius: 12, padding: 12, border: "1px solid #d1fae5", boxShadow: "0 4px 24px rgba(22,101,52,.08)" }}>
            <div style={{ fontSize: 18, marginBottom: 4 }}>{icon}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#14532d", marginBottom: 2 }}>{title}</div>
            <div style={{ fontSize: 10, color: "#6b7280", lineHeight: 1.4 }}>{desc}</div>
            <div style={{ fontSize: 16, fontWeight: 800, marginTop: 6, color: col }}>{score}</div>
          </div>
        ))}
      </div>

      <SectionTitle>Carbon Credit Platform</SectionTitle>
      <div style={{ background: "linear-gradient(135deg,#1e3a5f,#1d4ed8)", borderRadius: 20, padding: 18, marginBottom: 12, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,.05)" }} />
        <div style={{ fontSize: 10, fontWeight: 500, color: "rgba(255,255,255,.6)", letterSpacing: "1.5px", textTransform: "uppercase" }}>Carbon Credits Available</div>
        <div style={{ fontSize: 40, fontWeight: 800, color: "#fff", margin: "4px 0" }}>{credits} <span style={{ fontSize: 16, opacity: .7 }}>tCO₂e</span></div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,.6)" }}>มูลค่าตลาดโดยประมาณ ฿ {(credits * 2000).toLocaleString()}</div>
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <button onClick={() => showToast("💰 เชื่อมต่อ Carbon Credit Exchange...")} style={{ flex: 1, padding: 10, border: "none", borderRadius: 10, fontFamily: "var(--font)", fontSize: 12, fontWeight: 700, cursor: "pointer", background: "rgba(255,255,255,.95)", color: "#1d4ed8" }}>🛒 ซื้อ Credits</button>
          <button onClick={() => showToast("📈 ส่งคำสั่งขาย...")} style={{ flex: 1, padding: 10, border: "1px solid rgba(255,255,255,.3)", borderRadius: 10, fontFamily: "var(--font)", fontSize: 12, fontWeight: 700, cursor: "pointer", background: "rgba(255,255,255,.15)", color: "#fff" }}>💸 ขาย Credits</button>
        </div>
      </div>

      <div style={{ background: "#fff", borderRadius: 14, padding: 14, border: "1px solid #d1fae5", boxShadow: "0 4px 24px rgba(22,101,52,.08)", marginBottom: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#14532d", marginBottom: 8 }}>ราคาตลาด Carbon Credit</div>
        {[["TGO VER", "Thailand Greenhouse Gas", "฿ 1,850", "▲ 2.1%", "#15803d", true], ["Gold Standard", "International Standard", "$ 12.40", "▲ 0.8%", "#15803d", true], ["Verra VCS", "Verified Carbon Standard", "$ 9.70", "▼ 1.3%", "#ef4444", false]].map(([name, sub, price, change, col, pos]) => (
          <div key={name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: name !== "Verra VCS" ? "1px solid #d1fae5" : "none" }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#14532d" }}>{name}</div>
              <div style={{ fontSize: 10, color: "#6b7280" }}>{sub}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 13, fontWeight: 600, color: col }}>{price}</div>
              <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 6px", borderRadius: 6, background: pos ? "#dcfce7" : "#fee2e2", color: pos ? "#15803d" : "#991b1b" }}>{change}</span>
            </div>
          </div>
        ))}
      </div>

      <SectionTitle>รายงานผู้บริหาร</SectionTitle>
      {[["📊", "Executive ESG Report", "สรุปผลการดำเนินงาน ESG ประจำเดือน พร้อม KPI และ Carbon Summary", "PDF · Excel", "esg"],
        ["🌍", "Carbon Emission Report", "รายงาน Carbon Footprint รายสาขา พร้อม Scope 1, 2, 3", "PDF", "carbon"],
        ["🏛️", "TCFD Disclosure Report", "รายงานตามมาตรฐาน TCFD ครบทั้ง 4 เสาหลัก", "PDF · TCFD Ready", "tcfd"],
        ["📅", "Monthly Sustainability Report", "รายงานสรุปรายเดือน ค่าไฟ ค่าน้ำ เชื้อเพลิง และแนวโน้ม", "Excel", "monthly"],
        ["🏢", "Branch Comparison Report", "เปรียบเทียบประสิทธิภาพการใช้ทรัพยากรทุกสาขา", "PDF · Excel", "branch"],
      ].map(([icon, title, desc, badge, type]) => (
        <div key={type} onClick={() => downloadReport(type)} style={{
          background: "#fff", borderRadius: 20, padding: 16, boxShadow: "0 4px 24px rgba(22,101,52,.08)",
          border: "1px solid #d1fae5", marginBottom: 10, display: "flex", alignItems: "center", gap: 14,
          cursor: "pointer", transition: "all .2s"
        }}
          onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 8px 40px rgba(22,101,52,.14)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 4px 24px rgba(22,101,52,.08)"; }}
        >
          <span style={{ fontSize: 36 }}>{icon}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#14532d" }}>{title}</div>
            <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>{desc}</div>
            <span style={{ fontSize: 9, fontWeight: 600, padding: "3px 9px", borderRadius: 8, background: "#f0fdf4", color: "#15803d", border: "1px solid #d1fae5", display: "inline-block", marginTop: 6 }}>{badge}</span>
          </div>
          <span style={{ fontSize: 22 }}>⬇️</span>
        </div>
      ))}
      <button onClick={() => { showToast("🔄 กำลังสร้างรายงานทั้งหมด..."); setTimeout(() => showToast("✅ สร้างรายงาน 5 ฉบับเรียบร้อย"), 2500); }}
        style={{ width: "100%", padding: 14, background: "linear-gradient(135deg,#166534,#16a34a)", color: "#fff", border: "none", borderRadius: 14, fontFamily: "var(--font)", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 4px 20px rgba(22,101,52,.3)", marginTop: 8 }}>
        <span>🔄</span> สร้างรายงานทั้งหมด
      </button>
    </div>
  );
}

// ─── Helper Components ────────────────────────────────────────────────────────
function SectionTitle({ children, style }) {
  return (
    <div style={{ fontSize: 13, fontWeight: 600, color: "#6b7280", letterSpacing: ".8px", textTransform: "uppercase", marginBottom: 12, display: "flex", alignItems: "center", gap: 8, marginTop: 8, ...style }}>
      {children}
      <div style={{ flex: 1, height: 1, background: "#d1fae5" }} />
    </div>
  );
}
function FormCard({ title, sub, children }) {
  return (
    <div style={{ background: "#fff", borderRadius: 20, padding: 18, boxShadow: "0 4px 24px rgba(22,101,52,.08)", border: "1px solid #d1fae5", marginBottom: 12 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: "#14532d", marginBottom: sub ? 4 : 14 }}>{title}</div>
      {sub && <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 14 }}>{sub}</div>}
      {children}
    </div>
  );
}
function FormGroup({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ fontSize: 10, fontWeight: 600, color: "#6b7280", letterSpacing: ".4px" }}>{label}</div>
      {children}
    </div>
  );
}
function PageHeader({ title, sub }) {
  return (
    <div style={{ background: "linear-gradient(135deg,#0f4c2a,#15803d)", padding: "20px 20px 14px", margin: "0 -16px 24px", borderRadius: "0 0 32px 32px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div style={{ width: 40, height: 40, background: "rgba(255,255,255,.15)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, border: "1px solid rgba(255,255,255,.2)" }}>☕</div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>Hillkoff</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,.75)" }}>Zero Waste Analytics</div>
        </div>
      </div>
      <div style={{ background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.2)", borderRadius: 16, padding: "12px 16px" }}>
        <div style={{ color: "#fff", fontSize: 15, fontWeight: 700 }}>{title}</div>
        <div style={{ color: "rgba(255,255,255,.65)", fontSize: 11, marginTop: 2 }}>{sub}</div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");
  const [branches, setBranches] = useState(BRANCHES_INIT.map(b => ({ ...b, elec: 0, water: 0, fuel: 0, co2: 0, score: 0, entries: 0, hasData: false, waste: { general: 0, recycle: 0, organic: 0, hazard: 0 }, status: "none" })));
  const [monthlyCo2, setMonthlyCo2] = useState(Array(12).fill(0));
  const [modalBranchIdx, setModalBranchIdx] = useState(null);
  const [toast, setToast] = useState({ msg: "", show: false });
  const [aiOpen, setAiOpen] = useState(false);
  const toastTimer = useRef(null);

  const showToast = useCallback((msg) => {
    setToast({ msg, show: true });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(t => ({ ...t, show: false })), 2500);
  }, []);

  const handleSave = useCallback(({ branchId, month, elec, water, fuel, co2Total, co2Elec, co2Water, co2Fuel, wGen, wRec, wOrg, wHaz, matCount, recycleRate }) => {
    setBranches(prev => prev.map(b => {
      if (b.id !== branchId) return b;
      const newCo2 = +(b.co2 + co2Total).toFixed(4);
      const newEntries = b.entries + 1;
      const co2PerEntry = newCo2 / newEntries;
      const baseScore = Math.min(100, Math.round(50 + parseFloat(recycleRate) * 0.5 - co2PerEntry * 10));
      const score = Math.max(1, Math.min(100, baseScore));
      return {
        ...b, elec: b.elec + elec, water: b.water + water, fuel: b.fuel + fuel, co2: newCo2,
        entries: newEntries, hasData: true,
        waste: { general: b.waste.general + wGen, recycle: b.waste.recycle + wRec, organic: b.waste.organic + wOrg, hazard: b.waste.hazard + wHaz },
        score, status: score >= 85 ? "excellent" : score >= 70 ? "good" : "fair"
      };
    }));
    const monthIdx = month ? (parseInt(month.split("-")[1]) - 1) : new Date().getMonth();
    setMonthlyCo2(prev => { const c = [...prev]; c[monthIdx] = +(c[monthIdx] + co2Total).toFixed(4); return c; });
    const bn = BRANCHES_INIT.find(b => b.id === branchId)?.name || branchId;
    showToast("✅ อัปเดตข้อมูล " + bn + " เรียบร้อย");
  }, [showToast]);

  const navItems = [
    { id: "home", icon: "🏠", label: "หน้าหลัก" },
    { id: "upload", icon: "📤", label: "Upload" },
    { id: "analytics", icon: "📊", label: "Analytics" },
    { id: "ranking", icon: "🏆", label: "Ranking" },
    { id: "reports", icon: "📄", label: "Reports" },
  ];

  return (
    <>
      <style>{css}</style>
      <div style={{ fontFamily: "var(--font)", background: "#f0fdf4", minHeight: "100dvh", paddingBottom: "calc(var(--nav-h) + 16px)", overflowX: "hidden" }}>
        <div style={{ maxWidth: 600, margin: "0 auto", padding: 16 }}>
          {page === "home" && <PageHome branches={branches} monthlyCo2={monthlyCo2} onBranchClick={i => setModalBranchIdx(i)} onGoUpload={() => setPage("upload")} />}
          {page === "upload" && <PageUpload branches={branches} onSave={handleSave} showToast={showToast} />}
          {page === "analytics" && <PageAnalytics branches={branches} monthlyCo2={monthlyCo2} />}
          {page === "ranking" && <PageRanking branches={branches} onBranchClick={i => setModalBranchIdx(i)} />}
          {page === "reports" && <PageReports branches={branches} showToast={showToast} />}
        </div>
      </div>

      {/* Bottom Nav */}
      <nav style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", background: "rgba(255,255,255,.92)", backdropFilter: "blur(20px)", borderTop: "1px solid #d1fae5", height: "var(--nav-h)", display: "flex", alignItems: "center", justifyContent: "space-around", padding: "0 8px", zIndex: 100, maxWidth: 600, boxShadow: "0 -4px 24px rgba(22,101,52,.08)", borderRadius: "24px 24px 0 0", width: "100%", fontFamily: "var(--font)" }}>
        {navItems.map(({ id, icon, label }) => (
          <button key={id} onClick={() => setPage(id)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, cursor: "pointer", padding: "8px 12px", borderRadius: 14, transition: "all .2s", flex: 1, border: "none", background: page === id ? "#f0fdf4" : "transparent", fontFamily: "var(--font)" }}>
            <span style={{ fontSize: 20, lineHeight: 1 }}>{icon}</span>
            <span style={{ fontSize: 9, fontWeight: page === id ? 600 : 500, color: page === id ? "#166534" : "#6b7280", letterSpacing: ".3px" }}>{label}</span>
          </button>
        ))}
      </nav>

      <AIPanel open={aiOpen} onClose={() => setAiOpen(p => !p)} branches={branches} />

      {modalBranchIdx !== null && (
        <BranchModal b={branches[modalBranchIdx]} onClose={() => setModalBranchIdx(null)} onGoUpload={() => setPage("upload")} />
      )}

      <Toast msg={toast.msg} show={toast.show} />
    </>
  );
}
