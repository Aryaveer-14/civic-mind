# Complete Architecture Overview

## Application Structure

```
civic-frontend/
├── src/
│   ├── components/
│   │   ├── Dashboard.jsx              ✅ NEW - Complaint history
│   │   └── SimilarProblems.jsx        ✅ NEW - Issue discovery & solutions
│   ├── App.jsx                        ✅ UPDATED - 3-page routing system
│   ├── App.css                        ✅ STYLES - All components
│   ├── main.jsx
│   ├── index.css
│   └── ...
├── civic-backend/
│   ├── index.js                       ✅ UPDATED - New API endpoint
│   └── ...
├── IMPLEMENTATION_SUMMARY.md          ✅ NEW
├── DASHBOARD_UPDATE.md                ✅ NEW
├── USER_JOURNEY_GUIDE.md              ✅ NEW
├── SIMILAR_PROBLEMS_FEATURE.md        ✅ EXISTING
└── ...
```

---

## Frontend Component Hierarchy

```
App.jsx (Main Router)
├── [Navigation Bar]
│   ├── 🆕 New Complaint Button
│   └── 📋 My Dashboard Button
│
├─ ROUTE 1: currentPage === "complaint"
│  └─ Complaint Form & AI Analysis
│     └─ [🔍 Find Similar Problems] Button
│        └─ onViewSimilarProblems()
│           → setCurrentPage("similar-problems")
│           → setSelectedComplaint(result)
│
├─ ROUTE 2: currentPage === "dashboard"
│  └─ Dashboard.jsx Component
│     ├─ fetchComplaints() on mount
│     ├─ ComplaintCard[] Loop
│     │  └─ [🔍 Find Similar Problems] Per Card
│     │     → onViewSimilarProblems(complaint)
│     │        → setCurrentPage("similar-problems")
│     │        → setSelectedComplaint(complaint)
│     └─ Display: History, Details, Stats
│
└─ ROUTE 3: currentPage === "similar-problems"
   └─ SimilarProblems.jsx Component
      ├─ Fetch: /similar-problems API
      ├─ Display: Similar issue list
      ├─ Fetch: /suggestions/:id API
      ├─ Features:
      │  ├─ Expand/collapse cards
      │  ├─ Submit new suggestion
      │  ├─ Rate suggestions (1-5 stars)
      │  └─ View ratings & helpful counts
      └─ [← Back Button]
         → Smart routing:
            ├─ If from complaint → currentPage = "complaint"
            └─ If from dashboard → currentPage = "dashboard"
```

---

## Data Flow Architecture

### Scenario 1: New Complaint → Similar Problems

```
USER INTERFACE FLOW:
New Complaint Page
       ↓
[Type complaint] + [Upload image]
       ↓
[🚀 Analyze Issue]
       ↓
BACKEND PROCESSING:
POST /analyze
  ├─ Receives: text, image, user_id
  ├─ Calls: analyzeWithGemini()
  ├─ Returns: AI analysis (issue_type, area, priority, etc.)
  ├─ Stores: complaintDatabase
  └─ Returns: complaint_id
       ↓
FRONTEND SHOWS RESULTS:
AI Analysis Display
  ├─ Issue Type
  ├─ Priority
  ├─ Department
  ├─ Risk Level
  ├─ Summary
  └─ [🔍 Find Similar Problems]
       ↓
USER CLICKS "FIND SIMILAR PROBLEMS":
setCurrentPage("similar-problems")
setSelectedComplaint(result)
       ↓
BACKEND PROCESSING:
GET /similar-problems
  ├─ Receives: issue_type, area, user_id
  ├─ Queries: complaintDatabase
  ├─ Filters: Same type + same area
  ├─ Excludes: User's own complaints
  └─ Returns: Array of matching complaints
       ↓
SIMILAR PROBLEMS PAGE:
Display matching issues
  ├─ Per issue:
  │  ├─ Description
  │  ├─ Date reported
  │  ├─ Priority level
  │  └─ [Expand] button
  │
  └─ When expanded:
     ├─ GET /suggestions/:complaint_id
     ├─ Display existing solutions
     ├─ Show ratings (stars + helpful count)
     ├─ Form to submit new suggestion
     ├─ POST /suggestions
     └─ POST /suggestions/:id/rate
```

### Scenario 2: Dashboard → Similar Problems

```
USER INTERFACE FLOW:
Click [📋 My Dashboard]
       ↓
BACKEND PROCESSING:
GET /user/:user_id/complaints
  ├─ Receives: user_id
  ├─ Queries: complaintDatabase
  ├─ Filters: user_id matches
  ├─ Sorts: newest first
  └─ Returns: Array of user's complaints
       ↓
FRONTEND DISPLAYS:
Dashboard Page
  ├─ Each complaint shows:
  │  ├─ Issue type
  │  ├─ Description
  │  ├─ Location (area)
  │  ├─ Department
  │  ├─ Priority (color-coded)
  │  ├─ Risk level (color-coded)
  │  ├─ SLA hours
  │  ├─ Date reported
  │  ├─ AI summary
  │  └─ [🔍 Find Similar Problems]
  │
  └─ User clicks on any complaint's button
       ↓
USER INTERFACE FLOW:
setCurrentPage("similar-problems")
setSelectedComplaint(complaint)
       ↓
[Rest of flow same as Scenario 1]
```

---

## API Endpoints Reference

### Existing Endpoints (Still Used)

```javascript
POST /analyze
├─ Purpose: Analyze new complaint
├─ Input: { text, image?, user_id }
├─ Output: { complaint_id, ai_decision, ... }
└─ Used By: New Complaint page

GET /stats
├─ Purpose: Get feedback statistics
├─ Input: None
├─ Output: { overall, by_issue_type }
└─ Used By: Statistics display on complaint page
```

### Similar Problems Feature Endpoints

```javascript
GET /similar-problems
├─ Purpose: Find similar complaints
├─ Query Params: issue_type, area, user_id
├─ Output: { success, total, problems[] }
└─ Used By: Similar Problems page

POST /suggestions
├─ Purpose: Submit a solution suggestion
├─ Input: { complaint_id, user_id, suggestion_text }
├─ Output: { success, suggestion_id, suggestion }
└─ Used By: Submit solution form

GET /suggestions/:complaint_id
├─ Purpose: Get all solutions for a complaint
├─ Output: { success, complaint_id, total, suggestions[] }
└─ Used By: Display solutions on Similar Problems page

POST /suggestions/:suggestion_id/rate
├─ Purpose: Rate a solution (1-5 stars)
├─ Input: { user_id, rating }
├─ Output: { success, message }
└─ Used By: Star rating system
```

### Dashboard Endpoint

```javascript
GET /user/:user_id/complaints
├─ Purpose: Get user's complaint history
├─ Param: user_id
├─ Output: { success, user_id, total, complaints[] }
└─ Used By: Dashboard page
```

---

## State Management

### App.jsx State

```javascript
// Page Routing
const [currentPage, setCurrentPage] = useState("complaint");
  // Values: "complaint" | "dashboard" | "similar-problems"

// User Identification
const [userId, setUserId] = useState(localStorage.getItem("user_id") || "anonymous_user");
  // Persisted in localStorage
  // Shared across all pages

// Current Complaint Being Analyzed
const [result, setResult] = useState(null);
  // Contains: { complaint_id, ai_decision, ... }
  // Set by: analyzeComplaint()
  // Cleared by: New Complaint tab click

// Selected Complaint (for Similar Problems)
const [selectedComplaint, setSelectedComplaint] = useState(null);
  // Contains: Full complaint object
  // Can be from: result OR dashboard selection
  // Passed to: SimilarProblems component

// New Complaint Form Data
const [text, setText] = useState("");
const [file, setFile] = useState(null);
const [preview, setPreview] = useState(null);
const [fileType, setFileType] = useState("");

// Form Status
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");
const [feedbackGiven, setFeedbackGiven] = useState(false);

// Statistics
const [stats, setStats] = useState(null);
```

### Dashboard.jsx State

```javascript
const [complaints, setComplaints] = useState([]);
  // Set by: fetchComplaints() on mount
  // Displays: User's complete complaint history

const [loading, setLoading] = useState(true);
  // Shows loading indicator while fetching

const [error, setError] = useState("");
  // Shows error if fetch fails
```

### SimilarProblems.jsx State

```javascript
const [similarProblems, setSimilarProblems] = useState([]);
  // Set by: fetchSimilarProblems() on mount
  // Displays: Complaints matching issue_type & area

const [suggestions, setSuggestions] = useState({});
  // Key: complaint_id
  // Value: Array of suggestions
  // Set by: fetchSuggestionsForProblem()

const [newSuggestion, setNewSuggestion] = useState({});
  // Key: complaint_id
  // Value: Form input text
  // Used by: Submit suggestion form

const [expandedProblem, setExpandedProblem] = useState(null);
  // Tracks which problem card is expanded

const [selectedRatings, setSelectedRatings] = useState({});
  // Key: suggestion_id
  // Value: Rating given by current user

const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
const [submittingSuggestion, setSubmittingSuggestion] = useState(null);
```

---

## Component Props

### SimilarProblems Props

```javascript
{
  complaintData: {
    id: string,
    complaint_text: string,
    ai_decision: {
      issue_type: string,
      area: string,
      priority: string,
      department: string,
      summary: string,
      sla_hours: number,
      risk_level: string
    },
    created_at: ISO string
  },
  userId: string,
  onBack: () => void
}
```

### Dashboard Props

```javascript
{
  userId: string,
  onViewSimilarProblems: (complaint) => void
}
```

---

## User ID Persistence

```javascript
// On app load:
const [userId, setUserId] = useState(
  localStorage.getItem("user_id") || "anonymous_user"
);

// When user logs in (future):
localStorage.setItem("user_id", user.id);
setUserId(user.id);

// Used in all API calls:
POST /analyze { text, image, user_id }
GET /user/:user_id/complaints
GET /similar-problems?user_id=X
```

---

## Error Handling Strategy

### Backend Errors

```javascript
// Try-catch blocks on all endpoints
try {
  // Process request
} catch (err) {
  console.error("❌ [Feature] ERROR:", err.message);
  return res.status(500).json({
    success: false,
    error: "Failed to [action]"
  });
}

// Validation errors return 400
if (!required_param) {
  return res.status(400).json({
    success: false,
    error: "Parameter required"
  });
}

// Not found returns 404
if (!found) {
  return res.status(404).json({
    success: false,
    error: "Resource not found"
  });
}
```

### Frontend Error Handling

```javascript
// All fetch calls wrapped
try {
  const response = await fetch(url);
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || "Failed");
  }
  
  // Process data
} catch (err) {
  setError(err.message);
  // Display to user
}
```

---

## Performance Optimizations

1. **Lazy Loading**: Dashboard fetches on mount, not app start
2. **Limited Results**: Similar problems limited to 10 most recent
3. **Indexed Suggestions**: Indexed by complaint_id for fast lookup
4. **Smart Sorting**: Suggestions sorted by helpful count
5. **State Management**: Only fetch what's needed per page

---

## Security Considerations

1. **User ID Validation**: All endpoints validate user_id
2. **Data Filtering**: Users only see others' suggestions, not private data
3. **Complaint Privacy**: Users can't access others' full complaint objects
4. **Input Validation**: All inputs validated before processing
5. **No Sensitive Data**: No passwords, emails, or personal info exposed

---

## Deployment Checklist

- [x] Backend endpoints implemented
- [x] Frontend components created
- [x] Navigation system working
- [x] State management configured
- [x] Error handling in place
- [x] No console errors
- [x] User ID persistence working
- [x] All API calls functional
- [x] Styling complete
- [x] Documentation created
- [ ] Ready for production

---

## Testing Coverage

### Unit Tests Needed
- SimilarProblems component rendering
- Dashboard component rendering
- State updates on navigation
- Error handling

### Integration Tests Needed
- New complaint → Similar problems flow
- Dashboard → Similar problems flow
- Back button navigation
- API endpoint responses

### User Acceptance Tests
- Complete user journeys
- Error scenarios
- Empty states
- Loading states
