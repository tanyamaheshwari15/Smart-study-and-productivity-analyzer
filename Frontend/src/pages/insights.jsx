import { useEffect, useState } from "react";
import Card from "../components/Card";
import { fetchAIInsights } from "../services/api";

export default function Insights() {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadInsights = async () => {
      try {
        const data = await fetchAIInsights();
        setInsights(data);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to fetch AI insights.");
      } finally {
        setLoading(false);
      }
    };

    loadInsights();
  }, []);

  if (loading) {
    return <div className="container mt-4" style={{ position: "relative", top: 59 }}><h2>AI Insights</h2><p>Loading insights...</p></div>;
  }

  if (error) {
    return <div className="container mt-4" style={{ position: "relative", top: 59 }}><h2>AI Insights</h2><div className="alert alert-danger">{error}</div></div>;
  }

  return (
    <div
      className="container mt-4"
      style={{ position: "relative", top: 59 }}
    >
      <h2 className="mb-4">AI Insights</h2>

      <div className="row g-4 justify-content-center">
        <div className="col-lg-6 d-flex flex-column gap-4">
          <Card
            height="260px"
            title="WEEKLY EFFICIENCY & PREDICTED PRODUCTIVITY"
            content={
              <div>
                <p className="mb-2"><strong>Summary:</strong> {insights?.summary}</p>
                <p className="mb-2"><strong>Best study window:</strong> {insights?.bestTime}</p>
                <p className="mb-0"><strong>Focus score:</strong> {insights?.focusScore}/100</p>
              </div>
            }
          />
          <Card
            height="260px"
            title="STUDY EFFICIENCY HEATMAP"
            content={<p>Your progress is derived from actual study sessions saved in MongoDB for your account.</p>}
          />
        </div>

        <div className="col-lg-6 d-flex flex-column gap-4">
          <div className="row g-4">
            <div className="col-6">
              <Card height="150px" title="PEAK PRODUCTIVITY HOURS" content={`You are consistently most productive between ${insights?.bestTime || "8:00 PM and 10:00 PM"}`} />
            </div>
            <div className="col-6">
              <Card height="150px" title="DSA PROGRESS INSIGHTS" content={insights?.recommendations?.[1] || "Keep drilling weak topics daily."} />
            </div>
            <div className="col-6">
              <Card height="150px" title="RECOMMENDED WEAK TOPIC REVIEW" content={insights?.recommendations?.[2] || "Review the lowest-progress topic first."} />
            </div>
            <div className="col-6">
              <Card height="150px" title="PERSONALIZED HABIT TIP" content={insights?.recommendations?.[0] || "Protect your deep-work window."} />
            </div>
          </div>

          <Card
            height="auto"
            title="ADAPTIVE STUDY PLAN"
            content={insights?.plan?.length ? (
              <div className="d-flex flex-column gap-2">
                {insights.plan.map((item, index) => (
                  <div key={index}><strong>{item.day}: {item.topic}</strong><br/><small>{item.durationMinutes} minutes — {item.reason}</small></div>
                ))}
              </div>
            ) : <p className="mb-0">Add study sessions to generate a personalized plan.</p>}
          />
          <Card
            height="150px"
            title="AUTOMATED PROGRESS REPORT"
            content={
              <div>
                <p className="mb-1"><strong>Next action:</strong> {insights?.nextAction}</p>
                <ul className="mb-0 ps-3">
                  {insights?.strengths?.slice(0, 3).map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
}