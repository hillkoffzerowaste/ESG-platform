"use client";
import { STATIONARY_FUEL_TYPES, TGO_FORMS } from "@/lib/cfoForms";
import { TOOLTIPS } from "@/lib/knowledgeBase";
const toNumber = v => { const n = Number(v); return Number.isFinite(n) && n >= 0 ? n : 0; };

function InfoTip({ tipKey, children }) {
  const tip = TOOLTIPS[tipKey] || children;
  return (<span className="tooltip-trigger">❔<span className="tooltip-popup">{tip}</span></span>);
}

export default function OrgInfoTab({ entry, setEntry }) {
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
          <div><label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280" }}>วันเริ่มต้นรอบบัญชี</label><input className="input" type="date" value={org.startDate || ""} onChange={e => setOrg({ startDate: e.target.value })} /></div>
          <div><label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280" }}>วันสิ้นสุดรอบบัญชี</label><input className="input" type="date" value={org.endDate || ""} onChange={e => setOrg({ endDate: e.target.value })} /></div>
          <div><label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280" }}>วิธีการกำหนดขอบเขต * <InfoTip tipKey="baseYear" /></label>
            <select className="select" value={org.boundaryMethod || "control"} onChange={e => setOrg({ boundaryMethod: e.target.value })}>
              <option value="control">Control Approach (อำนาจควบคุม)</option>
              <option value="equityShare">Equity Share Approach (ส่วนแบ่งทุน)</option>
            </select>
          </div>
          <div><label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280" }}>ผู้รับผิดชอบข้อมูล *</label><input className="input" value={org.responsiblePerson || ""} onChange={e => setOrg({ responsiblePerson: e.target.value })} placeholder="ชื่อ-นามสกุล" /></div>
          <div><label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280" }}>อีเมลผู้ติดต่อ *</label><input className="input" type="email" value={org.responsibleEmail || ""} onChange={e => setOrg({ responsibleEmail: e.target.value })} placeholder="email@hillkoff.com" /></div>
          <div><label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280" }}>โทรศัพท์</label><input className="input" value={org.responsiblePhone || ""} onChange={e => setOrg({ responsiblePhone: e.target.value })} placeholder="02-xxx-xxxx" /></div>
        </div>
        <div style={{ marginTop: 12 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280" }}>ลักษณะกิจการโดยย่อ</label>
          <textarea className="textarea" value={org.orgDescription || ""} onChange={e => setOrg({ orgDescription: e.target.value })} rows={3} />
        </div>
      </div>
      <div className="section-title">📦 ผลผลิต (Product Output) — สำหรับคำนวณ Carbon Intensity</div>
      <div className="card" style={{ padding: 16, marginBottom: 16 }}>
        <div className="grid-2">
          <div><label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280" }}>ปริมาณผลผลิต</label><input className="input" type="number" value={entry.productOutput?.quantity || ""} onChange={e => setEntry(prev => ({ ...prev, productOutput: { ...prev.productOutput, quantity: toNumber(e.target.value) } }))} placeholder="30000" /></div>
          <div><label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280" }}>หน่วย</label>
            <select className="select" value={entry.productOutput?.unit || "ตัน"} onChange={e => setEntry(prev => ({ ...prev, productOutput: { ...prev.productOutput, unit: e.target.value } }))}>
              <option value="ตัน">ตัน</option><option value="กิโลกรัม">กิโลกรัม</option><option value="ชิ้น">ชิ้น</option><option value="หน่วย">หน่วย</option><option value="ลิตร">ลิตร</option><option value="kWh">kWh</option>
            </select>
          </div>
        </div>
      </div>
      <div className="section-title">📄 แบบฟอร์มอ้างอิง อบก.</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 8, marginBottom: 16 }}>
        {Object.entries(TGO_FORMS).map(([key, f]) => (<div key={key} className="card" style={{ padding: "10px 14px" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#15803d" }}>{key}</div>
          <div style={{ fontSize: 11, color: "#374151" }}>{f.name}</div>
          <div style={{ fontSize: 9, color: "#6b7280" }}>v{f.version}</div>
        </div>))}
      </div>
    </div>
  );
}