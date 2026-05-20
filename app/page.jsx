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
      <button onClick={() => { showToast("🔄 กำลังสร้างรายงานทั้งหมด..."); setTimeout(() => showToast("✅ สร้างรายงาน 5 ฉบับเรียบร้อย"), 1500); }} style={{ width: "100%", padding: 14, background: "linear-gradient(135deg,#166534,#16a34a)", color: "#fff", border: "none", borderRadius: 14, fontSize: 14, fontWeight: 700, cursor: "pointer", marginTop: 12 }}>🔄 สร้างรายงานทั้งหมด</button>
      <ReportDetailModal report={selectedReport ? REPORT_DETAILS[selectedReport] : null} totals={totals} onClose={() => setSelectedReport(null)} onDownload={() => downloadReport(selectedReport)} />
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState("home");
  const [branches, setBranches] = useState(createInitialBranches);
  const [monthlyCo2, setMonthlyCo2] = useState(Array(12).fill(0));
  const [modalBranchIdx, setModalBranchIdx] = useState(null);
  const [toast, setToast] = useState({ msg: "", show: false });
  const [aiOpen, setAiOpen] = useState(false);
  const toastTimer = useRef(null);

  const showToast = useCallback(msg => {
    setToast({ msg, show: true });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(t => ({ ...t, show: false })), 2500);
  }, []);

  const saveDashboardState = useCallback(async (nextBranches, nextMonthlyCo2) => {
    try {
      const res = await fetch("/api/dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          branches: nextBranches,
          monthlyCo2: nextMonthlyCo2,
          savedAt: new Date().toISOString()
        })
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data?.error || "Save failed");
    } catch (error) {
      console.warn("Cloud dashboard save skipped:", error.message);
    }
  }, []);

  useEffect(() => {
    let alive = true;
    async function loadDashboardState() {
      try {
        const res = await fetch("/api/dashboard", { cache: "no-store" });
        const data = await res.json();
        if (!alive || !res.ok || !data.ok || !data.state) return;
        if (Array.isArray(data.state.branches)) setBranches(data.state.branches);
        if (Array.isArray(data.state.monthlyCo2)) setMonthlyCo2(data.state.monthlyCo2);
        showToast("☁️ โหลดข้อมูลจาก Google Firestore แล้ว");
      } catch (error) {
        console.warn("Cloud dashboard load skipped:", error.message);
      }
    }
    loadDashboardState();
    return () => {
      alive = false;
    };
  }, [showToast]);

  const handleSave = useCallback(({ branchId, month, elec, water, fuel, co2Total, wGen, wRec, wOrg, wHaz, recycleRate }) => {
    let nextBranchesForCloud = null;
    let nextMonthlyForCloud = null;

    setBranches(prev => {
      const next = prev.map(b => {
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
      });
      nextBranchesForCloud = next;
      return next;
    });
    const monthIdx = month ? parseInt(month.split("-")[1], 10) - 1 : new Date().getMonth();
    setMonthlyCo2(prev => {
      const c = [...prev];
      c[monthIdx] = +(c[monthIdx] + co2Total).toFixed(4);
      nextMonthlyForCloud = c;
      return c;
    });
    const bn = BRANCHES_INIT.find(b => b.id === branchId)?.name || branchId;
    showToast(`✅ อัปเดตข้อมูล ${bn} เรียบร้อย`);
    setTimeout(() => {
      if (nextBranchesForCloud && nextMonthlyForCloud) {
        saveDashboardState(nextBranchesForCloud, nextMonthlyForCloud);
      }
    }, 0);
  }, [saveDashboardState, showToast]);

  const navItems = [
    { id: "home", icon: "🏠", label: "หน้าหลัก" },
    { id: "upload", icon: "📤", label: "Upload" },
    { id: "analytics", icon: "📊", label: "Analytics" },
    { id: "ranking", icon: "🏆", label: "Ranking" },
    { id: "reports", icon: "📄", label: "Reports" }
  ];

  return (
    <>
      <style>{css}</style>
      <div className="app-shell">
        <div className="page-container">
          {page === "home" && <PageHome branches={branches} monthlyCo2={monthlyCo2} onBranchClick={i => setModalBranchIdx(i)} onGoUpload={() => setPage("upload")} />}
          {page === "upload" && <PageUpload branches={branches} onSave={handleSave} showToast={showToast} />}
          {page === "analytics" && <PageAnalytics branches={branches} monthlyCo2={monthlyCo2} />}
          {page === "ranking" && <PageRanking branches={branches} onBranchClick={i => setModalBranchIdx(i)} />}
          {page === "reports" && <PageReports branches={branches} showToast={showToast} />}
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
