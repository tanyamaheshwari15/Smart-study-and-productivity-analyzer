export default function Card({ title, content, width, height, icon }) {
  return (
    <div 
      className="product-card card p-4 h-100"
      style={{ 
        width: width, 
        height: height,
        background: "#ffffff",
        border: "1px solid #d6d9de",
        boxShadow: "0 2px 8px rgba(31, 41, 55, 0.06)",
        transition: "transform 0.2s ease, box-shadow 0.2s ease"
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 8px 20px rgba(31, 41, 55, 0.12)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 2px 8px rgba(31, 41, 55, 0.06)";
      }}
    >
      <div className="d-flex align-items-center gap-2 mb-3">
        {icon && <span className="text-primary" style={{ fontSize: "1.4rem" }}>{icon}</span>}
        <h6 className="mb-0" style={{ fontSize: "0.95rem", fontWeight: 600, color: "#2c3e50" }}>{title}</h6>
      </div>
      <div style={{ fontSize: "0.95rem", color: "#555", overflowY: "auto" }}>{content}</div>
    </div>
  );
}