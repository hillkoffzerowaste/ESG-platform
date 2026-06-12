"use client";
import { useState, useMemo } from "react";
import { calculateCFO } from "@/lib/cfoCalculator";
import { STATIONARY_FUEL_TYPES, VEHICLE_CATEGORIES, REFRIGERANT_TYPES } from "@/lib/cfoForms";
import { COMMON_FUELS } from "@/lib/tgoFactors";
const toNumber = v => { const n = Number(v); return Number.isFinite(n) && n >= 0 ? n : 0; };
const round = (v, d = 4) => { const n = Number(v); return Number.isFinite(n) ? Number(n.toFixed(d)) : 0; };

export default function Scope1Tab({ entry, setEntry }) {
  const addStationary = () => setEntry(e => ({ ...e, stationaryCombustion: [...(e.stationaryCombustion || []), { fuelType: "diesel", quantity: 0 }] }));
  const updateStationary = (i, updates) => setEntry(e => { const arr = [...(e.stationaryCombustion || [])]; arr[i] = { ...arr[i], ...updates }; return { ...e, stationaryCombustion: arr }; });
  const removeStationary = (i) => setEntry(e => ({ ...e, stationaryCombustion: (e.stationaryCombustion || []).filter((_, j) => j !== i) }));
  const addMobile = () => setEntry(e => ({ ...e, mobileCombustion: [...(e.mobileCombustion || []), { vehicleType: "pickup_diesel", distanceKm: 0, fuelQuantity: 0, fuelType: "diesel", count: 1 }] }));
  const updateMobile = (i, updates) => setEntry(e => { const arr = [...(e.mobileCombustion || [])]; arr[i] = { ...arr[i], ...updates }; return { ...e, mobileCombustion: arr }; });
  const removeMobile = (i) => setEntry(e => ({ ...e, mobileCombustion: (e.mobileCombustion || []).filter((_, j) => j !== i) }));
  const addRefrigerant = () => setEntry(e => ({ ...e, fugitiveEmissions: { ...e.fugitiveEmissions, refrigerants: [...(e.fugitiveEmissions?.refrigerants || []), { refrigerantId: "r_410a", leakKg: 0 }] } }));
  const updateRefrigerant = (i, updates) => setEntry(e => { const arr = [...(e.fugitiveEmissions?.refrigerants || [])]; arr[i] = { ...arr[i], ...updates }; return { ...e, fugitiveEmissions: { ...e.fugitiveEmissions, refrigerants: arr } }; });
  const removeRefrigerant = (i) => setEntry(e => ({ ...e, fugitiveEmissions: { ...e.fugitiveEmissions, refrigerants: (e.fugitiveEmissions?.refrigerants || []).filter((_, j) => j !== i) } }));
  const calcResult = useMemo(() => { try { return calculateCFO(entry); } catch { return null; } }, [entry]);

  return (
    <div>
      <div className="section-title">🔥 Stationary Combustion <InfoTip tipKey="stationary" /></div>
      <div className="card" style={{ padding: 16, marginBottom: 16 }}>
        {(entry.stationaryCombustion || []).length === 0 && <div style={{ textAlign: "center", padding: 24, color: "#6b7280", fontSize: 13 }}>ยังไม่มีข้อมูล</div>}
        {(entry.stationaryCombustion || []).map((fuel, i) => {
          const ef = COMMON_FUELS[fuel.fuelType]; const co2 = round(toNumber(fuel.quantity) * (ef?.ef || 0));
          return (<div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-end", marginBottom: 8, flexWrap: "wrap" }}>
            <select className="select" style={{ flex: 1, minWidth: 140 }} value={fuel.fuelType} onChange={e => updateStationary(i, { fuelType: e.target.value })}>
              {Object.entries(STATIONARY_FUEL_TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <input className="input" type="number" style={{ width: 100 }} value={fuel.quantity || ""} onChange={e => updateStationary(i, { quantity: toNumber(e.target.value) })} placeholder="0" />
            <span style={{ fontSize: 11, color: "#6b7280", whiteSpace: "nowrap", minWidth: 50 }}>{ef?.unit || ""}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: co2 > 0 ? "#166534" : "#6b7280", minWidth: 80, textAlign: "right" }}>{co2 > 0 ? `${round(co2, 2)} kgCO₂e` : "—"}</span>
            <input className="input" type="text" style={{ width: 90, fontSize: 10, padding: "6px 8px" }} value={fuel.sourceReference || ""} onChange={e => updateStationary(i, { sourceReference: e.target.value })} placeholder="📎 เลขที่บิล" />
            <button onClick={() => removeStationary(i)} style={{ width: 28, height: 28, border: "none", borderRadius: 8, background: "#fee2e2", color: "#b91c1c", cursor: "pointer", fontSize: 14 }}>✕</button>
          </div>);
        })}
        <button onClick={addStationary} className="btn btn-sm btn-secondary">➕ เพิ่มเชื้อเพลิง</button>
      </div>

      <div className="section-title">🚛 Mobile Combustion <InfoTip tipKey="mobile" /></div>
      <div className="card" style={{ padding: 16, marginBottom: 16 }}>
        {(entry.mobileCombustion || []).length === 0 && <div style={{ textAlign: "center", padding: 24, color: "#6b7280", fontSize: 13 }}>ยังไม่มีข้อมูล</div>}
        {(entry.mobileCombustion || []).map((v, i) => {
          const ef = COMMON_FUELS[v.fuelType]?.ef || 2.6993; const co2 = round((toNumber(v.fuelQuantity) || 0) * ef);
          return (<div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-end", marginBottom: 8, flexWrap: "wrap" }}>
            <select className="select" style={{ flex: 1, minWidth: 140 }} value={v.vehicleType} onChange={e => updateMobile(i, { vehicleType: e.target.value })}>
              {VEHICLE_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
            <div><span style={{ fontSize: 9, color: "#6b7280" }}>กม.</span><input className="input" type="number" style={{ width: 90 }} value={v.distanceKm || ""} onChange={e => updateMobile(i, { distanceKm: toNumber(e.target.value) })} placeholder="0" /></div>
            <div><span style={{ fontSize: 9, color: "#6b7280" }}>ลิตร</span><input className="input" type="number" style={{ width: 90 }} value={v.fuelQuantity || ""} onChange={e => updateMobile(i, { fuelQuantity: toNumber(e.target.value) })} placeholder="0" /></div>
            <span style={{ fontSize: 11, fontWeight: 700, color: co2 > 0 ? "#166534" : "#6b7280", minWidth: 80 }}>{co2 > 0 ? `${round(co2, 2)} kgCO₂e` : "—"}</span>
            <button onClick={() => removeMobile(i)} style={{ width: 28, height: 28, border: "none", borderRadius: 8, background: "#fee2e2", color: "#b91c1c", cursor: "pointer", fontSize: 14 }}>✕</button>
          </div>);
        })}
        <button onClick={addMobile} className="btn btn-sm btn-secondary">➕ เพิ่มยานพาหนะ</button>
      </div>

      <div className="section-title">🧊 Fugitive Emissions <InfoTip tipKey="fugitive" /></div>
      <div className="card" style={{ padding: 16, marginBottom: 16 }}>
        <details><summary style={{ fontSize: 12, fontWeight: 700, color: "#166534", cursor: "pointer" }}>สารทำความเย็น</summary>
          <div style={{ marginTop: 12 }}>
            {(entry.fugitiveEmissions?.refrigerants || []).map((ref, i) => {
              const info = REFRIGERANT_TYPES.find(r => r.id === ref.refrigerantId); const co2 = round(toNumber(ref.leakKg) * (info?.gwp || 0));
              return (<div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-end", marginBottom: 8, flexWrap: "wrap" }}>
                <select className="select" style={{ flex: 1, minWidth: 140 }} value={ref.refrigerantId} onChange={e => updateRefrigerant(i, { refrigerantId: e.target.value })}>
                  {REFRIGERANT_TYPES.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
                </select>
                <input className="input" type="number" style={{ width: 100 }} value={ref.leakKg || ""} onChange={e => updateRefrigerant(i, { leakKg: toNumber(e.target.value) })} placeholder="0" />
                <span style={{ fontSize: 11, color: "#6b7280" }}>kg</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: co2 > 0 ? "#166534" : "#6b7280", minWidth: 80 }}>{co2 > 0 ? `${round(co2, 2)} kgCO₂e` : "—"}</span>
                <button onClick={() => removeRefrigerant(i)} style={{ width: 28, height: 28, border: "none", borderRadius: 8, background: "#fee2e2", color: "#b91c1c", cursor: "pointer", fontSize: 14 }}>✕</button>
              </div>);
            })}
            <button onClick={addRefrigerant} className="btn btn-sm btn-secondary">➕ เพิ่ม</button>
            <div style={{ marginTop: 12 }}><label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280" }}>CO₂ Extinguisher (กก.)</label>
              <input className="input" type="number" style={{ width: 120 }} value={entry.fugitiveEmissions?.co2ExtinguisherKg || ""} onChange={e => setEntry(prev => ({ ...prev, fugitiveEmissions: { ...prev.fugitiveEmissions, co2ExtinguisherKg: toNumber(e.target.value) } }))} placeholder="0" /></div>
          </div>
        </details>
      </div>

      <div className="section-title">🧪 Process Emissions</div>
      <div className="card" style={{ padding: 16, marginBottom: 16 }}>
        <details><summary style={{ fontSize: 12, fontWeight: 700, color: "#166534", cursor: "pointer" }}>Process Emissions</summary>
          <div style={{ marginTop: 12 }}><div className="grid-3">
            <div><label style={{ fontSize: 10, fontWeight: 600, color: "#6b7280" }}>CO₂ (kg)</label><input className="input" type="number" value={entry.processEmissions?.co2Kg || ""} onChange={e => setEntry(prev => ({ ...prev, processEmissions: { ...prev.processEmissions, co2Kg: toNumber(e.target.value) } }))} placeholder="0" /></div>
            <div><label style={{ fontSize: 10, fontWeight: 600, color: "#6b7280" }}>CH₄ (kg)</label><input className="input" type="number" value={entry.processEmissions?.ch4Kg || ""} onChange={e => setEntry(prev => ({ ...prev, processEmissions: { ...prev.processEmissions, ch4Kg: toNumber(e.target.value) } }))} placeholder="0" /></div>
            <div><label style={{ fontSize: 10, fontWeight: 600, color: "#6b7280" }}>N₂O (kg)</label><input className="input" type="number" value={entry.processEmissions?.n2oKg || ""} onChange={e => setEntry(prev => ({ ...prev, processEmissions: { ...prev.processEmissions, n2oKg: toNumber(e.target.value) } }))} placeholder="0" /></div>
          </div></div>
        </details>
      </div>

      <div className="section-title">💨 Fugitive CH₄ (Septic & Wastewater)</div>
      <div className="card" style={{ padding: 16, marginBottom: 16 }}>
        <details><summary style={{ fontSize: 12, fontWeight: 700, color: "#166534", cursor: "pointer" }}>CH₄ Fugitive</summary>
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#14532d" }}>🚽 Septic Tank</div>
            <div className="grid-2" style={{ marginBottom: 12 }}>
              <div><label style={{ fontSize: 10, fontWeight: 600, color: "#6b7280" }}>พนักงาน (คน)</label><input className="input" type="number" value={entry.septic?.employees || ""} onChange={e => setEntry(prev => ({ ...prev, septic: { ...prev.septic, employees: toNumber(e.target.value) } }))} placeholder="200" /></div>
              <div><label style={{ fontSize: 10, fontWeight: 600, color: "#6b7280" }}>วันทำงาน/ปี</label><input className="input" type="number" value={entry.septic?.workDays || ""} onChange={e => setEntry(prev => ({ ...prev, septic: { ...prev.septic, workDays: toNumber(e.target.value) } }))} placeholder="300" /></div>
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#14532d" }}>💧 Wastewater (COD)</div>
            <div className="grid-2">
              <div><label style={{ fontSize: 10, fontWeight: 600, color: "#6b7280" }}>น้ำเสีย (m³/ปี)</label><input className="input" type="number" value={entry.fugitiveEmissions?.wastewater?.volumeM3 || ""} onChange={e => setEntry(prev => ({ ...prev, fugitiveEmissions: { ...prev.fugitiveEmissions, wastewater: { ...prev.fugitiveEmissions?.wastewater, volumeM3: toNumber(e.target.value) } } }))} placeholder="20000" /></div>
              <div><label style={{ fontSize: 10, fontWeight: 600, color: "#6b7280" }}>COD (mg/L)</label><input className="input" type="number" value={entry.fugitiveEmissions?.wastewater?.codMgL || ""} onChange={e => setEntry(prev => ({ ...prev, fugitiveEmissions: { ...prev.fugitiveEmissions, wastewater: { ...prev.fugitiveEmissions?.wastewater, codMgL: toNumber(e.target.value) } } }))} placeholder="8000" /></div>
            </div>
          </div>
        </details>
      </div>

      {calcResult?.scope1?.total > 0 && <div className="card" style={{ padding: 14, background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#166534" }}>📊 Scope 1 รวม: {round(calcResult.scope1.totalTonne, 4)} tCO₂e</div>
        <div style={{ fontSize: 11, color: "#374151" }}>
          {calcResult.scope1.stationary.total > 0 && <div>🔥 Stationary: {round(calcResult.scope1.stationary.total)} kg</div>}
          {calcResult.scope1.mobile.total > 0 && <div>🚛 Mobile: {round(calcResult.scope1.mobile.total)} kg</div>}
          {calcResult.scope1.fugitive.total > 0 && <div>🧊 Refrigerants: {round(calcResult.scope1.fugitive.total)} kg</div>}
          {calcResult.scope1.fugitiveCH4?.total > 0 && <div>💨 CH₄: {round(calcResult.scope1.fugitiveCH4.total)} kg</div>}
          {calcResult.scope1.process?.total > 0 && <div>🧪 Process: {round(calcResult.scope1.process.total)} kg</div>}
        </div>
      </div>}
    </div>
  );
}

function InfoTip({ tipKey }) {
  const { TOOLTIPS } = { TOOLTIPS: { stationary: 'การเผาไหม้ที่อยู่กับที่', mobile: 'ยานพาหนะขององค์กร', fugitive: 'สารทำความเย็นรั่วไหล' } };
  const tip = TOOLTIPS[tipKey] || '';
  return (<span className="tooltip-trigger">❔<span className="tooltip-popup">{tip}</span></span>);
}
