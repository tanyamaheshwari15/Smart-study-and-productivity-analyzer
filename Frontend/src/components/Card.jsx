export default function Card({ title, content, width, height }) {
  return (
    <div 
      className="card shadow p-4"
      style={{ width: width, height: height }}
    >
      <h5>{title}</h5>
      <div>{content}</div>
    </div>
  );
}