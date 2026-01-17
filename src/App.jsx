import { useState, useEffect } from "react";
import "./App.css";
import API_BASE_URL from "./api";
import SimilarProblems from "./components/SimilarProblems";
import Dashboard from "./components/Dashboard";

function App() {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null); // Changed from 'image' to 'file' to support both images and videos
  const [preview, setPreview] = useState(null);
  const [fileType, setFileType] = useState(""); // Track file type (image or video)
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const [stats, setStats] = useState(null);
  const [currentPage, setCurrentPage] = useState("complaint"); // "complaint", "dashboard", or "similar-problems"
  const [userId, setUserId] = useState(localStorage.getItem("user_id") || "anonymous_user");
  const [selectedComplaint, setSelectedComplaint] = useState(null); // For dashboard selected complaint

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const fileExtension = selectedFile.type.split("/")[0]; // Get 'image' or 'video'
      
      // Check file size (10MB limit)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB");
        return;
      }
      
      setFile(selectedFile);
      setFileType(fileExtension);
      setError(""); // Clear any previous errors
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const analyzeComplaint = async () => {
    if (!text.trim() && !file) {
      setError("Please enter a complaint or upload a photo/video");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    setFeedbackGiven(false);

    try {
      const formData = new FormData();
      formData.append("text", text.trim());
      formData.append("user_id", userId);
      if (file) {
        formData.append("image", file); // Backend still expects 'image' field
      }

      console.log("Sending request to backend...");
      const response = await fetch(`${API_BASE_URL}/analyze`, {
        method: "POST",
        body: formData
      });

      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Response data:", data);

      if (!response.ok) {
        throw new Error(data.error || data.details || "Something went wrong");
      }

      setResult(data);
      setText(""); // Clear the textarea after successful submission
      setFile(null);
      setPreview(null);
    } catch (err) {
      console.error("Error details:", err);
      setError("❌ " + (err.message || "Backend not reachable. Make sure backend is running on port 5000"));
    }

    setLoading(false);
  };

  const submitFeedback = async (satisfied) => {
    try {
      await fetch(`${API_BASE_URL}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          complaint_id: result.complaint_id,
          satisfied
        })
      });
      setFeedbackGiven(true);
      fetchStats();
    } catch (err) {
      console.error("Feedback error:", err);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/stats`);
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error("Stats error:", err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }}>
      {/* Navigation Tabs */}
      <div style={{ marginBottom: "30px", borderBottom: "2px solid #ddd" }}>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            onClick={() => {
              setCurrentPage("complaint");
              setResult(null);
              setText("");
              setFile(null);
              setPreview(null);
            }}
            style={{
              padding: "12px 20px",
              backgroundColor: currentPage === "complaint" ? "#007bff" : "#f0f0f0",
              color: currentPage === "complaint" ? "white" : "#333",
              border: "none",
              borderRadius: "4px 4px 0 0",
              cursor: "pointer",
              fontWeight: currentPage === "complaint" ? "bold" : "normal",
              fontSize: "15px",
              transition: "all 0.2s"
            }}
          >
            🆕 New Complaint
          </button>
          <button
            onClick={() => setCurrentPage("dashboard")}
            style={{
              padding: "12px 20px",
              backgroundColor: currentPage === "dashboard" ? "#007bff" : "#f0f0f0",
              color: currentPage === "dashboard" ? "white" : "#333",
              border: "none",
              borderRadius: "4px 4px 0 0",
              cursor: "pointer",
              fontWeight: currentPage === "dashboard" ? "bold" : "normal",
              fontSize: "15px",
              transition: "all 0.2s"
            }}
          >
            📋 My Dashboard
          </button>
        </div>
      </div>

      {/* Pages */}
      {currentPage === "complaint" && (
        <>
          <h2>🧠 Civic Complaint AI (Vite + React)</h2>

      <textarea
        placeholder="Describe your civic issue..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={{ width: "420px", height: "120px", padding: "10px" }}
      />

      <br />
      <div style={{ marginTop: "12px" }}>
        <label style={{ display: "block", marginBottom: "8px" }}>📷 📹 Upload Photo or Video (optional, max 10MB):</label>
        <input 
          type="file" 
          accept="image/*,video/*" 
          onChange={handleFileChange}
          style={{ marginBottom: "12px" }}
        />
        {preview && (
          <div style={{ marginTop: "12px" }}>
            {fileType === "image" ? (
              <img src={preview} alt="Preview" style={{ maxWidth: "300px", border: "1px solid #ccc", borderRadius: "4px" }} />
            ) : fileType === "video" ? (
              <video src={preview} style={{ maxWidth: "300px", border: "1px solid #ccc", borderRadius: "4px" }} controls />
            ) : null}
            <p style={{ fontSize: "12px", color: "#666", marginTop: "8px" }}>📁 File: {file?.name}</p>
          </div>
        )}
      </div>

      <br />
      <button
        onClick={analyzeComplaint}
        disabled={loading}
        style={{ 
          marginTop: "12px", 
          padding: "10px 24px",
          fontSize: "16px",
          backgroundColor: loading ? "#ccc" : "#007bff",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: loading ? "not-allowed" : "pointer",
          fontWeight: "bold"
        }}
      >
        {loading ? "⏳ Analyzing..." : "🚀 Analyze Issue"}
      </button>

      {loading && <p style={{ marginTop: "12px", fontSize: "14px", color: "#007bff" }}>⏳ Processing your complaint with AI...</p>}
      {error && <p style={{ marginTop: "12px", color: "#d32f2f", backgroundColor: "#ffebee", padding: "10px", borderRadius: "4px" }}>{error}</p>}

      {result && (
        <div
          style={{
            marginTop: "20px",
            padding: "15px",
            border: "1px solid #ccc",
            width: "420px"
          }}
        >
          <h3>AI Result</h3>
          <p><b>Issue Type:</b> {result.ai_decision.issue_type}</p>
          <p><b>Priority:</b> {result.ai_decision.priority}</p>
          <p><b>Department:</b> {result.ai_decision.department}</p>
          <p><b>Risk Level:</b> {result.ai_decision.risk_level}</p>
          <p><b>SLA:</b> {result.ai_decision.sla_hours} hours</p>
          <p><b>Summary:</b> {result.ai_decision.summary}</p>
          
          {!feedbackGiven ? (
            <div style={{ marginTop: "15px", paddingTop: "15px", borderTop: "1px solid #ddd" }}>
              <p><b>Was this analysis helpful?</b></p>
              <button
                onClick={() => submitFeedback(true)}
                style={{
                  padding: "8px 20px",
                  marginRight: "10px",
                  backgroundColor: "#4CAF50",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              >
                👍 Yes
              </button>
              <button
                onClick={() => submitFeedback(false)}
                style={{
                  padding: "8px 20px",
                  backgroundColor: "#f44336",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              >
                👎 No
              </button>
            </div>
          ) : (
            <p style={{ marginTop: "15px", color: "green" }}>✓ Thank you for your feedback!</p>
          )}
        </div>
      )}

      {stats && stats.overall && stats.overall.total > 0 && (
        <div
          style={{
            marginTop: "30px",
            padding: "20px",
            border: "1px solid #ccc",
            width: "420px",
            backgroundColor: "#f9f9f9"
          }}
        >
          <h3>📊 Overall Feedback Statistics</h3>
          <p><b>Total Feedback:</b> {stats.overall.total}</p>
          
          <div style={{ marginTop: "15px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
              <span>Satisfied</span>
              <span>{stats.overall.satisfied_percentage.toFixed(1)}%</span>
            </div>
            <div style={{ width: "100%", height: "30px", backgroundColor: "#ddd", borderRadius: "5px", overflow: "hidden" }}>
              <div
                style={{
                  width: `${stats.overall.satisfied_percentage}%`,
                  height: "100%",
                  backgroundColor: "#4CAF50",
                  transition: "width 0.3s ease"
                }}
              />
            </div>
          </div>

          <div style={{ marginTop: "15px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
              <span>Not Satisfied</span>
              <span>{stats.overall.not_satisfied_percentage.toFixed(1)}%</span>
            </div>
            <div style={{ width: "100%", height: "30px", backgroundColor: "#ddd", borderRadius: "5px", overflow: "hidden" }}>
              <div
                style={{
                  width: `${stats.overall.not_satisfied_percentage}%`,
                  height: "100%",
                  backgroundColor: "#f44336",
                  transition: "width 0.3s ease"
                }}
              />
            </div>
          </div>

          {stats.by_issue_type && stats.by_issue_type.length > 0 && (
            <div style={{ marginTop: "30px", paddingTop: "20px", borderTop: "2px solid #ddd" }}>
              <h4>📋 Stats by Issue Type</h4>
              {stats.by_issue_type.map((issueStats, index) => (
                <div key={index} style={{ marginTop: "20px", padding: "15px", backgroundColor: "#fff", borderRadius: "5px", border: "1px solid #e0e0e0" }}>
                  <p style={{ fontWeight: "bold", marginBottom: "10px" }}>🔹 {issueStats.issue_type}</p>
                  <p style={{ fontSize: "14px", color: "#666" }}>Total: {issueStats.total} feedback(s)</p>
                  
                  <div style={{ marginTop: "10px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px", fontSize: "14px" }}>
                      <span>Satisfied</span>
                      <span>{issueStats.satisfied_percentage.toFixed(1)}%</span>
                    </div>
                    <div style={{ width: "100%", height: "25px", backgroundColor: "#ddd", borderRadius: "4px", overflow: "hidden" }}>
                      <div
                        style={{
                          width: `${issueStats.satisfied_percentage}%`,
                          height: "100%",
                          backgroundColor: "#4CAF50",
                          transition: "width 0.3s ease"
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ marginTop: "10px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px", fontSize: "14px" }}>
                      <span>Not Satisfied</span>
                      <span>{issueStats.not_satisfied_percentage.toFixed(1)}%</span>
                    </div>
                    <div style={{ width: "100%", height: "25px", backgroundColor: "#ddd", borderRadius: "4px", overflow: "hidden" }}>
                      <div
                        style={{
                          width: `${issueStats.not_satisfied_percentage}%`,
                          height: "100%",
                          backgroundColor: "#f44336",
                          transition: "width 0.3s ease"
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Find Similar Problems Button */}
          {result && (
            <div style={{ marginTop: "15px" }}>
              <button
                onClick={() => {
                  setCurrentPage("similar-problems");
                  setSelectedComplaint(result);
                }}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#FF9800",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "16px"
                }}
              >
                🔍 Find Similar Problems & Share Solutions
              </button>
            </div>
          )}
        </div>
      )}

      {currentPage === "dashboard" && (
        <Dashboard
          userId={userId}
          onViewSimilarProblems={(complaint) => {
            setSelectedComplaint(complaint);
            setCurrentPage("similar-problems");
          }}
        />
      )}

      {currentPage === "similar-problems" && selectedComplaint && (
        <SimilarProblems
          complaintData={selectedComplaint}
          userId={userId}
          onBack={() => {
            // Go back to the page that led to similar problems
            if (result && selectedComplaint.id === result.complaint_id) {
              setCurrentPage("complaint");
            } else {
              setCurrentPage("dashboard");
            }
          }}
        />
      )}
    </div>
  );
}

export default App;
