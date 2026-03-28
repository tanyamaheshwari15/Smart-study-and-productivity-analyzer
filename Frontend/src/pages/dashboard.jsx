import Card from "../components/Card";
export default function Dashboard() {
    return (
        <>
        <div className="container d-flex flex-column gap-4 mt-4" style={{position:"relative",top:59}}>
        <h2>Smart Dashboard</h2>
        <div className="d-flex gap-4 flex-wrap justify-content-center">
        <Card width="800px" height="200px" title="Your Study/Distraction Ration" />
        <Card width="460px" height="200px" title="Active Study Session"  />
        <Card width="800px" height="200px" title="Activity Tracking"  />
        <Card width="460px" height="200px" title="AI Insights" />
        </div>
        </div>

        </>
    )
}