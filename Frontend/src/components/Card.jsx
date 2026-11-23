export default function Card({ title, content, width, height, icon }) {
  return (
    <div 
      className="card shadow-sm p-4 rounded-4 border-0 h-100"
      style={{ 
        width: width, 
        height: height,
        background: "linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)",
        transition: "transform 0.3s ease, box-shadow 0.3s ease"
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 12px 24px rgba(0, 0, 0, 0.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "";
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