import Card from "../components/Card";
export default function Goals() {
    return (
        <>
        <div className="container d-flex flex-column gap-4 mt-4" style={{position:"relative",top:59}}>
        <h2>Goals and Performance</h2>
        <div className="d-flex gap-4 flex-wrap justify-content-center">
        <Card width="1250px" height="200px" title="Card 1" content="This is the content for the first card." />
        <Card width="1250px" height="200px" title="Card 2" content="This is the content for the second card." />
        </div>
        </div>
        </>
    )
}