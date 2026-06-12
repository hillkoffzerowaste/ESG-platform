"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { getFirebaseAuth, toAppUser } from "@/lib/firebase";
import { hasOtpClaim } from "@/lib/otpClient";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { calculateCFO, quickCalc } from "@/lib/cfoCalculator";
import { STATIONARY_FUEL_TYPES, VEHICLE_CATEGORIES, REFRIGERANT_TYPES, GRID_AREA_OPTIONS, MONTHS_TH, WASTEWATER_METHOD_OPTIONS, TGO_FORMS, createEmptyEntry, createStationaryRow, createMobileRow, createRefrigerantRow, validateEntry } from "@/lib/cfoForms";
import { COMMON_FUELS } from "@/lib/tgoFactors";
import { KNOWLEDGE_MODULES, TOOLTIPS, KPI_DEFINITIONS, BENEFICIARY_STATEMENT, CERTIFICATION_BADGES } from "@/lib/knowledgeBase";
import { calcCombined, calcSolar, calcEV, calcLED, calcFoodWaste } from "@/lib/benefitCalculator";

// ─── Tooltip Component ──────────────────────────────────────────────
function InfoTip({ tipKey, children }) {
  const tip = TOOLTIPS[tipKey] || children;
  return (
    <span className="tooltip-trigger">
      ❔
      <span className="tooltip-popup">{tip}</span>
    </span>
  );
}

// ─── Gamification Bar ──────────────────────────────────────────────
function GamificationBar({ entry }) {
  const hasStationary = (entry.stationaryCombustion || []).length > 0;
  const hasMobile = (entry.mobileCombustion || []).length > 0;
  const hasFugitive = (entry.fugitiveEmissions?.refrigerants || []).length > 0;
  const hasScope1 = hasStationary || hasMobile || hasFugitive;
  const hasScope2 = (entry.purchasedElectricity?.monthlyKwh || []).some(k => Number(k) > 0);
  const hasWaste = Object.values(entry.wasteGeneration || {}).some(v => Number(v) > 0);
  const hasScope3 = hasWaste || (entry.wastewater?.volumeM3 > 0);
  const hasExport = false; // tracked separately
  const hasBaseYear = !!entry.baseYear;

  const badges = [
    { id: 'beginner', icon: '🏅', earned: hasScope1 || hasScope2, title: 'CFO Beginner' },
    { id: 'collector', icon: '🥈', earned: hasScope1 && hasScope2 && hasScope3, title: 'Data Collector' },
    { id: 'target', icon: '🎯', earned: hasBaseYear, title: 'Goal Setter' },
    { id: 'netzero', icon: '💎', earned: hasBaseYear && (hasScope1 || hasScope2), title: 'Net Zero Hero' },
  ];
  const earnedCount = badges.filter(b => b.earned).length;
  const progress = Math.round((earnedCount / badges.length) * 100);

  return (
    <div className="gamification-bar" style={{ marginBottom: 12 }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", marginBottom: 4 }}>
          🌱 ความก้าวหน้า: {progress}%
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>
      <div className="gamification-badges">
        {badges.map(b => (
          <div key={b.id} className={b.earned ? "badge-earned" : "badge-locked"} title={b.title}>
            {b.icon}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Certification Badges ──────────────────────────────────────────
function CertBadges() {
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
      {CERTIFICATION_BADGES.map((b, i) => (
        <span key={i} className="badge" style={{ background: "#f0fdf4", border: "1px solid #d1fae5", fontSize: 10, padding: "4px 10px" }}>
          {b.icon} {b.name}
        </span>
      ))}
    </div>
  );
}

// ─── KPI Definition Card ──────────────────────────────────────────
function KPIDefinitionCard({ kpi }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card" style={{ padding: 14, marginBottom: 8, cursor: "pointer" }} onClick={() => setOpen(!open)}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#14532d" }}>{kpi.icon} {kpi.label}</span>
        <span style={{ fontSize: 11, color: "#6b7280" }}>{open ? "▲ ปิด" : "▼ ดูรายละเอียด"}</span>
      </div>
      <div style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}>{kpi.meaning}</div>
      {open && (
        <div style={{ marginTop: 10, fontSize: 12, lineHeight: 1.8, color: "#374151", borderTop: "1px solid #d1fae5", paddingTop: 10 }}>
          <div><b>สูตร:</b> {kpi.formula}</div>
          <div><b>เป้าหมาย:</b> {kpi.target}</div>
          {kpi.benchmark && <div><b>เทียบกับ:</b> {kpi.benchmark}</div>}
          <div><b>วิธีปรับปรุง:</b></div>
          <ul style={{ margin: "4px 0 0 16px", padding: 0 }}>
            {kpi.howToImprove.map((tip, i) => <li key={i} style={{ fontSize: 12 }}>{tip}</li>)}
          </ul>
          <div style={{ marginTop: 6, padding: 8, background: "#f0fdf4", borderRadius: 8, fontSize: 11, color: "#166534" }}>
            🌿 {kpi.environmentalImpact}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Helpers ───────────────────────────────────────────────────────
const toNumber = v => { const n = Number(v); return Number.isFinite(n) && n >= 0 ? n : 0; };
const numFmt = n => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
const round = (v, d = 4) => { const n = Number(v); return Number.isFinite(n) ? Number(n.toFixed(d)) : 0; };

// ─── Header ────────────────────────────────────────────────────────
function Header({ user, onLogout }) {
  return (
    <div style={{ background: "linear-gradient(135deg,#0f4c2a,#166534)", padding: "16px 20px", borderRadius: "0 0 24px 24px", marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, maxWidth: 960, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 40, height: 40, background: "rgba(255,255,255,.15)", borderRadius: 12, display: "grid", placeItems: "center", fontSize: 22, border: "1px solid rgba(255,255,255,.2)" }}>🌱</div>
          <div>
            <div style={{ color: "#fff", fontSize: 16, fontWeight: 800, lineHeight: 1.2 }}>Hillkoff CFO</div>
            <div style={{ color: "rgba(255,255,255,.7)", fontSize: 11 }}>Carbon Footprint Organization</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ color: "rgba(255,255,255,.7)", fontSize: 12 }}>{user?.email || ""}</span>
          <button onClick={onLogout} className="btn btn-sm" style={{ background: "rgba(255,255,255,.15)", color: "#fff", border: "1px solid rgba(255,255,255,.25)" }}>ออกจากระบบ</button>
        </div>
      </div>
    </div>
  );
}

// ─── Toast ─────────────────────────────────────────────────────────
function Toast({ msg, show, type = "success" }) {
  const bg = type === "error" ? "#dc2626" : type === "warning" ? "#d97706" : "#0f4c2a";
  return (
    <div style={{ position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", background: bg, color: "#fff", padding: "10px 24px", borderRadius: 20, fontSize: 13, fontWeight: 500, zIndex: 300, boxShadow: "0 8px 40px rgba(22,101,52,.14)", opacity: show ? 1 : 0, transition: "opacity .25s", pointerEvents: "none" }}>
      {msg}
    </div>
  );
}

// ─── Tab: ข้อมูลองค์กร (Fr-01) ─────────────────────────────────────
function OrgInfoTab({ entry, setEntry }) {
  const org = entry.orgInfo || {};
  const setOrg = (updates) => setEntry(e => ({ ...e, orgInfo: { ...e.orgInfo, ...updates } }));

  return (
    <div>
      <div className="section-title">🏢 ข้อมูลองค์กร (แบบฟอร์ม Fr-01)</div>
      <div className="card" style={{ padding: 20 }}>
        <div className="grid-2">
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280" }}>ชื่อองค์กร *</label>
            <input className="input" value={org.orgName || ""} onChange={e => setOrg({ orgName: e.target.value })} placeholder="บริษัท ฮิลล์คอฟฟ์ จำกัด" />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280" }}>ปีที่รายงาน (พ.ศ.) *</label>
            <input className="input" type="number" value={entry.reportingYear || ""} onChange={e => setEntry(prev => ({ ...prev, reportingYear: parseInt(e.target.value) || 0 }))} placeholder="2569" />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280" }}>วันเริ่มต้นรอบบัญชี</label>
            <input className="input" type="date" value={org.startDate || ""} onChange={e => setOrg({ startDate: e.target.value })} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280" }}>วันสิ้นสุดรอบบัญชี</label>
            <input className="input" type="date" value={org.endDate || ""} onChange={e => setOrg({ endDate: e.target.value })} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280" }}>วิธีการกำหนดขอบเขต *</label>
            <select className="select" value={org.boundaryMethod || "control"} onChange={e => setOrg({ boundaryMethod: e.target.value })}>
              <option value="control">Control Approach (อำนาจควบคุม)</option>
              <option value="equityShare">Equity Share Approach (ส่วนแบ่งทุน)</option>
            </select>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280" }}>ผู้รับผิดชอบข้อมูล *</label>
            <input className="input" value={org.responsiblePerson || ""} onChange={e => setOrg({ responsiblePerson: e.target.value })} placeholder="ชื่อ-นามสกุล" />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280" }}>อีเมลผู้ติดต่อ *</label>
            <input className="input" type="email" value={org.responsibleEmail || ""} onChange={e => setOrg({ responsibleEmail: e.target.value })} placeholder="email@hillkoff.com" />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280" }}>โทรศัพท์</label>
            <input className="input" value={org.responsiblePhone || ""} onChange={e => setOrg({ responsiblePhone: e.target.value })} placeholder="02-xxx-xxxx" />
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280" }}>ลักษณะกิจการโดยย่อ</label>
          <textarea className="textarea" value={org.orgDescription || ""} onChange={e => setOrg({ orgDescription: e.target.value })} placeholder="เช่น ธุรกิจคั่วและจำหน่ายกาแฟ..." rows={3} />
        </div>
      </div>

      <div className="section-title">📄 แบบฟอร์มอ้างอิง อบก.</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 8, marginBottom: 16 }}>
        {Object.entries(TGO_FORMS).map(([key, f]) => (
          <div key={key} className="card" style={{ padding: "10px 14px" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#15803d" }}>{key}</div>
            <div style={{ fontSize: 11, color: "#374151" }}>{f.name}</div>
            <div style={{ fontSize: 9, color: "#6b7280" }}>v{f.version}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Tab: Scope 1 (Fr-03.1 + Fr-03.2) ─────────────────────────────
function Scope1Tab({ entry, setEntry }) {
  const addStationary = () => setEntry(e => ({ ...e, stationaryCombustion: [...(e.stationaryCombustion || []), { fuelType: "diesel", quantity: 0 }] }));
  const updateStationary = (i, updates) => setEntry(e => {
    const arr = [...(e.stationaryCombustion || [])];
    arr[i] = { ...arr[i], ...updates };
    return { ...e, stationaryCombustion: arr };
  });
  const removeStationary = (i) => setEntry(e => ({ ...e, stationaryCombustion: (e.stationaryCombustion || []).filter((_, j) => j !== i) }));

  const addMobile = () => setEntry(e => ({ ...e, mobileCombustion: [...(e.mobileCombustion || []), { vehicleType: "pickup_diesel", distanceKm: 0, fuelQuantity: 0, fuelType: "diesel", count: 1 }] }));
  const updateMobile = (i, updates) => setEntry(e => {
    const arr = [...(e.mobileCombustion || [])];
    arr[i] = { ...arr[i], ...updates };
    return { ...e, mobileCombustion: arr };
  });
  const removeMobile = (i) => setEntry(e => ({ ...e, mobileCombustion: (e.mobileCombustion || []).filter((_, j) => j !== i) }));

  const addRefrigerant = () => setEntry(e => ({ ...e, fugitiveEmissions: { ...e.fugitiveEmissions, refrigerants: [...(e.fugitiveEmissions?.refrigerants || []), { refrigerantId: "r_410a", leakKg: 0 }] } }));
  const updateRefrigerant = (i, updates) => setEntry(e => {
    const arr = [...(e.fugitiveEmissions?.refrigerants || [])];
    arr[i] = { ...arr[i], ...updates };
    return { ...e, fugitiveEmissions: { ...e.fugitiveEmissions, refrigerants: arr } };
  });
  const removeRefrigerant = (i) => setEntry(e => ({
    ...e,
    fugitiveEmissions: { ...e.fugitiveEmissions, refrigerants: (e.fugitiveEmissions?.refrigerants || []).filter((_, j) => j !== i) }
  }));

  // Calculate quick preview
  const calcResult = useMemo(() => {
    if (!entry) return null;
    try {
      return calculateCFO(entry);
    } catch { return null; }
  }, [entry]);

  return (
    <div>
      {/* Stationary Combustion */}
      <div className="section-title">🔥 Fr-03.1: Stationary Combustion (การเผาไหม้ที่อยู่กับที่)</div>
      <div className="card" style={{ padding: 16, marginBottom: 16 }}>
        {(entry.stationaryCombustion || []).length === 0 && (
          <div style={{ textAlign: "center", padding: 24, color: "#6b7280", fontSize: 13 }}>
            ยังไม่มีข้อมูล — กด "เพิ่มเชื้อเพลิง" เพื่อเริ่มกรอก
          </div>
        )}
        {(entry.stationaryCombustion || []).map((fuel, i) => {
          const ef = COMMON_FUELS[fuel.fuelType];
          const co2 = round(toNumber(fuel.quantity) * (ef?.ef || 0));
          return (
            <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-end", marginBottom: 8, flexWrap: "wrap" }}>
              <select className="select" style={{ flex: 1, minWidth: 140 }} value={fuel.fuelType} onChange={e => updateStationary(i, { fuelType: e.target.value })}>
                {Object.entries(STATIONARY_FUEL_TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
              <input className="input" type="number" style={{ width: 100 }} value={fuel.quantity || ""} onChange={e => updateStationary(i, { quantity: toNumber(e.target.value) })} placeholder="0" min="0" />
              <span style={{ fontSize: 11, color: "#6b7280", whiteSpace: "nowrap", minWidth: 50 }}>{ef?.unit || ""}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: co2 > 0 ? "#166534" : "#6b7280", minWidth: 80, textAlign: "right" }}>{co2 > 0 ? `${round(co2, 2)} kgCO₂e` : "—"}</span>
              <button onClick={() => removeStationary(i)} style={{ width: 28, height: 28, border: "none", borderRadius: 8, background: "#fee2e2", color: "#b91c1c", cursor: "pointer", fontSize: 14 }}>✕</button>
            </div>
          );
        })}
        <button onClick={addStationary} className="btn btn-sm btn-secondary" style={{ marginTop: 8 }}>➕ เพิ่มเชื้อเพลิง</button>
      </div>

      {/* Mobile Combustion */}
      <div className="section-title">🚛 Fr-03.2: Mobile Combustion (ยานพาหนะ)</div>
      <div className="card" style={{ padding: 16, marginBottom: 16 }}>
        {(entry.mobileCombustion || []).length === 0 && (
          <div style={{ textAlign: "center", padding: 24, color: "#6b7280", fontSize: 13 }}>
            ยังไม่มีข้อมูล — กด "เพิ่มยานพาหนะ" เพื่อเริ่มกรอก
          </div>
        )}
        {(entry.mobileCombustion || []).map((v, i) => {
          const cat = VEHICLE_CATEGORIES.find(c => c.id === v.vehicleType);
          const ef = COMMON_FUELS[v.fuelType]?.ef || 2.6993;
          const co2 = round((toNumber(v.fuelQuantity) || 0) * ef);
          return (
            <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-end", marginBottom: 8, flexWrap: "wrap" }}>
              <select className="select" style={{ flex: 1, minWidth: 140 }} value={v.vehicleType} onChange={e => updateMobile(i, { vehicleType: e.target.value })}>
                {VEHICLE_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <span style={{ fontSize: 9, color: "#6b7280" }}>ระยะทาง (กม.)</span>
                <input className="input" type="number" style={{ width: 90 }} value={v.distanceKm || ""} onChange={e => updateMobile(i, { distanceKm: toNumber(e.target.value) })} placeholder="0" />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <span style={{ fontSize: 9, color: "#6b7280" }}>เชื้อเพลิง (ลิตร)</span>
                <input className="input" type="number" style={{ width: 90 }} value={v.fuelQuantity || ""} onChange={e => updateMobile(i, { fuelQuantity: toNumber(e.target.value) })} placeholder="0" />
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: co2 > 0 ? "#166534" : "#6b7280", minWidth: 80, textAlign: "right" }}>{co2 > 0 ? `${round(co2, 2)} kgCO₂e` : "—"}</span>
              <button onClick={() => removeMobile(i)} style={{ width: 28, height: 28, border: "none", borderRadius: 8, background: "#fee2e2", color: "#b91c1c", cursor: "pointer", fontSize: 14 }}>✕</button>
            </div>
          );
        })}
        <button onClick={addMobile} className="btn btn-sm btn-secondary" style={{ marginTop: 8 }}>➕ เพิ่มยานพาหนะ</button>
      </div>

      {/* Fugitive Emissions */}
      <div className="section-title">🧊 Fr-03.2: Fugitive Emissions (สารทำความเย็น)</div>
      <div className="card" style={{ padding: 16, marginBottom: 16 }}>
        <details>
          <summary style={{ fontSize: 12, fontWeight: 700, color: "#166534", cursor: "pointer" }}>แสดงส่วนสารทำความเย็น (ถ้ามี)</summary>
          <div style={{ marginTop: 12 }}>
            {(entry.fugitiveEmissions?.refrigerants || []).map((ref, i) => {
              const info = REFRIGERANT_TYPES.find(r => r.id === ref.refrigerantId);
              const co2 = round(toNumber(ref.leakKg) * (info?.gwp || 0));
              return (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-end", marginBottom: 8, flexWrap: "wrap" }}>
                  <select className="select" style={{ flex: 1, minWidth: 140 }} value={ref.refrigerantId} onChange={e => updateRefrigerant(i, { refrigerantId: e.target.value })}>
                    {REFRIGERANT_TYPES.map(r => <option key={r.id} value={r.id}>{r.label} (GWP={r.gwp})</option>)}
                  </select>
                  <input className="input" type="number" style={{ width: 100 }} value={ref.leakKg || ""} onChange={e => updateRefrigerant(i, { leakKg: toNumber(e.target.value) })} placeholder="0" min="0" />
                  <span style={{ fontSize: 11, color: "#6b7280" }}>kg</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: co2 > 0 ? "#166534" : "#6b7280", minWidth: 80, textAlign: "right" }}>{co2 > 0 ? `${round(co2, 2)} kgCO₂e` : "—"}</span>
                  <button onClick={() => removeRefrigerant(i)} style={{ width: 28, height: 28, border: "none", borderRadius: 8, background: "#fee2e2", color: "#b91c1c", cursor: "pointer", fontSize: 14 }}>✕</button>
                </div>
              );
            })}
            <button onClick={addRefrigerant} className="btn btn-sm btn-secondary" style={{ marginTop: 8 }}>➕ เพิ่มสารทำความเย็น</button>
            
            <div style={{ marginTop: 12 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280" }}>ถังดับเพลิง CO₂ (กก.)</label>
              <input className="input" type="number" style={{ width: 120 }} value={entry.fugitiveEmissions?.co2ExtinguisherKg || ""} onChange={e => setEntry(prev => ({ ...prev, fugitiveEmissions: { ...prev.fugitiveEmissions, co2ExtinguisherKg: toNumber(e.target.value) } }))} placeholder="0" min="0" />
            </div>
          </div>
        </details>
      </div>

      {/* Scope 1 Summary */}
      {calcResult && (calcResult.scope1.total > 0) && (
        <div className="card" style={{ padding: 14, background: "#f0fdf4", border: "1px solid #bbf7d0", marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#166534", marginBottom: 8 }}>📊 Scope 1 รวม: {round(calcResult.scope1.totalTonne, 4)} tCO₂e ({round(calcResult.scope1.total)} kgCO₂e)</div>
          <div style={{ fontSize: 11, color: "#374151" }}>
            {calcResult.scope1.stationary.total > 0 && <div>🔥 Stationary: {round(calcResult.scope1.stationary.total, 2)} kgCO₂e</div>}
            {calcResult.scope1.mobile.total > 0 && <div>🚛 Mobile: {round(calcResult.scope1.mobile.total, 2)} kgCO₂e</div>}
            {calcResult.scope1.fugitive.total > 0 && <div>🧊 Fugitive: {round(calcResult.scope1.fugitive.total, 2)} kgCO₂e</div>}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tab: Scope 2 (Fr-04.1) ──────────────────────────────────────
function Scope2Tab({ entry, setEntry }) {
  const elec = entry.purchasedElectricity || { monthlyKwh: Array(12).fill(0), gridArea: "MEA" };
  const totalKwh = (elec.monthlyKwh || []).reduce((a, b) => a + toNumber(b), 0);
  const co2 = round(totalKwh * 0.4999);
  const co2t = round(co2 * 0.001, 4);

  return (
    <div>
      <div className="section-title">⚡ Fr-04.1: Purchased Electricity (ไฟฟ้าที่ซื้อมา)</div>
      <div className="card" style={{ padding: 20 }}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280" }}>พื้นที่ให้บริการไฟฟ้า</label>
          <select className="select" style={{ maxWidth: 300 }} value={elec.gridArea || "MEA"} onChange={e => setEntry(prev => ({ ...prev, purchasedElectricity: { ...prev.purchasedElectricity, gridArea: e.target.value } }))}>
            {GRID_AREA_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 8 }}>
          {MONTHS_TH.map((m, i) => (
            <div key={m} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: "#6b7280" }}>{m}</span>
              <input className="input" type="number" value={elec.monthlyKwh?.[i] || ""} onChange={e => {
                const arr = [...(elec.monthlyKwh || Array(12).fill(0))];
                arr[i] = toNumber(e.target.value);
                setEntry(prev => ({ ...prev, purchasedElectricity: { ...prev.purchasedElectricity, monthlyKwh: arr } }));
              }} placeholder="0" min="0" style={{ padding: "8px 10px", fontSize: 12 }} />
            </div>
          ))}
        </div>
        <div style={{ marginTop: 16, padding: 14, background: "#f0fdf4", borderRadius: 12, border: "1px solid #bbf7d0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <span style={{ fontSize: 13, color: "#374151" }}>รวม kWh ทั้งปี: <b>{totalKwh.toLocaleString()}</b> kWh</span>
            <span style={{ fontSize: 13, color: "#374151" }}>Emission Factor: <b>0.4999</b> kgCO₂e/kWh</span>
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#166534", textAlign: "center", marginTop: 8 }}>
            = {co2} kgCO₂e ({co2t} tCO₂e)
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Scope 3 (Fr-05) ────────────────────────────────────────
function Scope3Tab({ entry, setEntry }) {
  const waste = entry.wasteGeneration || {};
  const setWaste = (updates) => setEntry(e => ({ ...e, wasteGeneration: { ...e.wasteGeneration, ...updates } }));
  const ww = entry.wastewater || {};
  const setWW = (updates) => setEntry(e => ({ ...e, wastewater: { ...e.wastewater, ...updates } }));

  const wasteCo2 = round(
    toNumber(waste.landfillKg || 0) * 0.45 +
    toNumber(waste.incinerationKg || 0) * 0.65
  );
  const wwEF = { septic: 0.045, aerobic: 0.123, anaerobic: 0.456, none: 0.341 };
  const wwCo2 = round(toNumber(ww.volumeM3 || 0) * (wwEF[ww.treatmentMethod] || 0.045));
  const totalCo2 = round(wasteCo2 + wwCo2);

  return (
    <div>
      <div className="section-title">♻️ Fr-05: Waste Generation (ขยะ)</div>
      <div className="card" style={{ padding: 20, marginBottom: 16 }}>
        <div className="grid-2">
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280" }}>ขยะทั่วไปฝังกลบ (กก.)</label>
            <input className="input" type="number" value={waste.landfillKg || ""} onChange={e => setWaste({ landfillKg: toNumber(e.target.value) })} placeholder="0" />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280" }}>ขยะรีไซเคิล (กก.)</label>
            <input className="input" type="number" value={waste.recycleKg || ""} onChange={e => setWaste({ recycleKg: toNumber(e.target.value) })} placeholder="0" />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280" }}>ขยะอินทรีย์ทำปุ๋ย (กก.)</label>
            <input className="input" type="number" value={waste.organicKg || ""} onChange={e => setWaste({ organicKg: toNumber(e.target.value) })} placeholder="0" />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280" }}>ขยะเผา (กก.)</label>
            <input className="input" type="number" value={waste.incinerationKg || ""} onChange={e => setWaste({ incinerationKg: toNumber(e.target.value) })} placeholder="0" />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280" }}>ขยะอันตราย (กก.)</label>
            <input className="input" type="number" value={waste.hazardKg || ""} onChange={e => setWaste({ hazardKg: toNumber(e.target.value) })} placeholder="0" />
          </div>
        </div>
        {wasteCo2 > 0 && (
          <div style={{ marginTop: 10, padding: 10, background: "#f0fdf4", borderRadius: 10, fontSize: 12, fontWeight: 700, color: "#166534" }}>
            CO₂ จากขยะ: {wasteCo2} kgCO₂e
          </div>
        )}
      </div>

      <div className="section-title">💧 Fr-05: Wastewater (น้ำเสีย)</div>
      <div className="card" style={{ padding: 20 }}>
        <div className="grid-2">
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280" }}>ปริมาณน้ำเสีย (ลบ.ม./ปี)</label>
            <input className="input" type="number" value={ww.volumeM3 || ""} onChange={e => setWW({ volumeM3: toNumber(e.target.value) })} placeholder="0" />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280" }}>วิธีบำบัด</label>
            <select className="select" value={ww.treatmentMethod || "septic"} onChange={e => setWW({ treatmentMethod: e.target.value })}>
              {WASTEWATER_METHOD_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>
        {wwCo2 > 0 && (
          <div style={{ marginTop: 10, padding: 10, background: "#f0fdf4", borderRadius: 10, fontSize: 12, fontWeight: 700, color: "#166534" }}>
            CO₂ จากน้ำเสีย: {wwCo2} kgCO₂e
          </div>
        )}
      </div>

      {totalCo2 > 0 && (
        <div className="card" style={{ padding: 14, background: "#f0fdf4", border: "1px solid #bbf7d0", marginTop: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#166534", textAlign: "center" }}>
            ♻️ Scope 3 รวม: {round(totalCo2 * 0.001, 4)} tCO₂e ({totalCo2} kgCO₂e)
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tab: สรุป CFO ───────────────────────────────────────────────
function SummaryTab({ entry, onSave, showToast }) {
  const result = useMemo(() => {
    if (!entry) return null;
    try { return calculateCFO(entry); } catch { return null; }
  }, [entry]);

  const { valid, errors } = useMemo(() => validateEntry(entry), [entry]);

  const exportReport = () => {
    if (!result) return;
    const rows = [
      ["Hillkoff Carbon Footprint Organization Report"],
      ["Generated", new Date().toLocaleString()],
      ["Organization", entry.orgInfo?.orgName || "-"],
      ["Reporting Year", entry.reportingYear || "-"],
      [""],
      ["Scope", "kgCO2e", "tCO2e"],
      ["Scope 1 - Stationary", round(result.scope1.stationary.total), round(result.scope1.stationary.total * 0.001, 4)],
    ];
    if (result.scope1.mobile.total > 0) rows.push(["Scope 1 - Mobile", round(result.scope1.mobile.total), round(result.scope1.mobile.total * 0.001, 4)]);
    if (result.scope1.fugitive.total > 0) rows.push(["Scope 1 - Fugitive", round(result.scope1.fugitive.total), round(result.scope1.fugitive.total * 0.001, 4)]);
    rows.push(["Scope 1 Total", round(result.scope1.total), round(result.scope1.totalTonne, 4)]);
    rows.push(["Scope 2 - Electricity", round(result.scope2.total), round(result.scope2.total * 0.001, 4)]);
    if (result.scope3.waste.total > 0 || result.scope3.wastewater.total > 0) rows.push(["Scope 3 - Waste", round(result.scope3.waste.total), round(result.scope3.waste.total * 0.001, 4)]);
    if (result.scope3.wastewater.total > 0) rows.push(["Scope 3 - Wastewater", round(result.scope3.wastewater.total), round(result.scope3.wastewater.total * 0.001, 4)]);
    if (result.scope3.total > 0) rows.push(["Scope 3 Total", round(result.scope3.total), round(result.scope3.totalTonne, 4)]);
    rows.push([""]);
    rows.push(["TOTAL", round(result.total.kgCO2e), round(result.total.tCO2e, 4)]);
    rows.push([""]);
    rows.push([`Report generated by Hillkoff CFO Platform - TGO CFO Standard`]);

    const csv = rows.map(r => r.map(v => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hillkoff-cfo-${entry.reportingYear || "report"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("✅ ดาวน์โหลดรายงานเรียบร้อย");
  };

  return (
    <div>
      <div className="section-title">📊 สรุป Carbon Footprint ขององค์กร</div>

      {!result?.total?.tCO2e ? (
        <div className="card" style={{ padding: 40, textAlign: "center", color: "#6b7280" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#14532d", marginBottom: 6 }}>ยังไม่มีข้อมูล</div>
          <div style={{ fontSize: 13 }}>กรอกข้อมูลในแท็บ Scope 1, 2, 3 ก่อนเพื่อดูสรุป</div>
        </div>
      ) : (
        <>
          <div className="card" style={{ padding: 24, marginBottom: 16, textAlign: "center", background: "linear-gradient(135deg,#0f4c2a,#166534)", color: "#fff" }}>
            <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 4 }}>Total GHG Emission</div>
            <div style={{ fontSize: 48, fontWeight: 800, lineHeight: 1.1 }}>{round(result.total.tCO2e, 4)}</div>
            <div style={{ fontSize: 14, opacity: 0.8 }}>tCO₂e</div>
            <div style={{ fontSize: 20, opacity: 0.7, marginTop: 4 }}>{round(result.total.kgCO2e)} kgCO₂e</div>
          </div>

          <div className="grid-3" style={{ marginBottom: 16 }}>
            <div className="card kpi" style={{ borderTop: "4px solid #dc2626" }}>
              <div className="kpi-label">🔴 Scope 1</div>
              <div className="kpi-value" style={{ fontSize: 24 }}>{round(result.scope1.totalTonne, 4)}</div>
              <div className="kpi-unit">tCO₂e</div>
              <div style={{ fontSize: 10, color: "#6b7280", marginTop: 4 }}>
                Stationary {round(result.scope1.stationary.total)} ·
                Mobile {round(result.scope1.mobile.total)} ·
                Fugitive {round(result.scope1.fugitive.total)}
              </div>
            </div>
            <div className="card kpi" style={{ borderTop: "4px solid #2563eb" }}>
              <div className="kpi-label">🔵 Scope 2</div>
              <div className="kpi-value" style={{ fontSize: 24 }}>{round(result.scope2.total * 0.001, 4)}</div>
              <div className="kpi-unit">tCO₂e</div>
              <div style={{ fontSize: 10, color: "#6b7280", marginTop: 4 }}>
                {result.scope2.electricity.details.kwh.toLocaleString()} kWh
              </div>
            </div>
            <div className="card kpi" style={{ borderTop: "4px solid #16a34a" }}>
              <div className="kpi-label">🟢 Scope 3</div>
              <div className="kpi-value" style={{ fontSize: 24 }}>{round(result.scope3.totalTonne, 4)}</div>
              <div className="kpi-unit">tCO₂e</div>
              <div style={{ fontSize: 10, color: "#6b7280", marginTop: 4 }}>
                Waste {round(result.scope3.waste.total)} ·
                WW {round(result.scope3.wastewater.total)}
              </div>
            </div>
          </div>

          {/* Breakdown table */}
          <div className="card" style={{ padding: 16, marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#14532d", marginBottom: 12 }}>📋 รายละเอียดแยกตามประเภท</div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>ประเภท</th><th>ปริมาณ</th><th>หน่วย</th><th>Emission Factor</th><th>kgCO₂e</th></tr>
                </thead>
                <tbody>
                  {result.scope1.stationary.details.map((d, i) => (
                    <tr key={i}><td>🔥 {d.name}</td><td>{d.quantity}</td><td>{d.unit}</td><td>{d.ef}</td><td style={{ fontWeight: 700 }}>{d.co2_kg}</td></tr>
                  ))}
                  {result.scope1.mobile.details.map((d, i) => (
                    <tr key={`m${i}`}><td>🚛 {d.name}</td><td>{d.distanceKm || d.fuelQuantity}</td><td>{d.distanceKm ? "km" : "L"}</td><td>{d.ef}</td><td style={{ fontWeight: 700 }}>{d.co2_kg}</td></tr>
                  ))}
                  {result.scope1.fugitive.details.map((d, i) => (
                    <tr key={`f${i}`}><td>🧊 {d.name}</td><td>{d.quantity}</td><td>{d.unit}</td><td>GWP={d.gwp}</td><td style={{ fontWeight: 700 }}>{d.co2_kg}</td></tr>
                  ))}
                  {result.scope2.electricity.total > 0 && (
                    <tr><td>⚡ ไฟฟ้า</td><td>{result.scope2.electricity.details.kwh}</td><td>kWh</td><td>0.4999</td><td style={{ fontWeight: 700 }}>{round(result.scope2.electricity.total)}</td></tr>
                  )}
                  {result.scope3.waste.details.map((d, i) => (
                    <tr key={`w${i}`}><td>♻️ {d.name}</td><td>{d.quantity}</td><td>kg</td><td>{d.ef}</td><td style={{ fontWeight: 700 }}>{d.co2_kg}</td></tr>
                  ))}
                  {result.scope3.wastewater.total > 0 && (
                    <tr><td>💧 น้ำเสีย</td><td>{result.scope3.wastewater.details.volumeM3}</td><td>m³</td><td>{result.scope3.wastewater.details.ef}</td><td style={{ fontWeight: 700 }}>{round(result.scope3.wastewater.total)}</td></tr>
                  )}
                </tbody>
                <tfoot>
                  <tr style={{ background: "#dcfce7" }}>
                    <td colSpan={4} style={{ fontWeight: 800, textAlign: "right", fontSize: 14 }}>รวมทั้งสิ้น (Total)</td>
                    <td style={{ fontWeight: 800, fontSize: 14, color: "#166534" }}>{round(result.total.kgCO2e)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
            <button onClick={exportReport} className="btn btn-primary">📥 Export CSV Report</button>
            <button onClick={async () => {
              try {
                const res = await fetch("/api/cfo-report", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(entry)
                });
                if (!res.ok) throw new Error("Export failed");
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `hillkoff-cfo-${entry.reportingYear || "report"}.xlsx`;
                a.click();
                URL.revokeObjectURL(url);
                showToast("✅ ดาวน์โหลด Excel (TGO Template) เรียบร้อย");
              } catch (e) {
                showToast(`❌ ${e.message}`, "error");
              }
            }} className="btn btn-primary" style={{ background: "linear-gradient(135deg,#1565c0,#1976d2)" }}>📊 Export Excel (TGO)</button>
            <button onClick={() => {
              if (confirm("บันทึกข้อมูล CFO ไปยังระบบ?")) {
                onSave(entry);
              }
            }} className="btn btn-secondary">💾 บันทึกข้อมูล</button>
          </div>

          {!valid && (
            <div className="card" style={{ padding: 14, background: "#fef9c3", border: "1px solid #fde68a", fontSize: 12, color: "#854d0e" }}>
              <b>⚠️ ข้อมูลไม่สมบูรณ์:</b>
              {errors.map((e, i) => <div key={i}>• {e}</div>)}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Import Upload Zone ──────────────────────────────────────────
function ImportZone({ onImport, showToast }) {
  const fileRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = async (file) => {
    const ext = file.name.split(".").pop().toLowerCase();
    if (!["xlsx", "xls", "csv", "pdf"].includes(ext)) {
      showToast("⚠️ รองรับเฉพาะไฟล์ .xlsx, .xls, .csv, .pdf", "warning");
      return;
    }
    showToast(`⏳ กำลังวิเคราะห์ไฟล์: ${file.name}...`);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/document-analyze", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Parse failed");
      showToast(`✅ วิเคราะห์สำเร็จ: ${file.name}`);
      return data;
    } catch (error) {
      showToast(`❌ ${error.message}`, "error");
      return null;
    }
  };

  return (
    <div>
      <div className="section-title">📂 นำเข้าข้อมูลจากไฟล์</div>
      <div className={`upload-zone ${dragging ? "dragging" : ""}`}
        onClick={() => fileRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); Array.from(e.dataTransfer.files).forEach(handleFile); }}
      >
        <input ref={fileRef} type="file" multiple accept=".xlsx,.xls,.csv,.pdf" style={{ display: "none" }}
          onChange={e => Array.from(e.target.files || []).forEach(handleFile)}
        />
        <div style={{ fontSize: 40, marginBottom: 10 }}>📂</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#14532d" }}>ลากไฟล์มาวาง หรือคลิกเพื่อเลือก</div>
        <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>รองรับไฟล์ TGO Template (Fr-03, Fr-04, Fr-05), บิลค่าไฟ, CSV</div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ─────────────────────────────────────────────
export default function CFODashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [tab, setTab] = useState("org");
  const [entry, setEntry] = useState(createEmptyEntry(new Date().getFullYear()));
  const [savedEntries, setSavedEntries] = useState([]);
  const [toast, setToast] = useState({ msg: "", show: false, type: "success" });
  const [knowledgeModule, setKnowledgeModule] = useState(null);
  const [benefitCalc, setBenefitCalc] = useState({ solar: 0, ev: 0, led: 0, foodWaste: 0 });
  const [benefitResult, setBenefitResult] = useState(null);
  const toastTimer = useRef(null);

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, show: true, type });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(t => ({ ...t, show: false })), 2500);
  }, []);

  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      const appUser = toAppUser(firebaseUser);
      if (!appUser) { router.replace("/login"); return; }
      if (!(await hasOtpClaim(firebaseUser))) { router.replace("/login"); return; }
      setUser(appUser);
      setAuthLoading(false);
    });
    return () => unsub();
  }, [router]);

  const handleSave = async (data) => {
    try {
      const res = await fetch("/api/cfo-entry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, recordedBy: user?.id, recordedAt: new Date().toISOString() })
      });
      if (res.ok) {
        showToast("✅ บันทึกข้อมูลสำเร็จ");
        setSavedEntries(prev => [...prev, { ...data, id: Date.now(), savedAt: new Date().toISOString() }]);
      } else {
        const err = await res.json();
        showToast(`❌ ${err.error || "บันทึกไม่สำเร็จ"}`, "error");
      }
    } catch (error) {
      showToast(`❌ ${error.message}`, "error");
    }
  };

  const handleLogout = async () => {
    try { await signOut(getFirebaseAuth()); } catch { }
    router.replace("/login");
  };

  if (authLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#f0fdf4" }}>
        <div style={{ color: "#166534", fontWeight: 700 }}>กำลังโหลด...</div>
      </div>
    );
  }

  const TABS = [
    { id: "org", icon: "🏢", label: "องค์กร" },
    { id: "scope1", icon: "🔥", label: "Scope 1" },
    { id: "scope2", icon: "⚡", label: "Scope 2" },
    { id: "scope3", icon: "♻️", label: "Scope 3" },
    { id: "summary", icon: "📊", label: "สรุป CFO" },
    { id: "knowledge", icon: "📚", label: "ความรู้" },
    { id: "benefit", icon: "💰", label: "ผลประโยชน์" },
  ];

  return (
    <>
      <Header user={user} onLogout={handleLogout} />

      <div className="page">
        {/* Year selector */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#6b7280" }}>ปีที่รายงาน:</span>
            <select className="select" style={{ width: 120 }} value={entry.reportingYear || ""} onChange={e => setEntry(prev => ({ ...createEmptyEntry(parseInt(e.target.value) || new Date().getFullYear()), orgInfo: prev.orgInfo }))}>
              {Array.from({ length: 5 }, (_, i) => {
                const y = new Date().getFullYear() + 543 - i;
                return <option key={y} value={y - 543}>{y}</option>;
              })}
            </select>
          </div>
          <ImportZone onImport={(data) => {
            if (data?.type === "stationary" && Array.isArray(data.data)) {
              setEntry(prev => ({ ...prev, stationaryCombustion: [...(prev.stationaryCombustion || []), ...data.data] }));
              showToast(`✅ นำเข้า ${data.data.length} รายการ`);
            }
          }} showToast={showToast} />
        </div>

        {/* Certification Badges */}
        <CertBadges />

        {/* Gamification Progress */}
        <GamificationBar entry={entry} />

        {/* Tab bar */}
        <div className="tab-bar">
          {TABS.map(t => (
            <button key={t.id} className={`tab-btn ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === "org" && <OrgInfoTab entry={entry} setEntry={setEntry} />}
        {tab === "scope1" && <Scope1Tab entry={entry} setEntry={setEntry} />}
        {tab === "scope2" && <Scope2Tab entry={entry} setEntry={setEntry} />}
        {tab === "scope3" && <Scope3Tab entry={entry} setEntry={setEntry} />}
        {tab === "summary" && <SummaryTab entry={entry} onSave={handleSave} showToast={showToast} />}
        {tab === "knowledge" && (
          <div>
            <div className="section-title">📚 ความรู้เกี่ยวกับ CFO & Net Zero</div>
            <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 16 }}>รวม 8 หมวดความรู้เกี่ยวกับ Carbon Footprint for Organization — คลิกเพื่ออ่านเพิ่มเติม</p>
            <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
              {KNOWLEDGE_MODULES.map((mod) => (
                <div key={mod.id} className="knowledge-card" style={{ padding: 20, background: "#fff" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: 28 }}>{mod.icon}</span>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "#14532d" }}>{mod.title}</div>
                      <span className="badge" style={{ background: mod.tagColor + "20", color: mod.tagColor, fontSize: 9 }}>{mod.tag}</span>
                    </div>
                  </div>
                  <p style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.6, marginBottom: 10 }}>{mod.summary}</p>
                  {knowledgeModule === mod.id ? (
                    <div>
                      <div className="knowledge-content" dangerouslySetInnerHTML={{ __html: mod.content }} />
                      {mod.faq && mod.faq.length > 0 && (
                        <div style={{ marginTop: 12 }}>
                          <h4 style={{ fontSize: 14, color: "#166534" }}>❓ FAQ</h4>
                          {mod.faq.map((f, i) => (
                            <div key={i} className="faq-item">
                              <p style={{ fontWeight: 700, fontSize: 13 }}>{f.q}</p>
                              <p style={{ fontSize: 13, color: "#6b7280" }}>{f.a}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      <button onClick={() => setKnowledgeModule(null)} className="btn btn-sm btn-secondary" style={{ marginTop: 10 }}>▲ ปิด</button>
                    </div>
                  ) : (
                    <button onClick={() => setKnowledgeModule(mod.id)} className="btn btn-sm btn-primary">📖 อ่านเพิ่มเติม</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        {tab === "benefit" && (
          <div>
            <div className="section-title">💰 เครื่องคำนวณผลประโยชน์จากการลด GHG</div>
            <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 16 }}>เลือกมาตรการที่สนใจ กรอกข้อมูล แล้วกดคำนวณเพื่อดูผลตอบแทน</p>
            <div className="card" style={{ padding: 20, marginBottom: 16 }}>
              <div className="grid-2">
                <div className="benefit-card">
                  <div style={{ fontSize: 24, marginBottom: 4 }}>☀️</div>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Solar Roof</div>
                  <label style={{ fontSize: 11, color: "#6b7280" }}>ขนาด (kWp):</label>
                  <input className="input" type="number" value={benefitCalc.solar || ""} onChange={e => setBenefitCalc(p => ({ ...p, solar: Number(e.target.value) || 0 }))} placeholder="10" />
                </div>
                <div className="benefit-card">
                  <div style={{ fontSize: 24, marginBottom: 4 }}>🚗</div>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>เปลี่ยนรถ EV</div>
                  <label style={{ fontSize: 11, color: "#6b7280" }}>จำนวน (คัน):</label>
                  <input className="input" type="number" value={benefitCalc.ev || ""} onChange={e => setBenefitCalc(p => ({ ...p, ev: Number(e.target.value) || 0 }))} placeholder="1" />
                </div>
                <div className="benefit-card">
                  <div style={{ fontSize: 24, marginBottom: 4 }}>💡</div>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>LED</div>
                  <label style={{ fontSize: 11, color: "#6b7280" }}>ค่าไฟปัจจุบัน (kWh/ปี):</label>
                  <input className="input" type="number" value={benefitCalc.led || ""} onChange={e => setBenefitCalc(p => ({ ...p, led: Number(e.target.value) || 0 }))} placeholder="50000" />
                </div>
                <div className="benefit-card">
                  <div style={{ fontSize: 24, marginBottom: 4 }}>🍽️</div>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>ลดขยะอาหาร</div>
                  <label style={{ fontSize: 11, color: "#6b7280" }}>ขยะปัจจุบัน (กก./ปี):</label>
                  <input className="input" type="number" value={benefitCalc.foodWaste || ""} onChange={e => setBenefitCalc(p => ({ ...p, foodWaste: Number(e.target.value) || 0 }))} placeholder="1000" />
                </div>
              </div>
              <button onClick={() => {
                const selections = {};
                if (benefitCalc.solar > 0) selections.solar = { kwp: benefitCalc.solar };
                if (benefitCalc.ev > 0) selections.ev = { count: benefitCalc.ev, kmPerYear: 20000 };
                if (benefitCalc.led > 0) selections.led = { currentKwh: benefitCalc.led };
                if (benefitCalc.foodWaste > 0) selections.foodWaste = { currentKg: benefitCalc.foodWaste };
                const result = calcCombined(selections);
                setBenefitResult(result);
              }} className="btn btn-primary" style={{ marginTop: 12, width: "100%" }}>🔢 คำนวณผลประโยชน์</button>
            </div>

            {benefitResult && (
              <div className="fade-up">
                <div className="card" style={{ padding: 20, background: "linear-gradient(135deg,#0f4c2a,#166534)", color: "#fff", marginBottom: 12 }}>
                  <div style={{ fontSize: 14, opacity: 0.8, marginBottom: 4 }}>ผลลัพธ์รวม</div>
                  <div className="grid-4" style={{ marginTop: 8 }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 28, fontWeight: 800 }}>{benefitResult.summary.totalAnnualCo2}</div>
                      <div style={{ fontSize: 11, opacity: 0.7 }}>tCO₂e/ปี</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 28, fontWeight: 800 }}>{benefitResult.summary.totalAnnualSaving.toLocaleString()}</div>
                      <div style={{ fontSize: 11, opacity: 0.7 }}>บาท/ปี</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 28, fontWeight: 800 }}>{benefitResult.summary.totalTrees.toLocaleString()}</div>
                      <div style={{ fontSize: 11, opacity: 0.7 }}>🌳 ต้นไม้/ปี</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 28, fontWeight: 800 }}>{benefitResult.summary.totalCreditValue.toLocaleString()}</div>
                      <div style={{ fontSize: 11, opacity: 0.7 }}>บาท (Carbon Credit)</div>
                    </div>
                  </div>
                </div>
                {benefitResult.results.map((r, i) => (
                  <div key={i} className="benefit-card" style={{ padding: 16, marginBottom: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 16 }}>{r.icon} {r.name}</span>
                      <span style={{ fontWeight: 700, color: "#166534" }}>ลด {r.annualCo2} tCO₂e/ปี</span>
                    </div>
                    <div style={{ fontSize: 12, color: "#6b7280", marginTop: 6 }}>
                      ลงทุน {r.investment.toLocaleString()} บาท | ประหยัด {r.annualCostSaving?.toLocaleString() || r.annualFuelSaving?.toLocaleString() || ""} บาท/ปี{r.paybackYears > 0 ? ` | คืนทุน ${r.paybackYears} ปี` : ""}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Recent entries */}
        {savedEntries.length > 0 && (
          <details style={{ marginTop: 24 }}>
            <summary style={{ fontSize: 13, fontWeight: 700, color: "#166534", cursor: "pointer", padding: 10 }}>
              📁 ข้อมูลที่บันทึกแล้ว ({savedEntries.length} รายการ)
            </summary>
            <div className="card" style={{ padding: 12, marginTop: 8 }}>
              {savedEntries.slice().reverse().map((e, i) => (
                <div key={e.id || i} style={{ padding: "8px 0", borderBottom: i < savedEntries.length - 1 ? "1px solid #d1fae5" : "none", fontSize: 12, color: "#374151" }}>
                  ปี {e.reportingYear} — บันทึกเมื่อ {e.savedAt ? new Date(e.savedAt).toLocaleString() : "-"}
                </div>
              ))}
            </div>
          </details>
        )}
      </div>

      <Toast msg={toast.msg} show={toast.show} type={toast.type} />
    </>
  );
}