"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const MAT_CATALOG = {
  cafe: {
    label: "☕ วัสดุร้านกาแฟ",
    items: [
      ["แก้วกระดาษ", "ใบ"], ["แก้วพลาสติกใส", "ใบ"], ["แก้วพลาสติกสี", "ใบ"],
      ["หลอดดูดพลาสติก", "ชิ้น"], ["หลอดดูดกระดาษ", "ชิ้น"], ["ฝาแก้วแบน", "ชิ้น"],
      ["ฝาแก้วโดม", "ชิ้น"], ["ฝาแก้วมีรู", "ชิ้น"], ["ถุงพลาสติกหูหิ้ว", "ใบ"],
      ["ถุงกระดาษ", "ใบ"], ["ซองน้ำตาล", "ชิ้น"], ["ซองครีมเทียม", "ชิ้น"],
      ["ผ้าเช็ดมือ (ทิชชู)", "แพ็ค"], ["กล่องกระดาษใส่ขนม", "ใบ"], ["ไม้คนกาแฟ", "ชิ้น"],
      ["ผ้ากรองกาแฟ", "แผ่น"], ["แคปซูลกาแฟ", "กล่อง"], ["ผงกาแฟ", "กิโลกรัม"]
    ]
  },
  office: {
    label: "🖊️ เครื่องเขียน/สำนักงาน",
    items: [
      ["กระดาษ A4", "รีม"], ["กระดาษ A3", "รีม"], ["ปากกาลูกลื่น", "ด้าม"],
      ["ดินสอ", "แท่ง"], ["ปากกาเมจิก", "ด้าม"], ["แฟ้มเอกสาร", "อัน"],
      ["แฟ้มซอง", "อัน"], ["คลิปดำ", "กล่อง"], ["คลิปหนีบกระดาษ", "กล่อง"],
      ["สติ๊กเกอร์ Post-it", "แพ็ค"], ["เทปใสเล็ก", "ม้วน"], ["กาวแท่ง", "แท่ง"],
      ["กรรไกร", "อัน"], ["ลวดเย็บกระดาษ", "กล่อง"], ["ตลับหมึก Printer", "ตลับ"],
      ["หมึกเติม Printer", "ขวด"], ["แฟ้ม Ring binder", "อัน"], ["ปฏิทินตั้งโต๊ะ", "อัน"]
    ]
  },
  clean: {
    label: "🧹 วัสดุทำความสะอาด",
    items: [
      ["น้ำยาล้างจาน", "ขวด"], ["น้ำยาถูพื้น", "ขวด"], ["น้ำยาฆ่าเชื้อ", "ขวด"],
      ["ผงซักฟอก", "ถุง"], ["น้ำยาปรับผ้านุ่ม", "ขวด"], ["สก็อตไบรท์", "แผ่น"],
      ["ฟองน้ำล้างจาน", "แผ่น"], ["ผ้าไมโครไฟเบอร์", "ผืน"], ["ถุงขยะดำ", "แพ็ค"],
      ["ถุงขยะสี", "แพ็ค"], ["กระดาษทิชชู ม้วนใหญ่", "ม้วน"], ["กระดาษเช็ดมือ", "แพ็ค"],
      ["สบู่ล้างมือ", "ขวด"], ["แอลกอฮอล์เจล", "ขวด"], ["แปรงขัดห้องน้ำ", "อัน"],
      ["น้ำยาขัดสุขภัณฑ์", "ขวด"], ["น้ำหอมปรับอากาศ", "กระป๋อง"]
    ]
  },
  roast: {
    label: "🔥 โรงคั่วกาแฟ",
    items: [
      ["เมล็ดกาแฟดิบ", "กิโลกรัม"], ["ถุงบรรจุเมล็ดกาแฟ", "ใบ"], ["ซิปล็อคกาแฟ", "ใบ"],
      ["วาล์วระบายแก๊ส", "ชิ้น"], ["ป้ายสินค้า", "แผ่น"], ["กล่องบรรจุภัณฑ์กาแฟ", "ใบ"],
      ["ถุงอลูมิเนียมฟอยล์", "ใบ"], ["กระป๋องกาแฟ", "ใบ"], ["ซีลฝา", "ชิ้น"],
      ["ฉลากสินค้า", "ม้วน"], ["น้ำมันหล่อลื่นเครื่อง", "ขวด"], ["ผ้ากรองคั่ว", "แผ่น"]
    ]
  },
  pack: {
    label: "📦 แพ็คสินค้า/คลังสินค้า",
    items: [
      ["แอร์บับเบิล (กันกระแทก)", "ม้วน"], ["กล่องพัสดุ เบอร์ S", "ใบ"],
      ["กล่องพัสดุ เบอร์ M", "ใบ"], ["กล่องพัสดุ เบอร์ L", "ใบ"], ["ซองไปรษณีย์พลาสติก", "ใบ"],
      ["ซองกันกระแทก", "ใบ"], ["เทปปิดกล่อง", "ม้วน"], ["เทปใสขนาดใหญ่", "ม้วน"],
      ["ฟิล์มยืดพันพาเลท", "ม้วน"], ["เชือกฟาง", "ม้วน"], ["เคเบิ้ลไทร์", "ถุง"],
      ["สติ๊กเกอร์ Fragile", "ม้วน"], ["สติ๊กเกอร์ส่งด่วน", "ม้วน"], ["สติ๊กเกอร์โลโก้บริษัท", "ม้วน"],
      ["เครื่องยิงเทป", "อัน"], ["คัตเตอร์งานคลัง", "อัน"], ["ถุงซิปล็อค", "แพ็ค"],
      ["ถุงคราฟท์", "แพ็ค"], ["ถุงกระดาษ", "แพ็ค"], ["ถุงพลาสติกใส", "กิโลกรัม"],
      ["ป้ายแท็กสินค้า", "แพ็ค"], ["เครื่องชั่งสินค้า", "เครื่อง"], ["กระดาษใบปะหน้า", "รีม"],
      ["หมึกเครื่องปริ้นใบปะหน้า", "ตลับ"]
    ]
  },
  general: {
    label: "🔧 อุปกรณ์ทั่วไปองค์กร",
    items: [
      ["หลอดไฟ", "หลอด"], ["ถ่าน AA", "ก้อน"], ["ถ่าน AAA", "ก้อน"], ["ปลั๊กไฟ", "อัน"],
      ["สายไฟต่อพ่วง", "เส้น"], ["พัดลม", "เครื่อง"], ["อุปกรณ์ปฐมพยาบาล", "ชุด"],
      ["หน้ากากอนามัย", "กล่อง"], ["หมวกคลุมผม", "แพ็ค"], ["ผ้ากันเปื้อน", "ตัว"],
      ["รองเท้าบูท", "คู่"], ["ถุงมือยาง", "กล่อง"], ["ไม้กวาด", "อัน"], ["ที่โกยผง", "อัน"],
      ["ไม้ม็อบ", "อัน"]
    ]
  }
};

const BRANCHES_INIT = [
  { id: "HQ", name: "สำนักงานใหญ่", nameEn: "Headquarters", icon: "🏢", color: "#166534" },
  { id: "CPK", name: "สาขาช้างเผือก", nameEn: "Chang Phueak", icon: "🌿", color: "#15803D" },
  { id: "MHD", name: "สาขามหิดล", nameEn: "Mahidol", icon: "🎓", color: "#16A34A" },
  { id: "PPG", name: "สาขาป่าแพ่ง", nameEn: "Pa Phaeng", icon: "🌳", color: "#22C55E" },
  { id: "TD", name: "สาขาทับเดื่อ", nameEn: "Thap Duea", icon: "☕", color: "#4ADE80" },
  { id: "RTK", name: "สาขาราติก้า", nameEn: "Ratica", icon: "🫘", color: "#0f766e" }
];

const MONTHS = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

const emptyBranches = () => BRANCHES_INIT.map(b => ({
  ...b,
  elec: 0,
  water: 0,
  fuel: 0,
  co2: 0,
  score: 0,
  entries: 0,
  hasData: false,
  waste: { general: 0, recycle: 0, organic: 0, hazard: 0 },
  status: "none"
}));

const normalizeDashboardState = state => {
  const branchMap = new Map((state?.branches || []).map(b => [b.id, b]));
  return {
    branches: emptyBranches().map(base => ({ ...base, ...(branchMap.get(base.id) || {}) })),
    monthlyCo2: Array.from({ length: 12 }, (_, i) => Number(state?.monthlyCo2?.[i] || 0)),
    yearlyStats: state?.yearlyStats || {},
    entriesLog: Array.isArray(state?.entriesLog) ? state.entriesLog : [],
    loginHistory: Array.isArray(state?.loginHistory) ? state.loginHistory : [],
    userProfile: state?.userProfile || {},
    savedAt: state?.savedAt || null
  };
};

const downloadBlob = (filename, content, type = "text/html;charset=utf-8") => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const buildCsv = rows => rows.map(row => row.map(value => `"${String(value ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");

const getMonthKey = value => value || new Date().toISOString().slice(0, 7);

const groupTopByMonth = (entries, selector) => {
  const grouped = {};
  entries.forEach(entry => {
    const month = getMonthKey(entry.month);
    selector(entry).forEach(item => {
      if (!item?.name || !Number(item.qty)) return;
      grouped[month] ||= {};
      grouped[month][item.name] ||= { ...item, qty: 0 };
      grouped[month][item.name].qty += Number(item.qty);
    });
  });
  return Object.fromEntries(Object.entries(grouped).map(([month, items]) => [
    month,
    Object.values(items).sort((a, b) => b.qty - a.qty).slice(0, 5)
  ]));
};

const getWasteItems = entry => [
  { name: "ขยะทั่วไป", qty: entry.waste?.general || 0, unit: "กก." },
  { name: "ขยะรีไซเคิล", qty: entry.waste?.recycle || 0, unit: "กก." },
  { name: "ขยะอินทรีย์", qty: entry.waste?.organic || 0, unit: "กก." },
  { name: "ขยะอันตราย/ฝังกลบ", qty: entry.waste?.hazard || 0, unit: "กก." }
];

const dashboardStorageKey = userId => `hillkoff-dashboard-state:${userId || "guest"}`;

const readLocalDashboardState = userId => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(dashboardStorageKey(userId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const writeLocalDashboardState = (userId, state) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(dashboardStorageKey(userId), JSON.stringify({
      ...state,
      savedAt: new Date().toISOString()
    }));
  } catch (error) {
    console.warn("Local dashboard save failed:", error);
  }
};

const chooseNewestDashboardState = (localState, remoteState) => {
  if (!remoteState?.savedAt) return localState;
  if (!localState?.savedAt) return remoteState;
  return new Date(localState.savedAt).getTime() > new Date(remoteState.savedAt).getTime()
    ? localState
    : remoteState;
};

const projectWhitepaper = `
  <section class="whitepaper">
    <h2>Project Whitepaper: Hillkoff Zero Waste Analytics</h2>
    <p><strong>Purpose.</strong> This project was created to turn daily resource use and waste activity across Hillkoff branches into a living sustainability database. The system keeps cumulative records instead of resetting values, so management can see the latest operational footprint at any time and compare monthly or yearly progress with confidence.</p>
    <p><strong>Scope.</strong> The platform tracks electricity, water, fuel, waste separation, carbon footprint, branch ranking, ESG performance, carbon credit estimates, and report-ready summaries. Each data upload becomes part of the historical record and supports month-over-month and year-over-year comparison.</p>
    <p><strong>Management Value.</strong> The dashboard helps identify high-impact branches, detect rising emissions early, improve zero-waste practices, and prepare ESG, Carbon, TCFD, monthly, and branch-comparison reports from the same verified dataset.</p>
    <p><strong>Long-Term Goal.</strong> The end goal is a practical decision system for reducing cost, reducing emissions, improving sustainability discipline, and supporting Hillkoff's transition toward measurable Net Zero and circular operations.</p>
  </section>
`;

const createReportHtml = ({ title, totals, branches, monthlyCo2, yearlyStats, entriesLog = [] }) => {
  const credits = Math.round(totals.co2 * 2.4);
  const topMaterialsByMonth = groupTopByMonth(entriesLog, entry => entry.materials || []);
  const topWasteByMonth = groupTopByMonth(entriesLog, getWasteItems);
  const branchRows = branches.map(b => `
    <tr><td>${b.nameEn || b.id}</td><td>${b.entries}</td><td>${b.elec}</td><td>${b.water}</td><td>${b.fuel}</td><td>${b.co2}</td><td>${b.score}</td></tr>
  `).join("");
  const monthRows = monthlyCo2.map((v, i) => `<tr><td>${MONTHS[i]}</td><td>${v}</td></tr>`).join("");
  const yearRows = Object.entries(yearlyStats || {}).map(([year, stat]) => `<tr><td>${year}</td><td>${stat.entries || 0}</td><td>${stat.co2 || 0}</td></tr>`).join("");
  const materialRows = Object.entries(topMaterialsByMonth).flatMap(([month, items]) => items.map(item => `<tr><td>${month}</td><td>${item.name}</td><td>${item.qty}</td><td>${item.unit || ""}</td></tr>`)).join("");
  const wasteRows = Object.entries(topWasteByMonth).flatMap(([month, items]) => items.map(item => `<tr><td>${month}</td><td>${item.name}</td><td>${item.qty}</td><td>${item.unit || ""}</td></tr>`)).join("");
  return `<!doctype html>
<html><head><meta charset="utf-8"><title>${title}</title>
<style>
body{font-family:Arial,sans-serif;margin:40px;color:#143321}h1,h2{color:#166534}.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.kpi{border:1px solid #bbf7d0;border-radius:10px;padding:14px;background:#f0fdf4}.kpi b{display:block;font-size:24px}table{width:100%;border-collapse:collapse;margin:18px 0}th,td{border:1px solid #d1d5db;padding:8px;text-align:left}th{background:#dcfce7}.whitepaper{page-break-before:always;border-top:4px solid #166534;margin-top:34px;padding-top:18px;line-height:1.65}@media print{button{display:none}}
</style></head><body>
<h1>${title}</h1>
<p>Generated at ${new Date().toLocaleString()}</p>
<div class="grid"><div class="kpi">Total Carbon<b>${totals.co2}</b>tCO2e</div><div class="kpi">Entries<b>${totals.entries}</b>records</div><div class="kpi">Carbon Credits<b>${credits}</b>credits</div><div class="kpi">Active Branches<b>${branches.filter(b => b.hasData).length}</b>branches</div></div>
<h2>Branch Summary</h2><table><thead><tr><th>Branch</th><th>Entries</th><th>kWh</th><th>Water</th><th>Fuel</th><th>tCO2e</th><th>Score</th></tr></thead><tbody>${branchRows}</tbody></table>
<h2>Monthly Carbon</h2><table><thead><tr><th>Month</th><th>tCO2e</th></tr></thead><tbody>${monthRows}</tbody></table>
<h2>Yearly Statistics</h2><table><thead><tr><th>Year</th><th>Entries</th><th>tCO2e</th></tr></thead><tbody>${yearRows || "<tr><td colspan='3'>No yearly data yet</td></tr>"}</tbody></table>
<h2>Top Materials by Month</h2><table><thead><tr><th>Month</th><th>Material</th><th>Quantity</th><th>Unit</th></tr></thead><tbody>${materialRows || "<tr><td colspan='4'>No material data yet</td></tr>"}</tbody></table>
<h2>Top Waste by Month</h2><table><thead><tr><th>Month</th><th>Waste Type</th><th>Quantity</th><th>Unit</th></tr></thead><tbody>${wasteRows || "<tr><td colspan='4'>No waste data yet</td></tr>"}</tbody></table>
${projectWhitepaper}
</body></html>`;
};

const REPORT_DETAILS = {
  esg: {
    title: "Executive ESG Report",
    icon: "📊",
    basis: "สรุปผลการดำเนินงาน ESG ประจำเดือน พร้อม KPI, Carbon Summary, Zero Waste Rate และ Carbon Credit เพื่อใช้รายงานผู้บริหาร",
    formulas: [
      "Carbon รวม = CO2 ไฟฟ้า + CO2 น้ำ + CO2 เชื้อเพลิง",
      "CO2 ไฟฟ้า = kWh x 0.4716 / 1000",
      "Zero Waste Rate = (ขยะรีไซเคิล + ขยะอินทรีย์) / ขยะทั้งหมด x 100",
      "Sustainability Score = 50 + (Recycle Rate x 0.5) - (CO2 เฉลี่ยต่อรายการ x 10)"
    ],
    sources: [
      "GHG Protocol Corporate Standard สำหรับโครงสร้างการจัดเก็บและรายงานก๊าซเรือนกระจก",
      "Emission factor ไฟฟ้า 0.4716 kgCO2e/kWh ใช้เป็นค่าตั้งต้นของระบบ และควรแทนด้วยค่าประกาศล่าสุดเมื่อใช้งานจริง",
      "หลัก Zero Waste ใช้วัดสัดส่วนขยะที่ถูกนำกลับไปใช้ประโยชน์"
    ]
  },
  carbon: {
    title: "Carbon Emission Report",
    icon: "🌍",
    basis: "รายงาน Carbon Footprint รายสาขา แยก Scope 1, Scope 2 และข้อมูลสนับสนุน Scope 3",
    formulas: [
      "Scope 1 เชื้อเพลิง = ปริมาณเชื้อเพลิง x emission factor / 1000",
      "Diesel = 2.67 kgCO2e/L, Gasoline = 2.31 kgCO2e/L, LPG = 2.98 kgCO2e/kg, CNG = 2.15 kgCO2e/kg",
      "Scope 2 ไฟฟ้า = kWh x 0.4716 / 1000",
      "น้ำ = m3 x 0.00149"
    ],
    sources: [
      "GHG Protocol ใช้แบ่ง Scope 1, Scope 2 และ Scope 3",
      "IPCC emission factor approach สำหรับ activity data ด้านเชื้อเพลิง",
      "ข้อมูลบิลและไฟล์นำเข้าเป็น activity data หลักของการคำนวณ"
    ]
  },
  tcfd: {
    title: "TCFD Disclosure Report",
    icon: "🏛️",
    basis: "รายงานตาม 4 เสาหลักของ TCFD: Governance, Strategy, Risk Management, Metrics & Targets",
    formulas: [
      "Metrics ใช้ Carbon รวม, พลังงานรวม, น้ำรวม, Zero Waste Rate และแนวโน้มรายเดือน",
      "Risk indicator ประเมินจากสาขาที่ Carbon สูงหรือ Sustainability Score ต่ำกว่าค่าเฉลี่ย",
      "Targets เทียบผลรายเดือนกับ baseline หรือเดือนก่อนหน้า"
    ],
    sources: [
      "TCFD Recommendations: Governance, Strategy, Risk Management, Metrics and Targets",
      "ISSB IFRS S2 ใช้แนวคิด climate-related disclosures ที่สอดคล้องกับ TCFD"
    ]
  },
  monthly: {
    title: "Monthly Sustainability Report",
    icon: "📅",
    basis: "รายงานสรุปรายเดือน ค่าไฟ ค่าน้ำ เชื้อเพลิง ขยะ และแนวโน้ม Carbon",
    formulas: [
      "Carbon เดือน = ผลรวม Carbon ของทุกสาขาในเดือนนั้น",
      "MoM Change = (เดือนปัจจุบัน - เดือนก่อนหน้า) / เดือนก่อนหน้า x 100",
      "Intensity ต่อรายการ = Carbon รวม / จำนวนรายการบันทึก"
    ],
    sources: [
      "KPI dashboard ด้าน energy, water, waste และ GHG inventory",
      "ใช้ข้อมูลจากบิล ไฟล์ PDF/Excel/CSV และรายการ manual input เป็น activity data"
    ]
  },
  branch: {
    title: "Branch Comparison Report",
    icon: "🏢",
    basis: "เปรียบเทียบประสิทธิภาพการใช้ทรัพยากรทุกสาขาด้วย Carbon, พลังงาน, ขยะ และ Sustainability Score",
    formulas: [
      "Ranking Carbon ต่ำสุด = เรียงสาขาจาก CO2 น้อยไปมาก",
      "Ranking Energy = เรียงจาก kWh น้อยไปมาก",
      "Score = max(1, min(100, 50 + Recycle Rate x 0.5 - CO2 เฉลี่ยต่อรายการ x 10))"
    ],
    sources: [
      "หลัก internal benchmarking ภายในองค์กร",
      "GHG Protocol แนะนำให้เทียบข้อมูลภายใต้ organizational boundary และ operational boundary เดียวกัน"
    ]
  }
};

const numFmt = n => (n >= 1000 ? `${Math.round(n / 100) / 10}k` : n);
const asNumber = v => parseFloat(v) || 0;

function simulateFileExtraction(fileName, branchId) {
  const ext = fileName.split(".").pop().toLowerCase();
  const seed = fileName.length + branchId.charCodeAt(0);
  const rng = (min, max, s = seed) => {
    const x = Math.sin(s * 9301 + 49297) * 233280;
    return Math.round((x - Math.floor(x)) * (max - min) + min);
  };
  const presets = {
    pdf: [800, 3500, 20, 120, 50, 400, 10, 80, 5, 40, 5, 30, 0, 10, 3, 12, "ข้อมูลบิลค่าสาธารณูปโภค"],
    xlsx: [1000, 5000, 30, 200, 100, 600, 20, 100, 15, 60, 10, 50, 0, 15, 8, 25, "ข้อมูลจากตาราง Excel"],
    csv: [600, 2800, 15, 90, 30, 300, 8, 60, 4, 35, 3, 25, 0, 8, 2, 10, "ข้อมูลจากไฟล์ CSV"]
  };
  const p = presets[ext] || presets.csv;
  return {
    source: ext,
    elec: rng(p[0], p[1], seed + 1),
    water: rng(p[2], p[3], seed + 2),
    fuel: rng(p[4], p[5], seed + 3),
    wGen: rng(p[6], p[7], seed + 4),
    wRec: rng(p[8], p[9], seed + 5),
    wOrg: rng(p[10], p[11], seed + 6),
    wHaz: rng(p[12], p[13], seed + 7),
    matCount: rng(p[14], p[15], seed + 8),
    description: `${p[16]} (${fileName})`
  };
}

const css = `
@import url('https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--g1:#0f4c2a;--g2:#166534;--g3:#15803d;--g4:#16a34a;--g5:#22c55e;--bg:#f0fdf4;--card:#fff;--text:#14532d;--muted:#6b7280;--border:#d1fae5;--shadow:0 4px 24px rgba(22,101,52,.08);--shadow-lg:0 8px 40px rgba(22,101,52,.14);--nav-h:72px;--font:'Prompt',sans-serif;--mono:'DM Mono',monospace}
html{scroll-behavior:smooth}
body{font-family:var(--font);background:var(--bg);color:var(--text);overflow-x:hidden}
button,input,select,textarea{font-family:var(--font)}
button{touch-action:manipulation}
@keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes progress{from{width:0}to{width:100%}}
.app-shell{background:var(--bg);min-height:100dvh;padding-bottom:calc(var(--nav-h) + 16px);overflow-x:hidden}
.page-container{max-width:600px;margin:0 auto;padding:16px}
.fade-up{animation:fadeUp .35s ease}
.hero,.page-head{background:linear-gradient(135deg,#0f4c2a,#166534 55%,#15803d);margin:0 -16px 24px;padding:20px 20px 24px;border-radius:0 0 32px 32px;position:relative;overflow:hidden}
.hero-main{background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);border-radius:24px;padding:20px;backdrop-filter:blur(12px);position:relative;z-index:1}
.brand-row{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:16px;position:relative;z-index:1}
.brand-left{display:flex;align-items:center;gap:10px}
.brand-icon{width:40px;height:40px;background:rgba(255,255,255,.15);border-radius:12px;display:grid;place-items:center;font-size:20px;border:1px solid rgba(255,255,255,.2)}
.chip{display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:20px;font-size:10px;font-weight:600;border:1px solid rgba(255,255,255,.25);color:#fff;background:rgba(255,255,255,.12);white-space:nowrap}
.branch-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}
.metric-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.analytics-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}
.report-list{display:grid;grid-template-columns:1fr;gap:10px}
.form-grid-2{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.form-grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.card{background:#fff;border:1px solid var(--border);border-radius:20px;box-shadow:var(--shadow)}
.input,.select,.textarea{width:100%;border:1.5px solid var(--border);border-radius:10px;background:#f0fdf4;color:#14532d;outline:none;padding:9px 12px;font-size:13px}
.textarea{resize:vertical;line-height:1.6}
.bottom-nav{position:fixed;bottom:0;left:50%;transform:translateX(-50%);height:var(--nav-h);width:100%;max-width:600px;background:rgba(255,255,255,.92);backdrop-filter:blur(20px);border-top:1px solid var(--border);box-shadow:0 -4px 24px rgba(22,101,52,.08);border-radius:24px 24px 0 0;display:flex;align-items:center;justify-content:space-around;padding:0 8px;z-index:100}
.nav-btn{display:flex;flex-direction:column;align-items:center;gap:3px;cursor:pointer;padding:8px 12px;border-radius:14px;transition:all .2s;flex:1;border:none;background:transparent;color:var(--muted)}
.nav-btn.active{background:#f0fdf4;color:#166534}
.ai-button{position:fixed;right:16px;bottom:calc(var(--nav-h) + 16px);width:52px;height:52px;border-radius:50%;border:none;background:linear-gradient(135deg,#166534,#16a34a);box-shadow:0 4px 20px rgba(22,101,52,.4);z-index:90;font-size:24px;cursor:pointer}
.ai-panel{position:fixed;right:16px;bottom:calc(var(--nav-h) + 76px);width:min(360px,calc(100vw - 32px));background:#fff;border:1px solid var(--border);border-radius:24px;box-shadow:var(--shadow-lg);z-index:90;overflow:hidden;transition:all .25s cubic-bezier(.4,0,.2,1);transform-origin:bottom right}
.ai-panel.closed{opacity:0;pointer-events:none;transform:scale(.9) translateY(20px)}
.ai-panel.open{opacity:1;pointer-events:all;transform:scale(1) translateY(0)}
@media (min-width:768px){:root{--nav-h:80px}.page-container{max-width:920px;padding:24px}.hero,.page-head{margin-left:-24px;margin-right:-24px}.branch-grid{grid-template-columns:repeat(3,1fr)}.report-list{grid-template-columns:repeat(2,minmax(0,1fr))}.hero-main{padding:24px}.hero-stat{font-size:64px!important}.form-grid-wide{display:grid;grid-template-columns:1fr 1fr;gap:14px;align-items:start}}
@media (min-width:1100px){:root{--nav-h:0px}.app-shell{padding-left:104px;padding-bottom:24px}.page-container{max-width:1180px;padding:28px 32px}.hero,.page-head{margin-left:0;margin-right:0;border-radius:28px}.bottom-nav{left:0;top:0;bottom:auto;transform:none;width:96px;max-width:none;height:100dvh;border-radius:0 24px 24px 0;border-top:none;border-right:1px solid var(--border);flex-direction:column;justify-content:center;gap:10px;padding:16px 10px}.nav-btn{min-height:72px}.branch-grid{grid-template-columns:repeat(6,1fr)}.report-list{grid-template-columns:repeat(3,minmax(0,1fr))}.analytics-grid{grid-template-columns:repeat(4,1fr)}.desktop-two{display:grid;grid-template-columns:1.05fr .95fr;gap:16px;align-items:start}.ai-button{bottom:24px}.ai-panel{bottom:88px}}
@media (max-width:420px){.form-grid-2,.form-grid-3{grid-template-columns:1fr}.hero-stat{font-size:44px!important}.chip{display:none}.brand-row{align-items:flex-start}.metric-grid{gap:8px}}
`;

function SectionTitle({ children, style }) {
  return (
    <div style={{ fontSize: 13, fontWeight: 600, color: "#6b7280", marginBottom: 12, marginTop: 8, display: "flex", alignItems: "center", gap: 8, ...style }}>
      {children}
      <div style={{ flex: 1, height: 1, background: "#d1fae5" }} />
    </div>
  );
}

function FormCard({ title, sub, children }) {
  return (
    <div className="card" style={{ padding: 18, marginBottom: 12 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: "#14532d", marginBottom: sub ? 4 : 14 }}>{title}</div>
      {sub && <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 14 }}>{sub}</div>}
      {children}
    </div>
  );
}

function FormGroup({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ fontSize: 10, fontWeight: 600, color: "#6b7280" }}>{label}</div>
      {children}
    </div>
  );
}

function PageHeader({ title, sub }) {
  return (
    <div className="page-head">
      <div className="brand-row">
        <div className="brand-left">
          <div className="brand-icon">☕</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>Hillkoff</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,.75)" }}>Zero Waste Analytics</div>
          </div>
        </div>
      </div>
      <div style={{ background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.2)", borderRadius: 16, padding: "12px 16px" }}>
        <div style={{ color: "#fff", fontSize: 15, fontWeight: 700 }}>{title}</div>
        <div style={{ color: "rgba(255,255,255,.65)", fontSize: 11, marginTop: 2 }}>{sub}</div>
      </div>
    </div>
  );
}

function MiniBarChart({ data, labels, color = "#16a34a" }) {
  const max = Math.max(...data, 0.001);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 86, padding: "0 4px" }}>
      {data.map((v, i) => (
        <div key={labels[i]} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, minWidth: 0 }}>
          <div style={{ width: "100%", background: v > 0 ? `${color}cc` : "#e5e7eb", borderRadius: "3px 3px 0 0", height: `${(v / max) * 66}px`, minHeight: v > 0 ? 4 : 2, transition: "height .6s ease" }} />
          <span style={{ fontSize: 8, color: "#9ca3af", whiteSpace: "nowrap" }}>{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}

function DonutChart({ slices, labels }) {
  const total = slices.reduce((s, v) => s + v, 0);
  const colors = ["#16a34a", "#22d3ee", "#f59e0b"];
  let cumAngle = -Math.PI / 2;
  const r = 44;
  const cx = 60;
  const cy = 60;
  const paths = total > 0 ? slices.map((v, i) => {
    const angle = (v / total) * 2 * Math.PI;
    const x1 = cx + r * Math.cos(cumAngle);
    const y1 = cy + r * Math.sin(cumAngle);
    cumAngle += angle;
    const x2 = cx + r * Math.cos(cumAngle);
    const y2 = cy + r * Math.sin(cumAngle);
    return <path key={labels[i]} d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${angle > Math.PI ? 1 : 0},1 ${x2},${y2} Z`} fill={colors[i]} opacity={0.88} />;
  }) : <circle cx={cx} cy={cy} r={r} fill="#e5e7eb" />;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <svg width={120} height={120}>
        {paths}
        <circle cx={cx} cy={cy} r={28} fill="white" />
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize="9" fill="#6b7280">tCO₂e</text>
        <text x={cx} y={cy + 9} textAnchor="middle" fontSize="10" fontWeight="700" fill="#14532d">{total > 0 ? total.toFixed(2) : "—"}</text>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {labels.map((l, i) => (
          <div key={l} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: colors[i], flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: "#374151" }}>{l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RadarChart({ branches }) {
  const axes = ["Score", "Efficiency", "Carbon↓", "ไฟ↓", "น้ำ↓"];
  const cx = 100;
  const cy = 100;
  const r = 70;
  const angleOf = i => -Math.PI / 2 + i * (2 * Math.PI / axes.length);
  return (
    <svg width="100%" viewBox="0 0 200 200">
      {[25, 50, 75, 100].map(pct => {
        const rr = (pct / 100) * r;
        const pts = axes.map((_, i) => `${cx + rr * Math.cos(angleOf(i))},${cy + rr * Math.sin(angleOf(i))}`).join(" ");
        return <polygon key={pct} points={pts} fill="none" stroke="#e5e7eb" strokeWidth="1" />;
      })}
      {axes.map((ax, i) => {
        const x = cx + r * Math.cos(angleOf(i));
        const y = cy + r * Math.sin(angleOf(i));
        const lx = cx + (r + 16) * Math.cos(angleOf(i));
        const ly = cy + (r + 16) * Math.sin(angleOf(i));
        return (
          <g key={ax}>
            <line x1={cx} y1={cy} x2={x} y2={y} stroke="#e5e7eb" />
            <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fontSize="9" fill="#6b7280">{ax}</text>
          </g>
        );
      })}
      {branches.filter(b => b.hasData).map(b => {
        const vals = [b.score, Math.min(100, b.score + 5), Math.max(1, b.score - 5), Math.min(100, b.score + 2), Math.max(1, b.score - 3)];
        const pts = vals.map((v, i) => `${cx + (v / 100) * r * Math.cos(angleOf(i))},${cy + (v / 100) * r * Math.sin(angleOf(i))}`).join(" ");
        return <polygon key={b.id} points={pts} fill={`${b.color}33`} stroke={b.color} strokeWidth="2" />;
      })}
    </svg>
  );
}

function Toast({ msg, show }) {
  return (
    <div style={{ position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", background: "#0f4c2a", color: "#fff", padding: "10px 20px", borderRadius: 20, fontSize: 13, fontWeight: 500, zIndex: 300, boxShadow: "0 8px 40px rgba(22,101,52,.14)", opacity: show ? 1 : 0, transition: "opacity .25s", pointerEvents: "none", whiteSpace: "nowrap" }}>
      {msg}
    </div>
  );
}

function BranchCard({ b, onClick }) {
  return (
    <button onClick={onClick} className="card" style={{ padding: 14, textAlign: "left", cursor: "pointer", position: "relative", overflow: "hidden", transition: "all .2s" }}>
      <div style={{ position: "absolute", inset: "0 0 auto", height: 3, background: b.color }} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 22 }}>{b.icon}</span>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: b.hasData ? "#22c55e" : "#86efac", boxShadow: b.hasData ? "0 0 0 3px rgba(34,197,94,.2)" : "0 0 0 3px rgba(134,239,172,.2)" }} />
      </div>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#14532d" }}>{b.name}</div>
      <div style={{ fontSize: 10, color: "#6b7280" }}>{b.nameEn} · {b.id}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: b.hasData ? "#166534" : "#6b7280", margin: "6px 0 2px" }}>{b.hasData ? b.co2 : "—"}</div>
      <div style={{ fontSize: 9, color: "#6b7280" }}>{b.hasData ? "tCO₂e" : "ยังไม่มีข้อมูล"}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
        <div style={{ flex: 1, height: 4, background: "#dcfce7", borderRadius: 4, overflow: "hidden" }}>
          <div style={{ height: "100%", borderRadius: 4, background: "linear-gradient(90deg,#16a34a,#22c55e)", width: `${b.score}%`, transition: "width 1s ease" }} />
        </div>
        <span style={{ fontSize: 10, fontWeight: 700, color: b.hasData ? "#15803d" : "#6b7280" }}>{b.hasData ? b.score : "—"}</span>
      </div>
    </button>
  );
}

function BranchModal({ b, onClose, onGoUpload }) {
  if (!b) return null;
  const wTotal = b.waste.general + b.waste.recycle + b.waste.organic + b.waste.hazard;
  const rr = wTotal > 0 ? (((b.waste.recycle + b.waste.organic) / wTotal) * 100).toFixed(1) : "-";
  const rows = [
    ["Carbon Emission", `${b.co2} tCO₂e`],
    ["Sustainability Score", `${b.score} / 100`],
    ["ไฟฟ้า", `${b.elec.toLocaleString()} kWh`],
    ["น้ำ", `${b.water} m³`],
    ["เชื้อเพลิง", `${b.fuel} ลิตร`],
    ["ขยะทิ้ง", `${b.waste.general.toFixed(1)} กก.`],
    ["รีไซเคิล + ปุ๋ย", `${(b.waste.recycle + b.waste.organic).toFixed(1)} กก.`],
    ["อัตรา Zero Waste", `${rr}%`, "#15803d"],
    ["Carbon Credits", `${Math.round(b.co2 * 2.4)} credits`],
    ["รายการที่กรอก", `${b.entries} รายการ`],
    ["สถานะ", b.status === "excellent" ? "🟢 ดีเยี่ยม" : b.status === "good" ? "🔵 ดี" : "🟡 ปานกลาง"]
  ];
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", backdropFilter: "blur(6px)", display: "flex", alignItems: "flex-end", zIndex: 200, padding: "0 0 var(--nav-h)" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: "28px 28px 0 0", padding: 20, width: "100%", maxWidth: 640, margin: "0 auto", maxHeight: "82dvh", overflowY: "auto", position: "relative" }}>
        <div style={{ width: 40, height: 4, background: "#bbf7d0", borderRadius: 4, margin: "0 auto 16px" }} />
        <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "#f0fdf4", border: "none", borderRadius: 10, width: 32, height: 32, cursor: "pointer", color: "#6b7280" }}>✕</button>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#14532d" }}>{b.icon} {b.name}</div>
        <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 16 }}>{b.nameEn} · {b.id}</div>
        {!b.hasData ? (
          <div style={{ textAlign: "center", padding: "32px 20px", color: "#6b7280" }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>📋</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#14532d", marginBottom: 6 }}>ยังไม่มีข้อมูล</div>
            <button onClick={() => { onClose(); onGoUpload(); }} style={{ marginTop: 14, padding: "10px 20px", background: "#166534", color: "#fff", border: "none", borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>📝 ไปกรอกข้อมูล</button>
          </div>
        ) : (
          <>
            {rows.map(([lbl, val, col], i) => (
              <div key={lbl} style={{ display: "flex", justifyContent: "space-between", gap: 16, padding: "10px 0", borderBottom: i < rows.length - 1 ? "1px solid #d1fae5" : "none" }}>
                <span style={{ fontSize: 13, color: "#6b7280" }}>{lbl}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: col || "#14532d", textAlign: "right" }}>{val}</span>
              </div>
            ))}
            <button style={{ width: "100%", padding: 14, marginTop: 16, background: "linear-gradient(135deg,#166534,#16a34a)", color: "#fff", border: "none", borderRadius: 14, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>📄 สร้างรายงานสาขา</button>
          </>
        )}
      </div>
    </div>
  );
}

function ReportDetailModal({ report, totals, onClose, onDownload }) {
  if (!report) return null;
  const credits = Math.round(totals.co2 * 2.4);
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.42)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 220 }}>
      <div onClick={e => e.stopPropagation()} style={{ width: "min(760px,100%)", maxHeight: "86dvh", overflowY: "auto", background: "#fff", borderRadius: 24, padding: 20, border: "1px solid #d1fae5", boxShadow: "0 18px 70px rgba(22,101,52,.24)" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
          <div style={{ fontSize: 36 }}>{report.icon}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#14532d" }}>{report.title}</div>
            <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.7, marginTop: 4 }}>{report.basis}</div>
          </div>
          <button onClick={onClose} style={{ width: 34, height: 34, border: "none", borderRadius: 10, background: "#f0fdf4", color: "#6b7280", cursor: "pointer" }}>✕</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 14 }}>
          {[["Carbon รวม", totals.co2, "tCO₂e"], ["Carbon Credit", credits, "credits"], ["ข้อมูล", totals.entries, "รายการ"]].map(([l, v, u]) => (
            <div key={l} style={{ background: "#f0fdf4", border: "1px solid #d1fae5", borderRadius: 12, padding: 10, textAlign: "center" }}>
              <div style={{ fontSize: 10, color: "#6b7280" }}>{l}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#166534" }}>{v}</div>
              <div style={{ fontSize: 9, color: "#6b7280" }}>{u}</div>
            </div>
          ))}
        </div>
        <SectionTitle>หลักเกณฑ์และสูตรคำนวณ</SectionTitle>
        {report.formulas.map((f, i) => (
          <div key={i} style={{ padding: "9px 10px", marginBottom: 6, background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: 10, fontSize: 12, color: "#374151", lineHeight: 1.6 }}>{f}</div>
        ))}
        <SectionTitle style={{ marginTop: 16 }}>แหล่งอ้างอิง / วิธีตรวจสอบ</SectionTitle>
        {report.sources.map((s, i) => (
          <div key={i} style={{ display: "flex", gap: 8, padding: "7px 0", fontSize: 12, color: "#6b7280", lineHeight: 1.6 }}>
            <span style={{ color: "#15803d", fontWeight: 800 }}>✓</span><span>{s}</span>
          </div>
        ))}
        <button onClick={onDownload} style={{ width: "100%", padding: 13, marginTop: 14, background: "linear-gradient(135deg,#166534,#16a34a)", color: "#fff", border: "none", borderRadius: 14, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>⬇️ สร้าง / ดาวน์โหลดรายงานนี้</button>
      </div>
    </div>
  );
}

function AIPanel({ open, onToggle, branches }) {
  const [msgs, setMsgs] = useState([{ type: "bot", text: "สวัสดีครับ! ถามผมได้ทั้งคำถามทั่วไป งานเอกสาร ไอเดียธุรกิจ หรือเรื่อง ESG / Carbon / Zero Waste ของ Hillkoff ถ้าถามตัวเลข dashboard ผมจะอ้างอิงจากข้อมูลที่กรอกไว้ครับ 🌱" }]);
  const [input, setInput] = useState("");
  const msgsRef = useRef(null);
  const hasData = branches.some(b => b.hasData);
  const totals = useMemo(() => branches.reduce((acc, b) => ({ co2: +(acc.co2 + b.co2).toFixed(4), elec: acc.elec + b.elec, water: acc.water + b.water, fuel: acc.fuel + b.fuel, entries: acc.entries + b.entries }), { co2: 0, elec: 0, water: 0, fuel: 0, entries: 0 }), [branches]);

  const fallbackResponse = () => {
     if (!hasData) {
      return "ผมตอบคำถามทั่วไปได้ครับ แต่ตอนนี้ AI API ตอบกลับไม่สำเร็จ และ dashboard ยังไม่มีข้อมูลสาขา ถ้าถามเรื่องตัวเลข Carbon/สาขา ต้องกรอกข้อมูลหรืออัปโหลดไฟล์ก่อนครับ 📝";
    }
    const best = [...branches].filter(b => b.hasData).sort((a, b) => b.score - a.score)[0];
    return `Carbon รวม ${totals.co2.toFixed(2)} tCO₂e จาก ${totals.entries} รายการ สาขาที่มี Score สูงสุดคือ ${best?.name || "—"} และ Carbon Credit ประมาณ ${Math.round(totals.co2 * 2.4)} credits`;
  };

  const send = async () => {
    if (!input.trim()) return;
    const txt = input.trim();
    setInput("");
    setMsgs(m => [...m, { type: "user", text: txt }, { type: "bot", text: "…", loading: true }]);
    try {
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: txt, context: { totals, branches } })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "AI API error");
      setMsgs(m => {
        const copy = [...m];
        copy[copy.length - 1] = { type: "bot", text: data.reply };
        return copy;
      });
    } catch {
      setMsgs(m => {
        const copy = [...m];
        copy[copy.length - 1] = { type: "bot", text: fallbackResponse() };
        return copy;
      });
    }
  };

  useEffect(() => {
    if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
  }, [msgs]);

  return (
    <>
      <button className="ai-button" onClick={onToggle}>🤖</button>
      <div className={`ai-panel ${open ? "open" : "closed"}`}>
        <div style={{ background: "linear-gradient(135deg,#0f4c2a,#15803d)", padding: "14px 16px", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 22 }}>🤖</span>
          <div>
          <input className="input" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="ถามอะไรก็ได้ หรือถามข้อมูล ESG..." style={{ flex: 1, fontSize: 12 }} />
          <button onClick={send} style={{ width: 38, height: 38, background: "#166534", color: "#fff", border: "none", borderRadius: 10, fontSize: 16, cursor: "pointer" }}>➤</button>
        </div>
        </div>
        <div ref={msgsRef} style={{ padding: 14, height: 232, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
          {msgs.map((m, i) => (
            <div key={i} style={{ padding: "10px 12px", borderRadius: 14, fontSize: 12, lineHeight: 1.5, maxWidth: "88%", opacity: m.loading ? .6 : 1, alignSelf: m.type === "user" ? "flex-end" : "flex-start", background: m.type === "user" ? "#166534" : "#f0fdf4", color: m.type === "user" ? "#fff" : "#14532d", borderBottomLeftRadius: m.type === "bot" ? 4 : 14, borderBottomRightRadius: m.type === "user" ? 4 : 14 }}>{m.text}</div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, padding: "12px 14px", borderTop: "1px solid #d1fae5" }}>
          <input className="input" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="ถามเกี่ยวกับ ESG / Carbon / ขยะ..." style={{ flex: 1, fontSize: 12 }} />
          <button onClick={send} style={{ width: 38, height: 38, background: "#166534", color: "#fff", border: "none", borderRadius: 10, fontSize: 16, cursor: "pointer" }}>➤</button>
        </div>
      </div>
    </>
  );
}

function PageHome({ branches, monthlyCo2, onBranchClick, onGoUpload }) {
  const totals = branches.reduce((acc, b) => ({ co2: +(acc.co2 + b.co2).toFixed(4), elec: acc.elec + b.elec, water: acc.water + b.water, fuel: acc.fuel + b.fuel, entries: acc.entries + b.entries }), { co2: 0, elec: 0, water: 0, fuel: 0, entries: 0 });
  const hasData = branches.some(b => b.hasData);
  return (
    <div className="fade-up">
      <div className="hero">
        <div className="brand-row">
          <div className="brand-left">
            <div className="brand-icon">☕</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", lineHeight: 1 }}>Hillkoff</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,.75)", marginTop: 2 }}>Zero Waste Analytics</div>
            </div>
          </div>
          <div className="chip">📊 Analytics Platform</div>
        </div>
        <div className="hero-main">
          <div style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,.65)", marginBottom: 4 }}>Carbon Footprint รวมองค์กร</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 6 }}>
            <div className="hero-stat" style={{ fontSize: 52, fontWeight: 800, color: "#fff", lineHeight: 1 }}>{totals.co2}</div>
            <div style={{ color: "rgba(255,255,255,.65)", fontSize: 13, marginBottom: 10 }}>tCO₂e</div>
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,.65)", marginTop: 4 }}>{hasData ? "ข้อมูลสะสมทุกสาขา" : "ยังไม่มีข้อมูล — เริ่มกรอกหรืออัปโหลดในหน้า Upload"}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, margin: "14px 0" }}>
            {[totals.entries, totals.elec > 0 ? numFmt(totals.elec) : "0", "6"].map((v, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,.1)", borderRadius: 12, padding: "10px 8px", textAlign: "center", border: "1px solid rgba(255,255,255,.12)" }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>{v}</div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,.65)", marginTop: 2 }}>{["รายการ", "kWh", "สาขา"][i]}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {["ESG", "Net Zero", "Scope 1·2·3", "TCFD", "Zero Waste"].map(t => <span key={t} className="chip">{t}</span>)}
          </div>
          <button onClick={onGoUpload} style={{ width: "100%", marginTop: 14, padding: 13, background: "rgba(255,255,255,.95)", color: "#166534", border: "none", borderRadius: 14, fontSize: 14, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 20px rgba(0,0,0,.15)" }}>📝 กรอก / อัปโหลดข้อมูลสาขา</button>
        </div>
      </div>

      <SectionTitle>สาขาทั้งหมด</SectionTitle>
      <div className="branch-grid">{branches.map((b, i) => <BranchCard key={b.id} b={b} onClick={() => onBranchClick(i)} />)}</div>

      <div className="desktop-two" style={{ marginTop: 32 }}>
        <div>
          <SectionTitle>Carbon รายเดือน</SectionTitle>
          <div className="card" style={{ padding: 18 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#14532d" }}>Carbon Emission 2024</div>
            <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 14 }}>tCO₂e รายเดือน</div>
            <MiniBarChart data={monthlyCo2} labels={MONTHS} color="#16a34a" />
          </div>
        </div>
        <div>
          <SectionTitle>การใช้ทรัพยากรรวม</SectionTitle>
          <div className="metric-grid">
            {[["⚡", totals.elec, "kWh", "ไฟฟ้า"], ["💧", totals.water, "m³", "น้ำ"], ["⛽", totals.fuel, "L", "เชื้อเพลิง"]].map(([icon, val, unit, lbl]) => (
              <div key={lbl} className="card" style={{ padding: "14px 12px", textAlign: "center" }}>
                <div style={{ fontSize: 22, marginBottom: 4 }}>{icon}</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: val > 0 ? "#166534" : "#6b7280", lineHeight: 1 }}>{val > 0 ? numFmt(val) : "0"}</div>
                <div style={{ fontSize: 9, color: "#6b7280" }}>{unit}</div>
                <div style={{ fontSize: 10, color: "#6b7280", marginTop: 3 }}>{lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 32, background: "linear-gradient(135deg,#0f4c2a,#166534)", borderRadius: 20, padding: 20, color: "#fff", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: -10, bottom: -10, fontSize: 80, opacity: .1 }}>🌿</div>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>🌱 Zero Waste & Sustainability</div>
        <div style={{ fontSize: 12, lineHeight: 1.7, opacity: .82 }}>ระบบนี้ช่วยให้องค์กรเห็นภาพการใช้ทรัพยากร ลดต้นทุน ลด Carbon Emission และสนับสนุนแนวทาง ESG / Net Zero อย่างเป็นรูปธรรม</div>
      </div>
    </div>
  );
}

function PageUpload({ branches, onSave, showToast }) {
  const [branchId, setBranchId] = useState("HQ");
  const [month, setMonth] = useState("2024-06");
  const [docSource, setDocSource] = useState("");
  const [docOwner, setDocOwner] = useState("");
  const [docReference, setDocReference] = useState("");
  const [elec, setElec] = useState("");
  const [elecThb, setElecThb] = useState("");
  const [water, setWater] = useState("");
  const [waterThb, setWaterThb] = useState("");
  const [fuel, setFuel] = useState("");
  const [fuelType, setFuelType] = useState("diesel");
  const [matCat, setMatCat] = useState("");
  const [matItemIdx, setMatItemIdx] = useState("");
  const [matQty, setMatQty] = useState("");
  const [matEntries, setMatEntries] = useState([]);
  const [waste, setWaste] = useState({ food: "", paper: "", plastic: "", rPaper: "", rPlastic: "", rMetal: "", oCoffee: "", oFood: "", oOther: "", hChem: "", hBatt: "", hLandfill: "" });
  const [note, setNote] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [readyFiles, setReadyFiles] = useState([]);
  const fileRef = useRef(null);

  const currentItems = matCat ? MAT_CATALOG[matCat].items : [];
  const currentUnit = matCat && matItemIdx !== "" ? currentItems[parseInt(matItemIdx)]?.[1] || "—" : "—";
  const hasManualData = asNumber(elec) > 0 || asNumber(water) > 0 || asNumber(fuel) > 0 || matEntries.length > 0 || Object.values(waste).some(v => asNumber(v) > 0);
  const hasFileData = readyFiles.length > 0;
  const canAnalyze = hasManualData || hasFileData;

  const addMat = () => {
    if (!matCat) return showToast("⚠️ เลือกหมวดหมู่ก่อน");
    if (matItemIdx === "") return showToast("⚠️ เลือกรายการก่อน");
    const q = asNumber(matQty);
    if (!q || q <= 0) return showToast("⚠️ กรอกจำนวนให้ถูกต้อง");
    const [name, unit] = currentItems[parseInt(matItemIdx)];
    const catLabel = MAT_CATALOG[matCat].label.replace(/^[^ ]+ /, "");
    setMatEntries(prev => {
      const ex = prev.find(e => e.cat === matCat && e.name === name);
      if (ex) return prev.map(e => e.cat === matCat && e.name === name ? { ...e, qty: e.qty + q } : e);
      return [...prev, { cat: matCat, catLabel, name, qty: q, unit }];
    });
    setMatQty("");
  };

  const handleFile = file => {
    const ext = file.name.split(".").pop().toLowerCase();
    if (!["xlsx", "csv", "pdf"].includes(ext)) return showToast("⚠️ ไฟล์นี้ไม่รองรับ");
    const id = Date.now() + Math.random();
    const size = file.size > 1048576 ? `${(file.size / 1048576).toFixed(1)}MB` : `${Math.max(1, Math.round(file.size / 1024))}KB`;
    const documentMeta = {
      id,
      name: file.name,
      ext,
      size,
      source: docSource || "ไม่ระบุแหล่งที่มา",
      owner: docOwner || "ไม่ระบุผู้ส่ง",
      reference: docReference || "-",
      branchId,
      month,
      uploadedAt: new Date().toISOString()
    };
    setUploadedFiles(prev => [{ ...documentMeta, status: "processing" }, ...prev]);
    setTimeout(() => {
      setUploadedFiles(prev => prev.map(f => f.id === id ? { ...f, status: "done" } : f));
      setReadyFiles(prev => [...prev, documentMeta]);
      showToast(`✅ นำเข้าสำเร็จ: ${file.name}`);
    }, 900);
  };

  const analyze = () => {
    if (!canAnalyze) return showToast("⚠️ กรุณากรอกข้อมูลหรืออัปโหลดไฟล์อย่างน้อย 1 รายการ");
    setAnalyzing(true);
    setTimeout(() => {
      let totalElec = asNumber(elec);
      let totalWater = asNumber(water);
      let totalFuel = asNumber(fuel);
      let totalWGen = asNumber(waste.food) + asNumber(waste.paper) + asNumber(waste.plastic);
      let totalWRec = asNumber(waste.rPaper) + asNumber(waste.rPlastic) + asNumber(waste.rMetal);
      let totalWOrg = asNumber(waste.oCoffee) + asNumber(waste.oFood) + asNumber(waste.oOther);
      let totalWHaz = asNumber(waste.hChem) + asNumber(waste.hBatt) + asNumber(waste.hLandfill);
      let totalMatCount = matEntries.length;
      const fileDescriptions = [];

      readyFiles.forEach(f => {
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
      });

      const ff = { diesel: 2.67, gasoline: 2.31, lpg: 2.98, cng: 2.15 }[fuelType] || 2.31;
      const co2Elec = +(totalElec * 0.4716 / 1000).toFixed(4);
      const co2Water = +(totalWater * 0.00149).toFixed(4);
      const co2Fuel = +(totalFuel * ff / 1000).toFixed(4);
      const co2Total = +(co2Elec + co2Water + co2Fuel).toFixed(4);
      const wTotal = totalWGen + totalWRec + totalWOrg + totalWHaz;
      const rr = wTotal > 0 ? ((totalWRec + totalWOrg) / wTotal * 100).toFixed(1) : "0.0";

      const documents = readyFiles.map(f => ({ ...f, description: simulateFileExtraction(f.name, branchId).description }));
      onSave({ branchId, month, elec: totalElec, water: totalWater, fuel: totalFuel, co2Total, co2Elec, co2Water, co2Fuel, wGen: totalWGen, wRec: totalWRec, wOrg: totalWOrg, wHaz: totalWHaz, matCount: totalMatCount, recycleRate: rr, materials: [...matEntries], documents, note });
      setResult({ co2Elec, co2Water, co2Fuel, co2Total, elec: totalElec, water: totalWater, fuel: totalFuel, wGen: totalWGen, wRec: totalWRec, wOrg: totalWOrg, wHaz: totalWHaz, wTotal, rr, matCount: totalMatCount, matEntries: [...matEntries], branchName: branches.find(b => b.id === branchId)?.name || branchId, filesUsed: readyFiles.length, fileDescriptions, hasManual: hasManualData });
      setMatEntries([]);
      setReadyFiles([]);
      setAnalyzing(false);
    }, 900);
  };

  const input = (val, set, ph = "0") => <input className="input" type="number" value={val} onChange={e => set(e.target.value)} placeholder={ph} min="0" />;
  const select = (val, set, opts) => <select className="select" value={val} onChange={e => set(e.target.value)}>{opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>;
  const WasteIn = ({ label, k }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <div style={{ fontSize: 10, color: "#6b7280" }}>{label}</div>
      <input className="input" type="number" value={waste[k]} onChange={e => setWaste(p => ({ ...p, [k]: e.target.value }))} placeholder="0" min="0" style={{ fontFamily: "var(--mono)", textAlign: "right", padding: "8px 10px" }} />
    </div>
  );

  return (
    <div className="fade-up">
      <PageHeader title="📝 กรอกข้อมูล / นำเข้าไฟล์" sub="กรอกบิล · ขยะ · วัสดุ หรืออัปโหลด Excel/CSV/PDF แล้วกดวิเคราะห์" />

      <div className="card" style={{ padding: "12px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#dcfce7", display: "grid", placeItems: "center", flexShrink: 0 }}>💡</div>
        <div style={{ fontSize: 12, color: "#374151", lineHeight: 1.6 }}><b style={{ color: "#14532d" }}>วิธีใช้:</b> อัปโหลดไฟล์ <b>หรือ</b> กรอกข้อมูลด้วยตนเอง อย่างใดอย่างหนึ่งก็ได้ แล้วกด <b>วิเคราะห์</b></div>
      </div>

      <div className="form-grid-wide">
        <div>
          <SectionTitle>① อัปโหลดไฟล์</SectionTitle>
          <div className="card" style={{ padding: 12, marginBottom: 10 }}>
            <div className="form-grid-2" style={{ marginBottom: 8 }}>
              <FormGroup label="ที่มาของเอกสาร"><input className="input" value={docSource} onChange={e => setDocSource(e.target.value)} placeholder="เช่น บิล MEA / Supplier / POS" /></FormGroup>
              <FormGroup label="ผู้ส่ง/เจ้าของเอกสาร"><input className="input" value={docOwner} onChange={e => setDocOwner(e.target.value)} placeholder="ชื่อผู้ส่งหรือแผนก" /></FormGroup>
            </div>
            <FormGroup label="เลขที่อ้างอิง / หมายเหตุไฟล์"><input className="input" value={docReference} onChange={e => setDocReference(e.target.value)} placeholder="เลขบิล เลข PO หรือ URL ต้นทาง" /></FormGroup>
          </div>
          <div onClick={() => fileRef.current?.click()} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); Array.from(e.dataTransfer.files).forEach(handleFile); }} style={{ border: "2px dashed #86efac", borderRadius: 20, padding: "40px 20px", textAlign: "center", background: "#f0fdf4", cursor: "pointer" }}>
            <input ref={fileRef} type="file" multiple accept=".xlsx,.csv,.pdf" style={{ display: "none" }} onChange={e => Array.from(e.target.files || []).forEach(handleFile)} />
            <div style={{ fontSize: 44, marginBottom: 10 }}>📂</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#14532d" }}>ลากไฟล์มาวางที่นี่</div>
            <div style={{ fontSize: 12, color: "#6b7280" }}>หรือคลิกเพื่อเลือกไฟล์ Excel / CSV / PDF</div>
          </div>

          {uploadedFiles.length > 0 && (
            <>
              <SectionTitle style={{ marginTop: 16 }}>ไฟล์ที่นำเข้า</SectionTitle>
              {uploadedFiles.map(f => (
                <div key={f.id} className="card" style={{ padding: "12px 14px", marginBottom: 8, display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 28 }}>{({ xlsx: "📊", csv: "📋", pdf: "📄" })[f.ext]}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#14532d", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</div>
                    <div style={{ fontSize: 10, color: "#6b7280", marginTop: 2 }}>{f.size} · {f.ext.toUpperCase()} · {f.source} · {f.owner}</div>
                    {f.status === "processing" && <div style={{ width: "100%", height: 3, background: "#dcfce7", borderRadius: 3, marginTop: 6, overflow: "hidden" }}><div style={{ height: "100%", background: "linear-gradient(90deg,#16a34a,#22c55e)", animation: "progress .9s ease forwards" }} /></div>}
                    {f.status === "done" && <div style={{ fontSize: 10, color: "#15803d", marginTop: 3 }}>✓ พร้อมวิเคราะห์</div>}
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 8, background: f.status === "done" ? "#dcfce7" : "#fef9c3", color: f.status === "done" ? "#166534" : "#854d0e" }}>{f.status === "done" ? "✓ พร้อม" : "กำลังอ่าน"}</span>
                </div>
              ))}
            </>
          )}
        </div>

        <div>
          {hasFileData && (
            <div style={{ background: "linear-gradient(90deg,#166534,#15803d)", borderRadius: 14, padding: "12px 16px", marginBottom: 12, display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 22 }}>📂</span>
              <div style={{ flex: 1 }}><div style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{readyFiles.length} ไฟล์พร้อมวิเคราะห์</div><div style={{ fontSize: 10, color: "rgba(255,255,255,.7)" }}>ระบบจะอ่านข้อมูลและคำนวณ Carbon อัตโนมัติ</div></div>
              <span style={{ fontSize: 10, padding: "3px 10px", borderRadius: 20, background: "rgba(255,255,255,.2)", color: "#fff", fontWeight: 700 }}>AI Ready</span>
            </div>
          )}

          <SectionTitle>② กรอกข้อมูลด้วยตนเอง</SectionTitle>
          <FormCard title="🏢 เลือกสาขาและช่วงเวลา" sub="เลือกสาขาที่ต้องการบันทึก และระบุเดือน/ปี">
            <div className="form-grid-2">
              <FormGroup label="สาขา">{select(branchId, setBranchId, BRANCHES_INIT.map(b => [b.id, `${b.icon} ${b.name}`]))}</FormGroup>
              <FormGroup label="เดือน / ปี"><input className="input" type="month" value={month} onChange={e => setMonth(e.target.value)} /></FormGroup>
            </div>
          </FormCard>
        </div>
      </div>

      <FormCard title="⚡ ค่าสาธารณูปโภค" sub="กรอกข้อมูลจากบิลค่าน้ำ ค่าไฟ และเชื้อเพลิง">
        <div className="form-grid-2" style={{ marginBottom: 10 }}>
          <FormGroup label="ค่าไฟฟ้า (kWh)">{input(elec, setElec)}</FormGroup>
          <FormGroup label="ค่าไฟฟ้า (บาท)">{input(elecThb, setElecThb)}</FormGroup>
        </div>
        <div className="form-grid-2" style={{ marginBottom: 10 }}>
          <FormGroup label="ค่าน้ำประปา (m³)">{input(water, setWater)}</FormGroup>
          <FormGroup label="ค่าน้ำประปา (บาท)">{input(waterThb, setWaterThb)}</FormGroup>
        </div>
        <div className="form-grid-2">
          <FormGroup label="เชื้อเพลิง (ลิตร)">{input(fuel, setFuel)}</FormGroup>
          <FormGroup label="ประเภทเชื้อเพลิง">{select(fuelType, setFuelType, [["diesel", "ดีเซล"], ["gasoline", "เบนซิน"], ["lpg", "LPG (กก.)"], ["cng", "CNG (กก.)"]])}</FormGroup>
        </div>
      </FormCard>

      <FormCard title="📦 รายการเบิกใช้วัสดุ" sub="เลือกหมวดหมู่ → เลือกรายการ → กรอกจำนวน → กดเพิ่ม">
        <div className="form-grid-2" style={{ marginBottom: 10 }}>
          <select className="select" value={matCat} onChange={e => { setMatCat(e.target.value); setMatItemIdx(""); }}>
            <option value="">— เลือกหมวด —</option>
            {Object.entries(MAT_CATALOG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <select className="select" value={matItemIdx} onChange={e => setMatItemIdx(e.target.value)}>
            <option value="">— เลือกรายการ —</option>
            {currentItems.map(([name], i) => <option key={name} value={i}>{name}</option>)}
          </select>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <input className="input" type="number" value={matQty} onChange={e => setMatQty(e.target.value)} onKeyDown={e => e.key === "Enter" && addMat()} placeholder="0" min="0" style={{ width: 100, fontFamily: "var(--mono)", textAlign: "right" }} />
          <span style={{ fontSize: 11, color: "#6b7280", whiteSpace: "nowrap" }}>{currentUnit}</span>
          <button onClick={addMat} style={{ padding: "9px 16px", background: "#166534", color: "#fff", border: "none", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>+ เพิ่มรายการ</button>
        </div>
        {matEntries.length === 0 ? (
          <div style={{ textAlign: "center", padding: 18, color: "#6b7280", fontSize: 12, border: "1.5px dashed #d1fae5", borderRadius: 10 }}>ยังไม่มีรายการ</div>
        ) : matEntries.map((e, i) => (
          <div key={`${e.name}-${i}`} style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", background: "#f0fdf4", borderRadius: 10, border: "1px solid #d1fae5", marginBottom: 6 }}>
            <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 6, background: "#dcfce7", color: "#166534" }}>{e.catLabel}</span>
            <span style={{ flex: 1, fontSize: 12, fontWeight: 700, color: "#14532d" }}>{e.name}</span>
            <span style={{ fontFamily: "var(--mono)", fontSize: 12, fontWeight: 700, color: "#166534" }}>{e.qty} {e.unit}</span>
            <button onClick={() => setMatEntries(prev => prev.filter((_, j) => j !== i))} style={{ width: 24, height: 24, border: "none", background: "rgba(239,68,68,.1)", borderRadius: 6, color: "#ef4444", cursor: "pointer" }}>✕</button>
          </div>
        ))}
      </FormCard>

      <FormCard title="♻️ ปริมาณขยะ" sub="บันทึกขยะแต่ละประเภทที่เกิดขึ้นในเดือนนี้ (กิโลกรัม)">
        {[
          ["🗑️ ขยะทั่วไป (ทิ้ง)", [["อาหาร/เศษอาหาร", "food"], ["กระดาษ", "paper"], ["พลาสติก", "plastic"]]],
          ["♻️ รีไซเคิล", [["กระดาษ", "rPaper"], ["พลาสติก/แก้ว", "rPlastic"], ["โลหะ/อื่นๆ", "rMetal"]]],
          ["🌱 ขยะอินทรีย์ (ทำปุ๋ย)", [["กากกาแฟ", "oCoffee"], ["เศษอาหาร", "oFood"], ["อื่นๆ", "oOther"]]],
          ["⚠️ ขยะอันตราย / ฝังกลบ", [["สารเคมี", "hChem"], ["แบตเตอรี่", "hBatt"], ["ฝังกลบอื่นๆ", "hLandfill"]]]
        ].map(([lbl, fields]) => (
          <div key={lbl}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#14532d", margin: "10px 0 6px", padding: "6px 10px", background: "#f0fdf4", borderRadius: 8 }}>{lbl}</div>
            <div className="form-grid-3">{fields.map(([l, k]) => <WasteIn key={k} label={l} k={k} />)}</div>
          </div>
        ))}
      </FormCard>

      <FormCard title="📝 หมายเหตุเพิ่มเติม">
        <FormGroup label="บันทึกข้อความ (ถ้ามี)">
          <textarea className="textarea" value={note} onChange={e => setNote(e.target.value)} rows={3} placeholder="เช่น มีการปิดปรับปรุง / กิจกรรมพิเศษในเดือนนี้..." />
        </FormGroup>
      </FormCard>

      <button onClick={analyze} disabled={analyzing || !canAnalyze} style={{ width: "100%", padding: 16, background: canAnalyze ? "linear-gradient(135deg,#166534,#16a34a)" : "#d1fae5", color: canAnalyze ? "#fff" : "#6b7280", border: "none", borderRadius: 16, fontSize: 15, fontWeight: 700, cursor: analyzing || !canAnalyze ? "not-allowed" : "pointer", boxShadow: canAnalyze ? "0 4px 20px rgba(22,101,52,.35)" : "none", marginTop: 2 }}>
        {analyzing ? <><span style={{ display: "inline-block", animation: "spin .8s linear infinite" }}>⏳</span> กำลังคำนวณ Carbon...</> : canAnalyze ? `🔍 วิเคราะห์และบันทึกข้อมูล ${hasFileData ? `(${readyFiles.length} ไฟล์${hasManualData ? " + ข้อมูลด้วยตนเอง" : ""})` : ""}` : "🔍 วิเคราะห์และบันทึกข้อมูล"}
      </button>
      {!canAnalyze && <div style={{ textAlign: "center", fontSize: 11, color: "#6b7280", marginTop: 6 }}>อัปโหลดไฟล์ หรือ กรอกข้อมูลอย่างน้อย 1 รายการ แล้วกดวิเคราะห์</div>}

      {result && (
        <div style={{ marginTop: 12 }} className="fade-up">
          <div style={{ background: "linear-gradient(135deg,#0f4c2a,#15803d)", borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 28 }}>✅</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>บันทึกสำเร็จ — {result.branchName} · {month}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,.7)", marginTop: 2 }}>Carbon: {result.co2Total} tCO₂e · ขยะรีไซเคิล: {result.rr}% {result.filesUsed > 0 && `· จากไฟล์: ${result.filesUsed} ไฟล์`} {result.matCount > 0 && `· วัสดุ: ${result.matCount} รายการ`}</div>
            </div>
          </div>
          {result.filesUsed > 0 && (
            <div className="card" style={{ padding: 12, marginTop: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#14532d", marginBottom: 6 }}>📂 ข้อมูลที่อ่านได้จากไฟล์</div>
              {result.fileDescriptions.map((d, i) => <div key={i} style={{ fontSize: 11, color: "#6b7280", padding: "4px 0", borderBottom: i < result.fileDescriptions.length - 1 ? "1px solid #f0fdf4" : "none" }}>✓ {d}</div>)}
            </div>
          )}
          <div className="card" style={{ padding: 12, marginTop: 8 }}>
            <div className="analytics-grid">
              {[["ไฟฟ้า", `${result.elec} kWh`, `→ ${result.co2Elec} tCO₂e`], ["น้ำ", `${result.water} m³`, `→ ${result.co2Water} tCO₂e`], ["เชื้อเพลิง", `${result.fuel} ลิตร`, `→ ${result.co2Fuel} tCO₂e`], ["อัตรารีไซเคิล", `${result.rr}%`, "ของขยะทั้งหมด"]].map(([l, v, u]) => (
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
          </div>
        </div>
      )}
    </div>
  );
}

function PageAnalytics({ branches, monthlyCo2, entriesLog }) {
  const hasData = branches.some(b => b.hasData);
  const totals = branches.reduce((acc, b) => ({ co2: +(acc.co2 + b.co2).toFixed(4), elec: acc.elec + b.elec, water: acc.water + b.water, fuel: acc.fuel + b.fuel, entries: acc.entries + b.entries }), { co2: 0, elec: 0, water: 0, fuel: 0, entries: 0 });
  const topMaterialsByMonth = groupTopByMonth(entriesLog, entry => entry.materials || []);
  const topWasteByMonth = groupTopByMonth(entriesLog, getWasteItems);
  const latestMonthIdx = monthlyCo2.reduce((latest, value, idx) => value > 0 ? idx : latest, -1);
  const prevMonthIdx = latestMonthIdx > 0 ? latestMonthIdx - 1 : -1;
  const latestMonthValue = latestMonthIdx >= 0 ? monthlyCo2[latestMonthIdx] : 0;
  const prevMonthValue = prevMonthIdx >= 0 ? monthlyCo2[prevMonthIdx] : 0;
  const monthDelta = +(latestMonthValue - prevMonthValue).toFixed(4);
  const monthDeltaPct = prevMonthValue > 0 ? +((monthDelta / prevMonthValue) * 100).toFixed(1) : null;
  const forecasts = ["ก.ค.", "ส.ค.", "ก.ย."].map((m, i) => ({ month: m, val: (totals.co2 * (1 + (i + 1) * 0.025)).toFixed(2), trend: (i + 1) * 2.5 }));
  const e = +(totals.elec * 0.4716 / 1000).toFixed(2);
  const w = +(totals.water * 0.00149).toFixed(2);
  const f = +(totals.fuel * 2.31 / 1000).toFixed(2);

  return (
    <div className="fade-up">
      <PageHeader title="📊 Analytics + AI Forecast" sub="วิเคราะห์และคาดการณ์ด้วย AI" />
      <SectionTitle>AI Forecast · คาดการณ์</SectionTitle>
      <div className="card" style={{ padding: 16, marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: 20 }}>🤖</span><span style={{ fontSize: 13, fontWeight: 700, color: "#14532d" }}>AI Carbon Forecast (3 เดือนข้างหน้า)</span>
          <span style={{ marginLeft: "auto", fontSize: 9, padding: "2px 8px", borderRadius: 8, background: "linear-gradient(90deg,#7c3aed,#4f46e5)", color: "#fff", fontWeight: 700 }}>AI Powered</span>
        </div>
        {!hasData ? <div style={{ textAlign: "center", padding: 24, color: "#6b7280" }}><div style={{ fontSize: 36 }}>🤖</div><div style={{ fontSize: 13, fontWeight: 700, color: "#14532d" }}>ยังไม่มีข้อมูลสำหรับคาดการณ์</div><div style={{ fontSize: 12 }}>กรอกข้อมูลหรืออัปโหลดไฟล์อย่างน้อย 1 รายการ</div></div> : (
          <>
            <div className="metric-grid">{forecasts.map(fc => <div key={fc.month} style={{ background: "#f0fdf4", borderRadius: 12, padding: 10, textAlign: "center", border: "1px solid #d1fae5" }}><div style={{ fontSize: 10, color: "#6b7280" }}>{fc.month} 2024</div><div style={{ fontSize: 16, fontWeight: 800, color: "#166534" }}>{fc.val}</div><div style={{ fontSize: 9, color: "#6b7280" }}>tCO₂e</div><div style={{ fontSize: 9, color: "#ef4444", fontWeight: 700 }}>▲ {fc.trend.toFixed(1)}%</div></div>)}</div>
            <div style={{ background: "rgba(124,58,237,.08)", border: "1px solid rgba(124,58,237,.2)", borderRadius: 12, padding: 12, marginTop: 10 }}><div style={{ fontSize: 11, fontWeight: 700, color: "#7c3aed", marginBottom: 6 }}>💡 AI Insight</div><div style={{ fontSize: 11, lineHeight: 1.6, color: "#6b7280" }}>จากข้อมูล {totals.entries} รายการ — Carbon Emission รวม {totals.co2} tCO₂e แนะนำติดตามการใช้ไฟฟ้าเป็นหลัก เพราะเป็นแหล่ง Scope 2 ที่ใหญ่ที่สุด</div></div>
          </>
        )}
      </div>
      <SectionTitle>วิเคราะห์ข้อมูล</SectionTitle>
      <div className="card" style={{ padding: 16, marginBottom: 14, borderColor: monthDelta <= 0 ? "#bbf7d0" : "#fecaca" }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: monthDelta <= 0 ? "#166534" : "#b91c1c" }}>เปรียบเทียบรายเดือน</div>
        <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
          {latestMonthIdx < 0 ? "ยังไม่มีข้อมูลรายเดือนสำหรับเปรียบเทียบ" : `${MONTHS[latestMonthIdx]} เทียบกับ ${prevMonthIdx >= 0 ? MONTHS[prevMonthIdx] : "เดือนก่อนหน้า"}: ${monthDelta <= 0 ? "ดีขึ้น" : "แย่ลง"} ${Math.abs(monthDelta)} tCO2e${monthDeltaPct !== null ? ` (${Math.abs(monthDeltaPct)}%)` : ""}`}
        </div>
      </div>
      <div className="analytics-grid" style={{ marginBottom: 14 }}>
        {[["Carbon รวม", totals.co2, "tCO₂e", totals.co2 > 0], ["ไฟฟ้ารวม", totals.elec > 0 ? numFmt(totals.elec) : "0", "kWh", totals.elec > 0], ["น้ำรวม", totals.water > 0 ? numFmt(totals.water) : "0", "m³", totals.water > 0], ["เชื้อเพลิง", totals.fuel > 0 ? numFmt(totals.fuel) : "0", "ลิตร", totals.fuel > 0]].map(([lbl, val, unit, hasD]) => <div key={lbl} className="card" style={{ padding: 12 }}><div style={{ fontSize: 10, color: "#6b7280", fontWeight: 600, marginBottom: 4 }}>{lbl}</div><div style={{ fontSize: 22, fontWeight: 800, color: hasD ? "#166534" : "#6b7280", lineHeight: 1 }}>{val}</div><div style={{ fontSize: 10, color: "#6b7280" }}>{unit}</div></div>)}
      </div>
      <div className="desktop-two">
        <div className="card" style={{ padding: 18, marginBottom: 14 }}><div style={{ fontSize: 13, fontWeight: 700, color: "#14532d" }}>Carbon รายเดือน</div><div style={{ fontSize: 11, color: "#6b7280", marginBottom: 14 }}>tCO₂e แต่ละเดือน</div><MiniBarChart data={monthlyCo2} labels={MONTHS} /></div>
        <div className="card" style={{ padding: 18 }}><div style={{ fontSize: 13, fontWeight: 700, color: "#14532d", marginBottom: 4 }}>สัดส่วน Carbon Emission</div><div style={{ fontSize: 11, color: "#6b7280", marginBottom: 14 }}>แยกตามแหล่งกำเนิด</div><DonutChart slices={[e, w, f]} labels={[`ไฟฟ้า · ${e} tCO₂e`, `น้ำ · ${w} tCO₂e`, `เชื้อเพลิง · ${f} tCO₂e`]} /></div>
      </div>
      <SectionTitle style={{ marginTop: 18 }}>วิเคราะห์ขยะและวัสดุรายเดือน</SectionTitle>
      <div className="desktop-two">
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: "#14532d", marginBottom: 8 }}>วัสดุที่เบิกใช้เยอะสุด</div>
          {Object.keys(topMaterialsByMonth).length === 0 ? <div style={{ fontSize: 12, color: "#6b7280" }}>ยังไม่มีข้อมูลวัสดุ</div> : Object.entries(topMaterialsByMonth).map(([month, items]) => (
            <div key={month} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#166534", marginBottom: 4 }}>{month}</div>
              {items.map(item => <div key={`${month}-${item.name}`} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "5px 0", borderBottom: "1px solid #f0fdf4" }}><span>{item.name}</span><b>{numFmt(item.qty)} {item.unit}</b></div>)}
            </div>
          ))}
        </div>
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: "#14532d", marginBottom: 8 }}>ประเภทขยะที่เยอะสุด</div>
          {Object.keys(topWasteByMonth).length === 0 ? <div style={{ fontSize: 12, color: "#6b7280" }}>ยังไม่มีข้อมูลขยะ</div> : Object.entries(topWasteByMonth).map(([month, items]) => (
            <div key={month} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#166534", marginBottom: 4 }}>{month}</div>
              {items.map(item => <div key={`${month}-${item.name}`} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "5px 0", borderBottom: "1px solid #f0fdf4" }}><span>{item.name}</span><b>{numFmt(item.qty)} {item.unit}</b></div>)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PageRanking({ branches, onBranchClick }) {
  const [mode, setMode] = useState("score");
  const hasData = branches.some(b => b.hasData);
  const sorted = [...branches].sort((a, b) => {
    if (a.hasData && !b.hasData) return -1;
    if (!a.hasData && b.hasData) return 1;
    if (mode === "score") return b.score - a.score;
    if (mode === "carbon") return a.co2 - b.co2;
    return a.elec - b.elec;
  });
  const withData = sorted.filter(b => b.hasData);
  const maxVal = withData.length ? (mode === "score" ? 100 : mode === "carbon" ? Math.max(...withData.map(b => b.co2)) : Math.max(...withData.map(b => b.elec))) : 1;
  const unit = mode === "score" ? "pts" : mode === "carbon" ? "tCO₂e" : "kWh";
  return (
    <div className="fade-up">
      <PageHeader title="🏆 Ranking" sub="จัดอันดับสาขา Sustainability" />
      <SectionTitle>จัดอันดับสาขา</SectionTitle>
      <div style={{ display: "flex", gap: 6, marginBottom: 16, overflowX: "auto", paddingBottom: 2 }}>
        {[["score", "Sustainability"], ["carbon", "Carbon ต่ำสุด"], ["energy", "ประหยัดพลังงาน"]].map(([k, l]) => <button key={k} onClick={() => setMode(k)} style={{ padding: "7px 16px", borderRadius: 20, fontSize: 12, fontWeight: 700, border: "1px solid #d1fae5", background: mode === k ? "#166534" : "#fff", color: mode === k ? "#fff" : "#6b7280", cursor: "pointer", whiteSpace: "nowrap" }}>{l}</button>)}
      </div>
      {!hasData ? <div className="card" style={{ padding: "32px 20px", textAlign: "center", color: "#6b7280" }}><div style={{ fontSize: 40 }}>🏆</div><div style={{ fontSize: 14, fontWeight: 700, color: "#14532d" }}>ยังไม่มีข้อมูลจัดอันดับ</div><div style={{ fontSize: 12 }}>กรอกข้อมูลหรืออัปโหลดไฟล์ในหน้า Upload เพื่อเริ่มการจัดอันดับ</div></div> : sorted.map(b => {
        const val = mode === "score" ? b.score : mode === "carbon" ? b.co2 : b.elec;
        const pct = b.hasData ? Math.round((mode === "carbon" || mode === "energy" ? (maxVal - val) / maxVal : val / maxVal) * 100) : 0;
        const rankIdx = withData.indexOf(b);
        return (
          <button key={b.id} onClick={() => onBranchClick(branches.indexOf(b))} className="card" style={{ width: "100%", padding: 16, marginBottom: 10, display: "flex", alignItems: "center", gap: 14, cursor: "pointer", textAlign: "left" }}>
            <div style={{ fontSize: 28, fontWeight: 800, minWidth: 40, textAlign: "center", color: rankIdx === 0 ? "#f59e0b" : rankIdx === 1 ? "#94a3b8" : rankIdx === 2 ? "#b45309" : "#86efac" }}>{b.hasData && rankIdx < 3 ? ["🥇", "🥈", "🥉"][rankIdx] : b.hasData ? rankIdx + 1 : "—"}</div>
            <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 700, color: "#14532d" }}>{b.icon} {b.name}</div><div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>{b.hasData ? b.nameEn : "ยังไม่มีข้อมูล"}</div><div style={{ marginTop: 6, height: 6, background: "#f0fdf4", borderRadius: 6, overflow: "hidden" }}><div style={{ height: "100%", borderRadius: 6, background: "linear-gradient(90deg,#16a34a,#22c55e)", width: `${pct}%`, transition: "width 1s ease" }} /></div></div>
            <div style={{ textAlign: "right" }}><div style={{ fontSize: 22, fontWeight: 800, color: b.hasData ? "#166534" : "#6b7280" }}>{b.hasData ? val : "—"}</div><div style={{ fontSize: 9, color: "#6b7280" }}>{b.hasData ? unit : ""}</div></div>
          </button>
        );
      })}
      <SectionTitle style={{ marginTop: 8 }}>ESG Radar</SectionTitle>
      <div className="card" style={{ padding: 18 }}><div style={{ fontSize: 13, fontWeight: 700, color: "#14532d", marginBottom: 4 }}>ประสิทธิภาพรอบด้าน</div><div style={{ fontSize: 11, color: "#6b7280", marginBottom: 8 }}>Score · Efficiency · Reduction · ทุกสาขา</div><RadarChart branches={branches} /></div>
    </div>
  );
}

function PageReports({ branches, monthlyCo2, yearlyStats, entriesLog, showToast }) {
  const [selectedReport, setSelectedReport] = useState(null);
  const totals = branches.reduce((acc, b) => ({ co2: +(acc.co2 + b.co2).toFixed(4), entries: acc.entries + b.entries }), { co2: 0, entries: 0 });
  const credits = Math.round(totals.co2 * 2.4);
  const downloadReport = type => {
    const names = { esg: "Executive ESG Report", carbon: "Carbon Emission Report", tcfd: "TCFD Disclosure Report", monthly: "Monthly Sustainability Report", branch: "Branch Comparison Report" };
    const reportName = names[type] || "Sustainability Report";
    const stamp = new Date().toISOString().slice(0, 10);
    if (type === "monthly") {
      const csv = buildCsv([["Month", "tCO2e"], ...monthlyCo2.map((v, i) => [MONTHS[i], v])]);
      downloadBlob(`hillkoff-monthly-${stamp}.csv`, csv, "text/csv;charset=utf-8");
    } else {
      downloadBlob(`hillkoff-${type || "report"}-${stamp}.html`, createReportHtml({ title: reportName, totals, branches, monthlyCo2, yearlyStats, entriesLog }));
    }
    showToast(`✅ ดาวน์โหลด ${reportName} เรียบร้อย`);
  };
  const reports = [
    ["📊", "Executive ESG Report", "สรุปผลการดำเนินงาน ESG ประจำเดือน พร้อม KPI และ Carbon Summary", "PDF · Excel", "esg"],
    ["🌍", "Carbon Emission Report", "รายงาน Carbon Footprint รายสาขา พร้อม Scope 1, 2, 3", "PDF", "carbon"],
    ["🏛️", "TCFD Disclosure Report", "รายงานตามมาตรฐาน TCFD ครบทั้ง 4 เสาหลัก", "PDF · TCFD Ready", "tcfd"],
    ["📅", "Monthly Sustainability Report", "รายงานสรุปรายเดือน ค่าไฟ ค่าน้ำ เชื้อเพลิง และแนวโน้ม", "Excel", "monthly"],
    ["🏢", "Branch Comparison Report", "เปรียบเทียบประสิทธิภาพการใช้ทรัพยากรทุกสาขา", "PDF · Excel", "branch"]
  ];
  return (
    <div className="fade-up">
      <PageHeader title="📄 AI Reports" sub="TCFD · Carbon Credit · ESG Platform" />
      <SectionTitle>รายงานอัตโนมัติ · AI</SectionTitle>
      <div style={{ background: "linear-gradient(135deg,#0f4c2a,#166534)", borderRadius: 20, padding: 18, marginBottom: 12, position: "relative", overflow: "hidden" }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 4 }}>🤖 สร้าง ESG Report อัตโนมัติ</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,.65)", marginBottom: 14 }}>AI วิเคราะห์ข้อมูลทั้งหมดและสร้างรายงานพร้อมส่งผู้บริหาร</div>
        <button onClick={() => { showToast("🤖 AI กำลังวิเคราะห์..."); setTimeout(() => showToast("✅ ESG Report พร้อมแล้ว"), 1400); }} style={{ background: "rgba(255,255,255,.95)", color: "#166534", border: "none", borderRadius: 12, padding: "10px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>✨ สร้างรายงานทันที</button>
      </div>
      <div className="desktop-two">
        <div>
          <SectionTitle>TCFD Framework</SectionTitle>
          <div className="analytics-grid" style={{ marginBottom: 12 }}>
            {[["🏛️", "Governance", "การกำกับดูแลด้านสภาพภูมิอากาศ", "✓ 92%", "#15803d"], ["⚠️", "Risk & Opp.", "ความเสี่ยงและโอกาสด้านภูมิอากาศ", "● 74%", "#d97706"], ["🎯", "Strategy", "กลยุทธ์รับมือการเปลี่ยนแปลง", "✓ 88%", "#15803d"], ["📏", "Metrics", "ตัวชี้วัดและเป้าหมาย Net Zero", "✓ 95%", "#15803d"]].map(([icon, title, desc, score, col]) => <div key={title} className="card" style={{ padding: 12 }}><div style={{ fontSize: 18, marginBottom: 4 }}>{icon}</div><div style={{ fontSize: 11, fontWeight: 700, color: "#14532d" }}>{title}</div><div style={{ fontSize: 10, color: "#6b7280", lineHeight: 1.4 }}>{desc}</div><div style={{ fontSize: 16, fontWeight: 800, marginTop: 6, color: col }}>{score}</div></div>)}
          </div>
        </div>
        <div>
          <SectionTitle>Carbon Credit Platform</SectionTitle>
          <div style={{ background: "linear-gradient(135deg,#1e3a5f,#1d4ed8)", borderRadius: 20, padding: 18, marginBottom: 12, overflow: "hidden" }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,.6)" }}>Carbon Credits Available</div>
            <div style={{ fontSize: 40, fontWeight: 800, color: "#fff", margin: "4px 0" }}>{credits} <span style={{ fontSize: 16, opacity: .7 }}>tCO₂e</span></div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,.6)" }}>มูลค่าตลาดโดยประมาณ ฿ {(credits * 2000).toLocaleString()}</div>
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}><button onClick={() => showToast("💰 เชื่อมต่อ Carbon Credit Exchange...")} style={{ flex: 1, padding: 10, border: "none", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer", background: "rgba(255,255,255,.95)", color: "#1d4ed8" }}>🛒 ซื้อ Credits</button><button onClick={() => showToast("📈 ส่งคำสั่งขาย...")} style={{ flex: 1, padding: 10, border: "1px solid rgba(255,255,255,.3)", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer", background: "rgba(255,255,255,.15)", color: "#fff" }}>💸 ขาย Credits</button></div>
          </div>
        </div>
      </div>
      <SectionTitle>รายงานผู้บริหาร</SectionTitle>
      <div className="report-list">
        {reports.map(([icon, title, desc, badge, type]) => (
          <button key={type} onClick={() => setSelectedReport(type)} className="card" style={{ padding: 16, display: "flex", alignItems: "center", gap: 14, cursor: "pointer", textAlign: "left" }}>
            <span style={{ fontSize: 36 }}>{icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#14532d" }}>{title}</div>
              <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2, lineHeight: 1.5 }}>{desc}</div>
              <span style={{ fontSize: 9, fontWeight: 700, padding: "3px 9px", borderRadius: 8, background: "#f0fdf4", color: "#15803d", border: "1px solid #d1fae5", display: "inline-block", marginTop: 6 }}>{badge}</span>
            </div>
            <span style={{ fontSize: 22 }}>⬇️</span>
          </button>
        ))}
      </div>
      <button onClick={() => downloadReport("esg")} style={{ width: "100%", padding: 14, background: "linear-gradient(135deg,#166534,#16a34a)", color: "#fff", border: "none", borderRadius: 14, fontSize: 14, fontWeight: 700, cursor: "pointer", marginTop: 12 }}>🔄 สร้างรายงานทั้งหมด</button>
      <ReportDetailModal report={selectedReport ? REPORT_DETAILS[selectedReport] : null} totals={totals} onClose={() => setSelectedReport(null)} onDownload={() => downloadReport(selectedReport)} />
    </div>
  );
}

function PageSettings({ user, userProfile, loginHistory, entriesLog, onProfileChange }) {
  const [query, setQuery] = useState("");
  const documents = entriesLog.flatMap(entry => (entry.documents || []).map(doc => ({
    ...doc,
    month: entry.month,
    branchId: entry.branchId,
    branchName: BRANCHES_INIT.find(b => b.id === entry.branchId)?.name || entry.branchId
  })));
  const filteredDocs = documents.filter(doc => {
    const text = [doc.name, doc.source, doc.owner, doc.reference, doc.branchName, doc.month, doc.description].join(" ").toLowerCase();
    return text.includes(query.toLowerCase());
  });
  const filteredEntries = entriesLog.filter(entry => {
    const branchName = BRANCHES_INIT.find(b => b.id === entry.branchId)?.name || entry.branchId;
    const text = [branchName, entry.month, entry.note, ...(entry.materials || []).map(m => m.name)].join(" ").toLowerCase();
    return text.includes(query.toLowerCase());
  });

  return (
    <div className="fade-up">
      <PageHeader title="⚙️ Settings" sub="ข้อมูลผู้ใช้ · ประวัติล็อกอิน · ประวัติเอกสารและการคีย์ข้อมูล" />
      <FormCard title="👤 ข้อมูลผู้ใช้งาน" sub="ข้อมูลนี้ใช้ประกอบประวัติและรายงานภายในระบบ">
        <div className="form-grid-2" style={{ marginBottom: 10 }}>
          <FormGroup label="อีเมลล็อกอิน"><input className="input" value={user?.email || "-"} readOnly /></FormGroup>
          <FormGroup label="User ID"><input className="input" value={user?.id || "-"} readOnly /></FormGroup>
        </div>
        <div className="form-grid-2">
          <FormGroup label="ชื่อผู้ใช้งาน"><input className="input" value={userProfile.name || ""} onChange={e => onProfileChange({ ...userProfile, name: e.target.value })} placeholder="ชื่อ-นามสกุล" /></FormGroup>
          <FormGroup label="แผนก / บทบาท"><input className="input" value={userProfile.role || ""} onChange={e => onProfileChange({ ...userProfile, role: e.target.value })} placeholder="เช่น Sustainability / Admin" /></FormGroup>
        </div>
      </FormCard>

      <div className="card" style={{ padding: 12, marginBottom: 14 }}>
        <FormGroup label="ค้นหาด่วนเอกสาร / ประวัติการคีย์ข้อมูล">
          <input className="input" value={query} onChange={e => setQuery(e.target.value)} placeholder="ค้นหาชื่อไฟล์ แหล่งที่มา เลขอ้างอิง สาขา เดือน หรือวัสดุ" />
        </FormGroup>
      </div>

      <div className="desktop-two">
        <div>
          <SectionTitle>ประวัติการล็อกอิน</SectionTitle>
          {(loginHistory || []).slice(0, 12).map((item, i) => (
            <div key={`${item.at}-${i}`} className="card" style={{ padding: 12, marginBottom: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#14532d" }}>{item.email}</div>
              <div style={{ fontSize: 11, color: "#6b7280", marginTop: 3 }}>{new Date(item.at).toLocaleString()} · {item.userAgent || "browser"}</div>
            </div>
          ))}
          {(!loginHistory || loginHistory.length === 0) && <div className="card" style={{ padding: 18, fontSize: 12, color: "#6b7280" }}>ยังไม่มีประวัติล็อกอิน</div>}
        </div>

        <div>
          <SectionTitle>ประวัติการคีย์ข้อมูล</SectionTitle>
          {filteredEntries.slice(0, 12).map(entry => {
            const branchName = BRANCHES_INIT.find(b => b.id === entry.branchId)?.name || entry.branchId;
            return (
              <div key={entry.id} className="card" style={{ padding: 12, marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "#14532d" }}>{branchName} · {entry.month}</div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "#166534" }}>{entry.co2} tCO₂e</div>
                </div>
                <div style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}>ไฟฟ้า {entry.elec} kWh · น้ำ {entry.water} m³ · เชื้อเพลิง {entry.fuel} ลิตร · เอกสาร {(entry.documents || []).length} ไฟล์</div>
              </div>
            );
          })}
          {filteredEntries.length === 0 && <div className="card" style={{ padding: 18, fontSize: 12, color: "#6b7280" }}>ไม่พบประวัติการคีย์ข้อมูล</div>}
        </div>
      </div>

      <SectionTitle style={{ marginTop: 18 }}>ประวัติเอกสารและที่มา</SectionTitle>
      {filteredDocs.length === 0 ? <div className="card" style={{ padding: 18, fontSize: 12, color: "#6b7280" }}>ไม่พบเอกสารตามคำค้น</div> : filteredDocs.slice(0, 30).map(doc => (
        <div key={doc.id} className="card" style={{ padding: 14, marginBottom: 8 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <span style={{ fontSize: 24 }}>{({ xlsx: "📊", csv: "📋", pdf: "📄" })[doc.ext] || "📎"}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#14532d", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{doc.name}</div>
              <div style={{ fontSize: 11, color: "#6b7280", marginTop: 4, lineHeight: 1.6 }}>
                ที่มา: <b>{doc.source}</b> · ผู้ส่ง: <b>{doc.owner}</b> · อ้างอิง: <b>{doc.reference}</b><br />
                {doc.branchName} · {doc.month} · {doc.size} · อัปโหลด {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleString() : "-"}
              </div>
              {doc.description && <div style={{ fontSize: 11, color: "#166534", marginTop: 5 }}>{doc.description}</div>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const router = useRouter();
  const [authLoading, setAuthLoading] = useState(true);
  const [page, setPage] = useState("home");
  const [branches, setBranches] = useState(emptyBranches);
  const [monthlyCo2, setMonthlyCo2] = useState(Array(12).fill(0));
  const [yearlyStats, setYearlyStats] = useState({});
  const [entriesLog, setEntriesLog] = useState([]);
  const [loginHistory, setLoginHistory] = useState([]);
  const [userProfile, setUserProfile] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [dashboardLoaded, setDashboardLoaded] = useState(false);
  const [modalBranchIdx, setModalBranchIdx] = useState(null);
  const [toast, setToast] = useState({ msg: "", show: false });
  const [aiOpen, setAiOpen] = useState(false);
  const toastTimer = useRef(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session) {
        router.replace("/login");
        router.refresh();
        return;
      }

      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        await supabase.auth.signOut();
        router.replace("/login");
        router.refresh();
        return;
      }

      setCurrentUser(data.user);
      const localState = normalizeDashboardState(readLocalDashboardState(data.user.id));
      setBranches(localState.branches);
      setMonthlyCo2(localState.monthlyCo2);
      setYearlyStats(localState.yearlyStats);
      setEntriesLog(localState.entriesLog);
      setLoginHistory(localState.loginHistory);
      setUserProfile({ email: data.user.email, ...localState.userProfile });

      try {
        const response = await fetch("/api/dashboard", { cache: "no-store" });
        const saved = await response.json();
        if (response.ok && saved?.data) {
          const normalized = chooseNewestDashboardState(localState, normalizeDashboardState(saved.data));
          setBranches(normalized.branches);
          setMonthlyCo2(normalized.monthlyCo2);
          setYearlyStats(normalized.yearlyStats);
          setEntriesLog(normalized.entriesLog);
          setLoginHistory([{ at: new Date().toISOString(), email: data.user.email, userId: data.user.id, userAgent: navigator.userAgent }, ...normalized.loginHistory].slice(0, 50));
          setUserProfile({ email: data.user.email, ...normalized.userProfile });
        } else {
          setLoginHistory([{ at: new Date().toISOString(), email: data.user.email, userId: data.user.id, userAgent: navigator.userAgent }, ...localState.loginHistory].slice(0, 50));
          setUserProfile({ email: data.user.email, ...localState.userProfile });
        }
      } catch (error) {
        console.warn("Dashboard load failed:", error);
        setLoginHistory([{ at: new Date().toISOString(), email: data.user.email, userId: data.user.id, userAgent: navigator.userAgent }, ...localState.loginHistory].slice(0, 50));
        setUserProfile({ email: data.user.email, ...localState.userProfile });
      } finally {
        setDashboardLoaded(true);
      }

      setAuthLoading(false);
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    if (!dashboardLoaded) return;
    const snapshot = { branches, monthlyCo2, yearlyStats, entriesLog, loginHistory, userProfile };
    writeLocalDashboardState(currentUser?.id, snapshot);
    const timer = setTimeout(async () => {
      try {
        await fetch("/api/dashboard", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(snapshot)
        });
      } catch (error) {
        console.warn("Dashboard save failed:", error);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [branches, monthlyCo2, yearlyStats, entriesLog, loginHistory, userProfile, dashboardLoaded, currentUser]);

  const showToast = useCallback(msg => {
    setToast({ msg, show: true });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(t => ({ ...t, show: false })), 2500);
  }, []);

  const handleSave = useCallback(({ branchId, month, elec, water, fuel, co2Total, wGen, wRec, wOrg, wHaz, recycleRate, materials = [], documents = [], note = "" }) => {
    setBranches(prev => prev.map(b => {
      if (b.id !== branchId) return b;
      const newCo2 = +(b.co2 + co2Total).toFixed(4);
      const newEntries = b.entries + 1;
      const co2PerEntry = newCo2 / newEntries;
      const baseScore = Math.min(100, Math.round(50 + parseFloat(recycleRate) * 0.5 - co2PerEntry * 10));
      const score = Math.max(1, Math.min(100, baseScore));
      return {
        ...b,
        elec: b.elec + elec,
        water: b.water + water,
        fuel: b.fuel + fuel,
        co2: newCo2,
        entries: newEntries,
        hasData: true,
        waste: { general: b.waste.general + wGen, recycle: b.waste.recycle + wRec, organic: b.waste.organic + wOrg, hazard: b.waste.hazard + wHaz },
        score,
        status: score >= 85 ? "excellent" : score >= 70 ? "good" : "fair"
      };
    }));
    const monthIdx = month ? parseInt(month.split("-")[1], 10) - 1 : new Date().getMonth();
    setMonthlyCo2(prev => {
      const c = [...prev];
      c[monthIdx] = +(c[monthIdx] + co2Total).toFixed(4);
      return c;
    });
    const year = month ? month.split("-")[0] : String(new Date().getFullYear());
    setYearlyStats(prev => {
      const current = prev[year] || { co2: 0, elec: 0, water: 0, fuel: 0, entries: 0 };
      return {
        ...prev,
        [year]: {
          co2: +(current.co2 + co2Total).toFixed(4),
          elec: current.elec + elec,
          water: current.water + water,
          fuel: current.fuel + fuel,
          entries: current.entries + 1
        }
      };
    });
    setEntriesLog(prev => [...prev, {
      id: `${Date.now()}-${branchId}`,
      branchId,
      month,
      elec,
      water,
      fuel,
      co2: co2Total,
      waste: { general: wGen, recycle: wRec, organic: wOrg, hazard: wHaz },
      materials,
      documents,
      note,
      user: { id: currentUser?.id, email: currentUser?.email },
      createdAt: new Date().toISOString()
    }]);
    const bn = BRANCHES_INIT.find(b => b.id === branchId)?.name || branchId;
    showToast(`✅ อัปเดตข้อมูล ${bn} เรียบร้อย`);
  }, [showToast, currentUser]);

  const navItems = [
    { id: "home", icon: "🏠", label: "หน้าหลัก" },
    { id: "upload", icon: "📤", label: "Upload" },
    { id: "analytics", icon: "📊", label: "Analytics" },
    { id: "ranking", icon: "🏆", label: "Ranking" },
    { id: "reports", icon: "📄", label: "Reports" },
    { id: "settings", icon: "⚙️", label: "Settings" }
  ];

  if (authLoading) {
    return (
      <>
        <style>{css}</style>
        <div className="app-shell">
          <div className="page-container" style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
            <div style={{ color: "#166534", fontWeight: 700 }}>Loading...</div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{css}</style>
      <div className="app-shell">
        <div className="page-container">
          {page === "home" && <PageHome branches={branches} monthlyCo2={monthlyCo2} onBranchClick={i => setModalBranchIdx(i)} onGoUpload={() => setPage("upload")} />}
          {page === "upload" && <PageUpload branches={branches} onSave={handleSave} showToast={showToast} />}
          {page === "analytics" && <PageAnalytics branches={branches} monthlyCo2={monthlyCo2} entriesLog={entriesLog} />}
          {page === "ranking" && <PageRanking branches={branches} onBranchClick={i => setModalBranchIdx(i)} />}
          {page === "reports" && <PageReports branches={branches} monthlyCo2={monthlyCo2} yearlyStats={yearlyStats} entriesLog={entriesLog} showToast={showToast} />}
          {page === "settings" && <PageSettings user={currentUser} userProfile={userProfile} loginHistory={loginHistory} entriesLog={entriesLog} onProfileChange={setUserProfile} />}
        </div>
      </div>

      <nav className="bottom-nav">
        {navItems.map(({ id, icon, label }) => (
          <button key={id} onClick={() => setPage(id)} className={`nav-btn ${page === id ? "active" : ""}`}>
            <span style={{ fontSize: 20, lineHeight: 1 }}>{icon}</span>
            <span style={{ fontSize: 9, fontWeight: page === id ? 700 : 500 }}>{label}</span>
          </button>
        ))}
      </nav>

      <AIPanel open={aiOpen} onToggle={() => setAiOpen(p => !p)} branches={branches} />
      {modalBranchIdx !== null && <BranchModal b={branches[modalBranchIdx]} onClose={() => setModalBranchIdx(null)} onGoUpload={() => setPage("upload")} />}
      <Toast msg={toast.msg} show={toast.show} />
    </>
  );
}
