# Similar Problems & Community Solutions Feature

## Overview
The Similar Problems feature allows users to find and collaborate on civic issues that are occurring in their area. After analyzing a complaint, users can:

1. **View Similar Problems** - See other reported issues of the same type in their area
2. **Share Solutions** - Suggest solutions or fixes for community problems
3. **Rate Solutions** - Provide feedback on suggested solutions with a 5-star rating system
4. **Leverage Community Knowledge** - Benefit from collective problem-solving efforts

## Architecture

### Backend API Endpoints

#### 1. **GET `/similar-problems`**
Retrieves problems similar to the one just analyzed.

**Query Parameters:**
- `issue_type` (string, required) - The type of issue (e.g., "Pothole", "Broken Light")
- `area` (string, required) - Geographic area/locality
- `user_id` (string, required) - Current user ID to exclude their own complaints

**Response:**
```json
{
  "success": true,
  "total": 5,
  "problems": [
    {
      "id": "complaint_id_123",
      "user_id": "user_456",
      "complaint_text": "Pothole on Main Street",
      "ai_decision": {
        "issue_type": "Pothole",
        "area": "Downtown",
        "priority": "High",
        "department": "Road Maintenance"
      },
      "created_at": "2024-01-17T10:30:00Z"
    }
  ]
}
```

#### 2. **POST `/suggestions`**
Submits a new suggestion/solution for a problem.

**Request Body:**
```json
{
  "complaint_id": "complaint_id_123",
  "user_id": "user_456",
  "suggestion_text": "Fill the pothole with asphalt patch material"
}
```

**Response:**
```json
{
  "success": true,
  "suggestion_id": "suggestion_xyz",
  "suggestion": {
    "id": "suggestion_xyz",
    "complaint_id": "complaint_id_123",
    "user_id": "user_456",
    "suggestion_text": "Fill the pothole with asphalt...",
    "rating": 0,
    "helpful_count": 0,
    "ratings": [],
    "created_at": "2024-01-17T10:35:00Z"
  }
}
```

#### 3. **GET `/suggestions/:complaint_id`**
Retrieves all suggestions for a specific complaint.

**Response:**
```json
{
  "success": true,
  "complaint_id": "complaint_id_123",
  "total": 3,
  "suggestions": [
    {
      "id": "suggestion_xyz",
      "complaint_id": "complaint_id_123",
      "user_id": "user_456",
      "suggestion_text": "Fill with asphalt patch",
      "rating": 4.5,
      "helpful_count": 9,
      "ratings": [
        {"user_id": "user_789", "rating": 5},
        {"user_id": "user_012", "rating": 4}
      ],
      "created_at": "2024-01-17T10:35:00Z"
    }
  ]
}
```

#### 4. **POST `/suggestions/:suggestion_id/rate`**
Rates a suggestion on a scale of 0-5 stars.

**Request Body:**
```json
{
  "user_id": "user_789",
  "rating": 4
}
```

**Response:**
```json
{
  "success": true,
  "message": "Rating submitted successfully"
}
```

### Frontend Components

#### **SimilarProblems.jsx** (`src/components/SimilarProblems.jsx`)
Main component displaying similar problems and managing suggestions workflow.

**Key Features:**
- Displays similar problems in the user's area
- Expandable problem cards
- Embedded suggestion list with ratings
- Form to submit new suggestions
- Star rating system (1-5 stars)
- Real-time UI updates

**Props:**
- `complaintData` - The analyzed complaint object
- `userId` - Current user's ID
- `onBack` - Callback to return to complaint page

**State Management:**
- `similarProblems` - List of fetched similar problems
- `suggestions` - Indexed by complaint ID, contains arrays of suggestions
- `newSuggestion` - Indexed by problem ID, stores form input
- `expandedProblem` - Tracks which problem card is expanded
- `selectedRatings` - Tracks user's ratings

#### **App.jsx** Updates
- Added `currentPage` state to switch between "complaint" and "similar-problems" pages
- Added `userId` state with localStorage persistence
- Updated `/analyze` endpoint to include `user_id`
- Added orange "Find Similar Problems & Share Solutions" button after analysis
- Added conditional rendering for page switching

## User Workflow

### Step 1: Report an Issue
User describes a civic problem (pothole, broken light, etc.) with optional image/video

### Step 2: AI Analysis
System analyzes the complaint and categorizes it:
- Issue Type
- Priority Level
- Responsible Department
- Geographic Area
- SLA (Service Level Agreement)

### Step 3: Discover Similar Problems
After analysis, user can click "🔍 Find Similar Problems & Share Solutions" to see:
- Other reported issues of same type in the area
- How long they've been reported
- Priority levels

### Step 4: Contribute Solutions
User can expand each similar problem and:
- View existing suggestions from other users
- See ratings for each suggestion
- Add their own suggestion

### Step 5: Rate Solutions
User can rate helpful suggestions 1-5 stars, helping others find effective solutions

## Data Model

### Complaints
```javascript
{
  id: string,
  user_id: string,
  complaint_text: string,
  has_image: boolean,
  ai_decision: {
    issue_type: string,
    area: string,
    priority: string,
    department: string,
    summary: string,
    sla_hours: number,
    risk_level: string
  },
  created_at: Date
}
```

### Suggestions
```javascript
{
  id: string,
  complaint_id: string,
  user_id: string,
  suggestion_text: string,
  ratings: [
    { user_id: string, rating: number }
  ],
  rating: number,        // Average rating
  helpful_count: number, // Count of ratings >= 3
  created_at: Date
}
```

## Styling
All components styled with inline styles for consistency. CSS classes available in `App.css`:
- `.similar-problems-container` - Main container
- `.problem-card` - Individual problem card
- `.suggestion-item` - Individual suggestion
- `.star-rating` - Rating display
- `.submit-suggestion-btn` - Submit button

## Key Features

### 1. Location-Based Filtering
Problems are matched by:
- Exact geographic area match
- Same issue type

### 2. Smart Sorting
- Problems sorted by newest first
- Suggestions sorted by helpful count (most helpful first)

### 3. Rating System
- 0-5 star scale
- Averages user ratings
- Tracks number of "helpful" votes (rating >= 3)
- Prevents duplicate user ratings

### 4. Community Engagement
- Users see real-time feedback on their contributions
- Helps build collective knowledge base
- Encourages participation in civic improvement

## Future Enhancements

1. **Solution Implementation Tracking**
   - Mark solutions as "tried" or "effective"
   - Track resolution status of problems

2. **Authority Collaboration**
   - Integrate with municipality responses
   - Show official status updates

3. **Advanced Filtering**
   - Filter by date range
   - Filter by rating threshold
   - Filter by solution status

4. **Notifications**
   - Notify users when problems are resolved
   - Alert when suggestions get new ratings

5. **Analytics**
   - Track most common issues per area
   - Show solution effectiveness metrics
   - Identify recurring problem areas

## Testing

### Test Scenario 1: Basic Similar Problems
1. Submit complaint: "Pothole on Main Street" in "Downtown"
2. Click "Find Similar Problems"
3. Verify similar complaints appear
4. Expand a problem and view suggestions

### Test Scenario 2: Submit Solution
1. View similar problems
2. Expand a problem
3. Enter suggestion: "Fill with asphalt"
4. Click "Submit Suggestion"
5. Verify suggestion appears in list

### Test Scenario 3: Rate Solutions
1. View suggestions for a problem
2. Click on 3-5 stars
3. Verify rating updates
4. Check that helpful count increases

## Technical Notes

- **Error Handling**: Comprehensive try-catch blocks with user-friendly messages
- **Performance**: Limits similar problems to 10 most recent
- **Database Agnostic**: Works with both Firestore and in-memory storage
- **User Persistence**: Uses localStorage for anonymous user tracking
- **Real-time Updates**: Manual refetch after actions (no WebSocket)

## Files Modified/Created

### Created:
- `src/components/SimilarProblems.jsx` - New feature component
- `SIMILAR_PROBLEMS_FEATURE.md` - This documentation

### Modified:
- `src/App.jsx` - Added routing and userId state
- `src/App.css` - Added styling for new components
- `civic-backend/index.js` - Added 4 new API endpoints

## Dependencies
All features use existing dependencies:
- React (useState, useEffect)
- Fetch API (built-in)
- No additional npm packages required
