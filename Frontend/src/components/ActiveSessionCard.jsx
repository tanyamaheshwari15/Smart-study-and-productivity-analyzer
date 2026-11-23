import Card from "./Card";
import { useNavigate } from "react-router-dom";

export default function ActiveSessionCard({ sessionTime }) {
  const navigate = useNavigate();
  return (
    <Card 
      width="460px" 
      height="200px" 
      title="Active Study Session" 
      content={
        <>
          <h1>{sessionTime}</h1>
          <button type="button" className="btn btn-primary me-3" onClick={() => navigate("/study-timer")}>Open Timer</button>
          <button type="button" className="btn btn-outline-dark m-3" onClick={() => navigate("/activity-log")}>View Sessions</button>
        </>
      }
    />
  );
}
