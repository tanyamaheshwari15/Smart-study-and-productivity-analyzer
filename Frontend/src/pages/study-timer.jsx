import Card from "../components/Card";
export default function StudyTimer() {
    return (
        <>
        <div className="container d-flex flex-column gap-4 mt-4" style={{position:"relative",top:59}}>
        <h2>Study Timer</h2>
        <div className="d-flex gap-4 flex-wrap justify-content-center">
        <Card width="1250px" height="200px" />
        <Card width="1250px" height="200px" title="Session Details" />
        </div>
        </div>

        </>
    )
}