import { useEffect, useState } from "react";
import Card from "../components/Card";
import { api } from "../services/api";

export default function Insights() {
  const [analysis, setAnalysis] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  const loadHistory = async () => {
    const response = await api.get("/ai/history");
    setHistory(response.data.data || []);
  };

  useEffect(() => {
    Promise.all([api.get("/ai/history")]).then(([response]) => {
      const saved = response.data.data || [];
      setHistory(saved);
      setAnalysis(saved[0] || null);
    }).catch((err) => setError(err.response?.data?.message || "Unable to load analysis history.")).finally(() => setLoading(false));
  }, []);

  const analyze = async () => {
    setGenerating(true); setError("");
    try {
      const response = await api.post("/ai/analyze");
      setAnalysis(response.data.data);
      await loadHistory();
    } catch (err) { setError(err.response?.data?.message || "Unable to analyze study habits."); }
    finally { setGenerating(false); }
  };

  if (loading) return <div className="container mt-4" style={{position:"relative",top:59}}><h2>AI Study Analysis</h2><p>Loading saved analyses...</p></div>;

  return <main className="container-fluid product-page px-3 px-lg-4 mt-4 pb-5">
    <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
      <div className="page-heading mb-0"><div className="small text-uppercase fw-semibold text-primary mb-2" style={{letterSpacing:".1em"}}>Data-backed insight</div><h1 className="h2 mb-1">AI study analysis</h1><p>Investigate your study patterns using your actual saved records.</p></div>
      <button className="btn btn-primary" onClick={analyze} disabled={generating}><i className="bi bi-stars me-2" />{generating ? "Analyzing..." : "Analyze my study habits"}</button>
    </div>
    {error && <div className="alert alert-danger">{error}</div>}
    {!analysis ? <Card title="No analysis yet" content={<div><p className="text-secondary">Record study sessions and add subjects before requesting an analysis.</p><button className="btn btn-primary" onClick={analyze} disabled={generating}>Analyze My Study Habits</button></div>} /> : <div className="row g-4">
      <div className="col-lg-8 d-flex flex-column gap-4">
        <Card title="Latest analysis" content={<div>
          <div className="d-flex justify-content-between flex-wrap gap-2 mb-3"><span className="badge bg-light text-dark border">{analysis.provider === "gemini" ? "Gemini generated" : "Deterministic fallback"}</span><small className="text-secondary">Generated {new Date(analysis.createdAt).toLocaleString()}</small></div>
          <p>{analysis.summary}</p>
          {analysis.dataPeriodStart && <p className="small text-secondary mb-0">Data period: {new Date(analysis.dataPeriodStart).toLocaleDateString()} – {new Date(analysis.dataPeriodEnd).toLocaleDateString()} · {analysis.recordCounts?.sessions || 0} sessions reviewed</p>}
        </div>} />
        <Card title="Findings" content={analysis.insights?.length ? <div className="d-flex flex-column gap-3">{analysis.insights.map((item,index)=><div key={index} className="border-start border-3 border-primary ps-3"><strong>{item.title}</strong><div>{item.explanation}</div>{item.evidence?.length>0&&<div className="small text-secondary">Evidence: {item.evidence.join ? item.evidence.join(", ") : JSON.stringify(item.evidence)}</div>}</div>)}</div> : <p className="text-secondary mb-0">No subject-level finding could be verified from the available records.</p>} />
        <Card title="Action recommendations" content={analysis.recommendations?.length ? <ul className="mb-0">{analysis.recommendations.map((item,index)=><li key={index}>{item}</li>)}</ul> : <p className="text-secondary mb-0">No recommendation is available until more data is recorded.</p>} />
      </div>
      <div className="col-lg-4 d-flex flex-column gap-4">
        <Card title="Evidence used" content={<div>{analysis.evidence?.length ? analysis.evidence.map((item,index)=><div key={index} className="border rounded p-3 mb-2 bg-light">
          {Object.entries(item || {}).map(([label,value]) => {
            const formattedLabel = label.replace(/([A-Z])/g, " $1").replace(/^./, (character) => character.toUpperCase());
            const formattedValue = typeof value === "object" && value !== null ? JSON.stringify(value) : String(value);
            return <div key={label} className="d-flex justify-content-between gap-3 py-1 border-bottom"><span className="text-secondary">{formattedLabel}</span><strong className="text-end">{formattedValue}</strong></div>;
          })}
        </div>) : <p className="text-secondary mb-0">No evidence metadata was saved.</p>}</div>} />
        <Card title="Warnings" content={analysis.warnings?.length ? <ul className="mb-0">{analysis.warnings.map((item,index)=><li key={index}><strong>{item.title}</strong>: {item.action}</li>)}</ul> : <p className="text-secondary mb-0">No missed or consistency warnings are visible in the analysis period.</p>} />
        <Card title="Saved history" content={history.length ? <div className="d-flex flex-column gap-2">{history.slice(0,10).map(item=><button key={item._id} className="btn btn-sm btn-outline-secondary text-start" onClick={()=>setAnalysis(item)}><strong>{new Date(item.createdAt).toLocaleString()}</strong><br/><small>{item.provider} · {item.recordCounts?.sessions || 0} sessions</small></button>)}</div> : <p className="text-secondary mb-0">No saved analyses.</p>} />
      </div>
    </div>}
  </main>;
}
