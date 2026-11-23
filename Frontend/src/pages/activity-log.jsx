import { useEffect, useState } from "react";
import Card from "../components/Card";
import { api } from "../services/api";

export default function ActivityLog() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.get("/dashboard");
        setEntries(response.data.data.activityLog || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return <div className="container mt-4" style={{ position: "relative", top: 59 }}><h2>Activity Log</h2><p>Loading activity log...</p></div>;
  }

  const filteredEntries = filter === "All" ? entries : entries.filter((e) => e.type === filter);

  return (
    <div className="container d-flex flex-column gap-4 mt-4" style={{ position: "relative", top: 59, paddingBottom: "40px" }}>
      <div className="mb-2">
        <h2 style={{ fontSize: "2rem", fontWeight: 700, color: "#2c3e50", marginBottom: "0.5rem" }}>Activity Log</h2>
        <p style={{ color: "#7f8c8d", marginBottom: 0 }}>Review your detailed study sessions and productivity</p>
      </div>
      <div className="d-flex gap-4 flex-wrap justify-content-center">
        <Card
          width="100%"
          icon="📊"
          title="Study Sessions"
          content={
            <>
              <div className="d-flex align-items-center justify-content-between gap-3 flex-wrap mb-3">
                <select className="form-select w-auto" value={filter} onChange={(e) => setFilter(e.target.value)} style={{ maxWidth: "180px" }}>
                  <option>All</option>
                  {Array.from(new Set(entries.map((entry) => entry.type))).map((type) => (
                    <option key={type}>{type}</option>
                  ))}
                </select>
                <span style={{ color: "#7f8c8d", fontSize: "0.9rem" }}>{filteredEntries.length} session{filteredEntries.length !== 1 ? "s" : ""}</span>
              </div>

              {filteredEntries.length === 0 ? (
                <p style={{ color: "#95a5a6", fontStyle: "italic", textAlign: "center", padding: "20px 0" }}>No sessions found</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0" style={{ fontSize: "0.9rem" }}>
                    <thead>
                      <tr style={{ borderBottom: "2px solid #ecf0f1" }}>
                        <th scope="col" style={{ color: "#2c3e50", fontWeight: 600 }}>Date & Time</th>
                        <th scope="col" style={{ color: "#2c3e50", fontWeight: 600 }}>Topic</th>
                        <th scope="col" style={{ color: "#2c3e50", fontWeight: 600 }}>Duration</th>
                        <th scope="col" style={{ color: "#2c3e50", fontWeight: 600 }}>Focus Score & Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEntries.map((entry) => (
                        <tr key={entry._id || entry.datetime} style={{ borderBottom: "1px solid #ecf0f1" }}>
                          <td style={{ color: "#555" }}>{new Date(entry.datetime).toLocaleString()}</td>
                          <td><span style={{ background: "#e3f2fd", color: "#1976d2", padding: "4px 8px", borderRadius: "4px", fontWeight: 500 }}>{entry.type}</span></td>
                          <td style={{ color: "#555" }}>{entry.duration} hrs</td>
                          <td style={{ color: "#555", fontSize: "0.85rem" }}>{entry.notes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          }
        />
      </div>
    </div>
  );
}
