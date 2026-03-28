import Card from "../components/Card";
import dashboardData from "../components/dashboardData";
import {LineChart, Line, XAxis, YAxis, BarChart, Bar, Cell} from "recharts";
// BarChart
const getColor = (topic) => {
  if (topic === "Arrays") return "#74cbb1";
  if (topic === "Strings") return "#bb7575";
  if (topic === "Graphs") return "#6ea0b5";
  return "#a17eb1";
};

// Heatmap

export default function Dashboard() {
    return (
        <>
        <div className="container d-flex flex-column gap-4 mt-4" style={{position:"relative",top:59}}>
        <h2>Smart Dashboard</h2>
        <div className="d-flex gap-4 flex-wrap justify-content-center">

        <Card width="800px" height="300px" title="Your Study/Distraction Ration" content={
          <>
          <div className="row align-items-center g-3">

            {/* LEFT → Line Chart */}
          <div className="col-md-6 d-flex flex-wrap">
          <LineChart width={300} height={200} data={dashboardData.studyDistractionData}>
            <XAxis dataKey="day"/>
            <YAxis />
            <Line dataKey="study" type="monotone" stroke="#39c697"/>
            <Line dataKey="distraction" type="monotone" stroke="#ca4230"/>
          </LineChart>
          </div>

          {/* RIGHT-> BAR CHART */}
          <div className="col-md-3">
            <BarChart width={300} height={200} data={dashboardData.dsaProgress} >
              <XAxis dataKey="topic" />
              <YAxis />
              <Bar dataKey="progress">
              {dashboardData.dsaProgress.map((entry, index) => (
                <Cell key={index} fill={getColor(entry.topic)} />
              ))}
            </Bar>
            </BarChart>
          </div>
          </div>
          </>
        }/>

        <Card width="460px" height="200px" title="Active Study Session" content={<>
        <h1>{dashboardData.activeSession.time}</h1>
        <button type="submit" className="btn btn-primary me-3">Start/Stop</button>
        <button type="reset" className="btn btn-outline-dark m-3">Reset</button>
        </>
        }/>

        <Card width="800px" height="220px" title="Activity Tracking" content={
            <>
            <div className="row align-items-center g-3">

              {/* LEFT → Heatmap */}
              <div className="col-md-8 d-grid gap-1" style={{gridTemplateColumns:"repeat(7, 1fr)"}}>
               
              </div>

              {/* RIGHT → Stats */}
                <div className="p-3 border rounded-3 text-center col-md-4">

                  <p className="text-secondary small mb-1">
                    Daily/Weekly Stats
                  </p>

                  <h4 className="mb-1">
                    {dashboardData.stats.todayHours} Hrs
                  </h4>

                  <p className="text-success mb-0">
                    +{dashboardData.stats.yesterdayDiff} Hrs
                  </p>

                  <small className="text-secondary">
                    vs Yesterday
                  </small>

                </div>
                </div>
            </>
          }
        />

        <Card width="460px" height="200px" title="AI Insights" content={
        <>
            <p> Streak maintained! {dashboardData.insights.streak} days strong.</p>
            <p> Insight: You are most productive at {dashboardData.insights.bestTime}</p>
            <p> Tip: Try to tackle weak topics on {dashboardData.insights.tip}</p>
        </>
        } />
        </div>
        </div>
        {/* <pre>{JSON.stringify(dashboardData, null, 2)}</pre> */}
        </>
    )
}