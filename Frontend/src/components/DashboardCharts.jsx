import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const colors = ["#3977c5", "#42a68c", "#e7a54a", "#8769bd", "#df6f6f", "#4b9db6"];
const axis = { fontSize: 11, fill: "#718096" };

function ChartCard({ title, subtitle, children }) {
  return (
    <section className="bg-white rounded-4 p-3 p-lg-4 h-100" style={{ border: "1px solid #e2e8f0", boxShadow: "0 6px 20px rgba(15, 23, 42, .04)" }}>
      <div className="mb-3"><h2 className="h6 fw-bold mb-1">{title}</h2><p className="small text-secondary mb-0">{subtitle}</p></div>
      {children}
    </section>
  );
}

export default function DashboardCharts({ studyData = [], progressData = [] }) {
  const hasStudy = studyData.some((item) => item.study > 0 || item.distraction > 0);
  const hasSubjects = progressData.length > 0;
  return (
    <div className="row g-3 h-100">
      <div className="col-12">
        <ChartCard title="Study activity" subtitle="Recorded study and distraction time · last 7 days">
          {hasStudy ? <div style={{ width: "100%", height: 245 }}>
            <ResponsiveContainer>
              <LineChart data={studyData} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
                <CartesianGrid stroke="#edf1f5" vertical={false} />
                <XAxis dataKey="day" tick={axis} axisLine={false} tickLine={false} />
                <YAxis tick={axis} axisLine={false} tickLine={false} />
                <Tooltip formatter={(value) => [`${value} h`]} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line name="Study" dataKey="study" type="monotone" stroke="#3478c8" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                <Line name="Distraction" dataKey="distraction" type="monotone" stroke="#e59b55" strokeWidth={2} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div> : <div className="d-flex align-items-center justify-content-center text-secondary text-center" style={{ height: 245 }}>Record a study session to see your weekly activity.</div>}
        </ChartCard>
      </div>
      <div className="col-12">
        <ChartCard title="Subject distribution" subtitle="Study time recorded for each subject">
          {hasSubjects ? <div style={{ width: "100%", height: Math.max(190, Math.min(300, progressData.length * 38)) }}>
            <ResponsiveContainer>
              <BarChart data={progressData} layout="vertical" margin={{ top: 4, right: 20, left: 8, bottom: 4 }}>
                <CartesianGrid stroke="#edf1f5" horizontal={false} />
                <XAxis type="number" tick={axis} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="topic" width={90} tick={axis} axisLine={false} tickLine={false} />
                <Tooltip formatter={(value) => [`${value} h`, "Study time"]} />
                <Bar dataKey="hours" name="Study time" radius={[0, 6, 6, 0]} barSize={18}>
                  {progressData.map((item, index) => <Cell key={item.topic} fill={colors[index % colors.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div> : <div className="d-flex align-items-center justify-content-center text-secondary text-center" style={{ height: 190 }}>Add subjects and record sessions to see where your study time goes.</div>}
        </ChartCard>
      </div>
    </div>
  );
}
