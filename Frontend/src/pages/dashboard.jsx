import Card from "../components/Card";
export default function Dashboard() {
    return (
        <>
        <div className="container d-flex flex-column gap-4 mt-4" style={{position:"relative",top:59}}>
        <h2>Smart Dashboard</h2>
        <div className="d-flex gap-4 flex-wrap">
        <Card width="800px" height="200px" title="Card 1" content="This is the content for the first card." />
        <Card width="460px" height="200px" title="Card 2" content="This is the content for the second card." />
        <Card width="800px" height="200px" title="Card 3" content="This is the content for the third card." />
        <Card width="460px" height="200px" title="Card 4" content="This is the content for the fourth card." />
        </div>
        </div>

        </>
    )
}