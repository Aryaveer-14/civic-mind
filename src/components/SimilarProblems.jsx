import { useState, useEffect } from "react";

function SimilarProblems({ complaintData, userId, onBack }) {
  const [similarProblems, setSimilarProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState({});
  const [expandedProblem, setExpandedProblem] = useState(null);
  const [newSuggestion, setNewSuggestion] = useState({});
  const [submittingSuggestion, setSubmittingSuggestion] = useState(null);
  const [selectedRatings, setSelectedRatings] = useState({});

  // Fetch similar problems
  useEffect(() => {
    const fetchSimilarProblems = async () => {
      try {
        setLoading(true);
        setError("");

        const issueType = complaintData.ai_decision?.issue_type;
        const area = complaintData.ai_decision?.area;

        if (!issueType || !area) {
          setError("Unable to determine issue type or area from complaint");
          setLoading(false);
          return;
        }

        const response = await fetch(
          `http://localhost:5000/similar-problems?issue_type=${encodeURIComponent(issueType)}&area=${encodeURIComponent(area)}&user_id=${userId}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch similar problems");
        }

        setSimilarProblems(data.problems || []);

        // Fetch suggestions for each problem
        data.problems?.forEach(async (problem) => {
          await fetchSuggestionsForProblem(problem.id);
        });
      } catch (err) {
        console.error("Error fetching similar problems:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSimilarProblems();
  }, [complaintData, userId]);

  // Fetch suggestions for a specific problem
  const fetchSuggestionsForProblem = async (complaintId) => {
    try {
      const response = await fetch(`http://localhost:5000/suggestions/${complaintId}`);
      const data = await response.json();

      if (response.ok) {
        setSuggestions((prev) => ({
          ...prev,
          [complaintId]: data.suggestions || []
        }));
      }
    } catch (err) {
      console.error(`Error fetching suggestions for ${complaintId}:`, err);
    }
  };

  // Submit a new suggestion
  const handleSubmitSuggestion = async (problemId) => {
    const suggestionText = newSuggestion[problemId]?.trim();

    if (!suggestionText) {
      alert("Please enter a suggestion");
      return;
    }

    try {
      setSubmittingSuggestion(problemId);

      const response = await fetch("http://localhost:5000/suggestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          complaint_id: problemId,
          user_id: userId,
          suggestion_text: suggestionText
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit suggestion");
      }

      // Add new suggestion to list
      setSuggestions((prev) => ({
        ...prev,
        [problemId]: [...(prev[problemId] || []), data.suggestion]
      }));

      // Clear input
      setNewSuggestion((prev) => ({
        ...prev,
        [problemId]: ""
      }));
    } catch (err) {
      alert("Error submitting suggestion: " + err.message);
    } finally {
      setSubmittingSuggestion(null);
    }
  };

  // Rate a suggestion
  const handleRateSuggestion = async (suggestionId, rating) => {
    try {
      const response = await fetch(
        `http://localhost:5000/suggestions/${suggestionId}/rate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            user_id: userId,
            rating
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to rate suggestion");
      }

      // Update selected rating
      setSelectedRatings((prev) => ({
        ...prev,
        [suggestionId]: rating
      }));

      // Refetch suggestions to update ratings
      const problemId = Object.keys(suggestions).find((key) =>
        suggestions[key].some((s) => s.id === suggestionId)
      );
      if (problemId) {
        await fetchSuggestionsForProblem(problemId);
      }
    } catch (err) {
      alert("Error rating suggestion: " + err.message);
    }
  };

  const renderStarRating = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} style={{ color: i <= Math.round(rating) ? "#FFD700" : "#ccc" }}>
          ★
        </span>
      );
    }
    return stars;
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <button
        onClick={onBack}
        style={{
          padding: "8px 16px",
          backgroundColor: "#6c757d",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          marginBottom: "20px"
        }}
      >
        ← Back to Complaint
      </button>

      <h2>🔍 Similar Problems in {complaintData.ai_decision?.area}</h2>
      <p style={{ color: "#666", marginBottom: "20px" }}>
        Issue Type: <b>{complaintData.ai_decision?.issue_type}</b>
      </p>

      {loading && <p style={{ color: "#007bff" }}>⏳ Loading similar problems...</p>}
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

      {!loading && similarProblems.length === 0 && !error && (
        <p style={{ color: "#888" }}>
          No similar problems found in your area yet. Be the first to report this issue!
        </p>
      )}

      {!loading && similarProblems.length > 0 && (
        <div>
          <p style={{ color: "#666", marginBottom: "15px" }}>
            Found <b>{similarProblems.length}</b> similar issue(s) in your area
          </p>

          {similarProblems.map((problem) => (
            <div
              key={problem.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "15px",
                marginBottom: "15px",
                backgroundColor: "#f9f9f9"
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "start",
                  marginBottom: "10px"
                }}
              >
                <div style={{ flex: 1 }}>
                  <p style={{ marginTop: 0, marginBottom: "5px", fontWeight: "bold" }}>
                    📍 {problem.ai_decision?.issue_type}
                  </p>
                  <p style={{ marginTop: 0, marginBottom: "5px", color: "#666", fontSize: "14px" }}>
                    {problem.complaint_text}
                  </p>
                  <p style={{ marginTop: "5px", color: "#999", fontSize: "12px" }}>
                    📅 {new Date(problem.created_at).toLocaleDateString()} •{" "}
                    <b>Priority:</b> {problem.ai_decision?.priority}
                  </p>
                </div>
                <button
                  onClick={() =>
                    setExpandedProblem(expandedProblem === problem.id ? null : problem.id)
                  }
                  style={{
                    padding: "8px 12px",
                    backgroundColor: "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    marginLeft: "10px",
                    whiteSpace: "nowrap"
                  }}
                >
                  {expandedProblem === problem.id ? "▼ Collapse" : "▶ Expand"}
                </button>
              </div>

              {expandedProblem === problem.id && (
                <div style={{ marginTop: "15px", paddingTop: "15px", borderTop: "1px solid #ddd" }}>
                  {/* Existing Suggestions */}
                  <div style={{ marginBottom: "15px" }}>
                    <h4 style={{ marginTop: 0, marginBottom: "10px" }}>
                      💡 Suggestions ({(suggestions[problem.id] || []).length})
                    </h4>

                    {(suggestions[problem.id] || []).length === 0 ? (
                      <p style={{ color: "#888", fontSize: "14px" }}>
                        No suggestions yet. Be the first to suggest a solution!
                      </p>
                    ) : (
                      <div style={{ marginBottom: "15px" }}>
                        {(suggestions[problem.id] || []).map((suggestion) => (
                          <div
                            key={suggestion.id}
                            style={{
                              backgroundColor: "#fff",
                              border: "1px solid #e0e0e0",
                              borderRadius: "6px",
                              padding: "12px",
                              marginBottom: "10px"
                            }}
                          >
                            <div style={{ marginBottom: "8px" }}>
                              <p style={{ marginTop: 0, marginBottom: "5px", fontSize: "14px" }}>
                                {suggestion.suggestion_text}
                              </p>
                              <p style={{ marginTop: "5px", color: "#999", fontSize: "12px" }}>
                                {new Date(suggestion.created_at).toLocaleDateString()}
                              </p>
                            </div>

                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                marginTop: "8px"
                              }}
                            >
                              <div style={{ display: "flex", gap: "5px" }}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    onClick={() => handleRateSuggestion(suggestion.id, star)}
                                    style={{
                                      backgroundColor: "transparent",
                                      border: "none",
                                      fontSize: "20px",
                                      cursor: "pointer",
                                      color: star <= (selectedRatings[suggestion.id] || Math.round(suggestion.rating || 0))
                                        ? "#FFD700"
                                        : "#ccc",
                                      transition: "color 0.2s"
                                    }}
                                    title={`Rate ${star} star${star !== 1 ? "s" : ""}`}
                                  >
                                    ★
                                  </button>
                                ))}
                              </div>
                              <span
                                style={{
                                  fontSize: "13px",
                                  color: "#666",
                                  marginLeft: "5px"
                                }}
                              >
                                {suggestion.rating ? suggestion.rating.toFixed(1) : "0"} ⭐ (
                                {suggestion.helpful_count || 0} found helpful)
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Add New Suggestion */}
                  <div style={{ marginTop: "15px", paddingTop: "15px", borderTop: "1px solid #ddd" }}>
                    <h4 style={{ marginTop: 0, marginBottom: "10px" }}>💬 Suggest a Solution</h4>
                    <textarea
                      placeholder="Share your suggestion or solution for this issue..."
                      value={newSuggestion[problem.id] || ""}
                      onChange={(e) =>
                        setNewSuggestion((prev) => ({
                          ...prev,
                          [problem.id]: e.target.value
                        }))
                      }
                      style={{
                        width: "100%",
                        height: "80px",
                        padding: "10px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        fontFamily: "Arial",
                        marginBottom: "10px",
                        boxSizing: "border-box"
                      }}
                    />
                    <button
                      onClick={() => handleSubmitSuggestion(problem.id)}
                      disabled={submittingSuggestion === problem.id}
                      style={{
                        padding: "8px 16px",
                        backgroundColor: submittingSuggestion === problem.id ? "#ccc" : "#4CAF50",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: submittingSuggestion === problem.id ? "not-allowed" : "pointer",
                        fontWeight: "bold"
                      }}
                    >
                      {submittingSuggestion === problem.id ? "⏳ Submitting..." : "✅ Submit Suggestion"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SimilarProblems;
