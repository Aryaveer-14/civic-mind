import { useState, useEffect } from "react";

function Dashboard({ userId, onViewSimilarProblems }) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`http://localhost:5000/user/${userId}/complaints`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch complaints");
        }

        setComplaints(data.complaints || []);
      } catch (err) {
        console.error("Error fetching complaints:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, [userId]);

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "critical":
        return "#d32f2f";
      case "high":
        return "#f57c00";
      case "medium":
        return "#fbc02d";
      case "low":
        return "#388e3c";
      default:
        return "#666";
    }
  };

  const getRiskColor = (risk) => {
    switch (risk?.toLowerCase()) {
      case "critical":
        return "#d32f2f";
      case "high":
        return "#f57c00";
      case "moderate":
        return "#fbc02d";
      case "low":
        return "#388e3c";
      default:
        return "#666";
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h2>📋 My Complaints Dashboard</h2>
      <p style={{ color: "#666", marginBottom: "20px" }}>
        Track your reported civic issues and find similar problems in your area
      </p>

      {loading && <p style={{ color: "#007bff" }}>⏳ Loading your complaints...</p>}

      {error && (
        <p
          style={{
            color: "#d32f2f",
            backgroundColor: "#ffebee",
            padding: "10px",
            borderRadius: "4px"
          }}
        >
          ❌ {error}
        </p>
      )}

      {!loading && complaints.length === 0 && !error && (
        <div
          style={{
            backgroundColor: "#f5f5f5",
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "30px",
            textAlign: "center"
          }}
        >
          <p style={{ color: "#888", fontSize: "16px", margin: 0 }}>
            📭 You haven't submitted any complaints yet.
          </p>
          <p style={{ color: "#999", fontSize: "14px" }}>
            Start by reporting an issue on the complaint page!
          </p>
        </div>
      )}

      {!loading && complaints.length > 0 && (
        <div>
          <p style={{ color: "#666", marginBottom: "15px", fontSize: "14px" }}>
            📊 Total Complaints: <b>{complaints.length}</b>
          </p>

          <div
            style={{
              display: "grid",
              gap: "15px"
            }}
          >
            {complaints.map((complaint) => (
              <div
                key={complaint.id}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  padding: "15px",
                  backgroundColor: "#f9f9f9",
                  transition: "box-shadow 0.2s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={{ marginBottom: "10px" }}>
                  <p style={{ margin: "0 0 5px 0", fontWeight: "bold", fontSize: "16px" }}>
                    🔹 {complaint.ai_decision?.issue_type}
                  </p>
                  <p style={{ margin: "0 0 8px 0", color: "#666", fontSize: "14px" }}>
                    {complaint.complaint_text}
                  </p>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "10px",
                    fontSize: "13px",
                    marginBottom: "12px"
                  }}
                >
                  <div>
                    <span style={{ color: "#999" }}>📍 Area:</span>
                    <p style={{ margin: "3px 0 0 0", color: "#333", fontWeight: "500" }}>
                      {complaint.ai_decision?.area}
                    </p>
                  </div>

                  <div>
                    <span style={{ color: "#999" }}>🏢 Department:</span>
                    <p style={{ margin: "3px 0 0 0", color: "#333", fontWeight: "500" }}>
                      {complaint.ai_decision?.department}
                    </p>
                  </div>

                  <div>
                    <span style={{ color: "#999" }}>⚡ Priority:</span>
                    <p
                      style={{
                        margin: "3px 0 0 0",
                        color: getPriorityColor(complaint.ai_decision?.priority),
                        fontWeight: "bold"
                      }}
                    >
                      {complaint.ai_decision?.priority}
                    </p>
                  </div>

                  <div>
                    <span style={{ color: "#999" }}>⚠️ Risk:</span>
                    <p
                      style={{
                        margin: "3px 0 0 0",
                        color: getRiskColor(complaint.ai_decision?.risk_level),
                        fontWeight: "bold"
                      }}
                    >
                      {complaint.ai_decision?.risk_level}
                    </p>
                  </div>

                  <div>
                    <span style={{ color: "#999" }}>⏱️ SLA:</span>
                    <p style={{ margin: "3px 0 0 0", color: "#333", fontWeight: "500" }}>
                      {complaint.ai_decision?.sla_hours} hours
                    </p>
                  </div>

                  <div>
                    <span style={{ color: "#999" }}>📅 Reported:</span>
                    <p style={{ margin: "3px 0 0 0", color: "#333", fontWeight: "500" }}>
                      {new Date(complaint.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {complaint.ai_decision?.summary && (
                  <div
                    style={{
                      backgroundColor: "#fff",
                      border: "1px solid #e0e0e0",
                      borderRadius: "6px",
                      padding: "10px",
                      marginBottom: "12px",
                      fontSize: "13px",
                      color: "#555"
                    }}
                  >
                    <p style={{ margin: "0 0 5px 0", fontWeight: "bold", color: "#333" }}>
                      📝 Summary:
                    </p>
                    <p style={{ margin: 0 }}>
                      {complaint.ai_decision.summary}
                    </p>
                  </div>
                )}

                <button
                  onClick={() => onViewSimilarProblems(complaint)}
                  style={{
                    padding: "10px 16px",
                    backgroundColor: "#FF9800",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    fontSize: "14px",
                    transition: "background-color 0.2s"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#F57C00";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#FF9800";
                  }}
                >
                  🔍 Find Similar Problems & Solutions
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
