# Complete User Journey Guide

## Application Structure

The Civic Complaint AI application now has a three-page interface with intuitive navigation:

```
┌─────────────────────────────────────────────────────────┐
│  NAVIGATION BAR                                         │
│  [🆕 New Complaint]  [📋 My Dashboard]                 │
└─────────────────────────────────────────────────────────┘
                            │
            ┌───────────────┼───────────────┐
            │               │               │
     ┌──────▼──────┐  ┌────▼──────┐  ┌───▼─────────────┐
     │   PAGE 1    │  │  PAGE 2   │  │    PAGE 3       │
     │  New        │  │ Dashboard │  │ Similar         │
     │ Complaint   │  │           │  │ Problems        │
     └──────┬──────┘  └────┬──────┘  └───┬─────────────┘
            │              │             │
            │              └─────┬───────┘
            └────────────────────┘
                  (Back buttons)
```

## SCENE 1: New Complaint Page

### What Users See:
- Title: "🧠 Civic Complaint AI (Vite + React)"
- Text area to describe civic issue
- File upload for photos/videos (optional)
- "🚀 Analyze Issue" button
- Results section after analysis

### User Actions:
1. **Describe Problem**
   - Type detailed description: "There's a large pothole on Main Street causing accidents"
   - Optionally upload photo/video for evidence

2. **Click Analyze**
   - App sends complaint + image to backend
   - AI analyzes using Google Gemini
   - Displays results with:
     - 📊 Issue Type: "Road Damage"
     - ⚡ Priority: "High"
     - 🏢 Department: "Public Works"
     - ⚠️ Risk Level: "Moderate"
     - ⏱️ SLA: "24 hours"
     - 📝 Summary: "Large pothole requiring immediate repair..."

3. **View Similar Problems**
   - Click orange button: "🔍 Find Similar Problems & Share Solutions"
   - Navigates to Similar Problems page
   - Shows other potholes reported in same area
   - Can submit solutions
   - Back button returns to New Complaint

4. **Switch to Dashboard**
   - Click "📋 My Dashboard" tab
   - Leaves complaint form as-is
   - Can return later to continue/submit

---

## SCENE 2: Dashboard Page

### What Users See:
- Title: "📋 My Complaints Dashboard"
- Subtitle: "Track your reported civic issues and find similar problems in your area"
- Grid of complaint cards showing:
  - **Issue Details**: Type, full description
  - **Location**: Geographic area where reported
  - **Authority**: Which department handles it
  - **Priority**: Color-coded (Red=Critical, Orange=High, Yellow=Medium, Green=Low)
  - **Risk Level**: Color-coded severity
  - **SLA**: Service level agreement in hours
  - **Date Reported**: When complaint was submitted
  - **AI Summary**: System's analysis of the issue
  - **Action Button**: "🔍 Find Similar Problems & Solutions"

### Visual Layout of Each Card:
```
┌─────────────────────────────────────────┐
│ 🔹 Road Damage - Pothole                │
│ There's a large pothole on Main St...   │
│                                         │
│ 📍 Area: Downtown      🏢 Dept: Public │
│ ⚡ Priority: HIGH      ⚠️ Risk: MOD     │
│ ⏱️ SLA: 24 hrs         📅 Date: 1/17/26│
│                                         │
│ 📝 Summary: Large pothole requiring     │
│ immediate repair to prevent accidents   │
│                                         │
│ [🔍 Find Similar Problems & Solutions] │
└─────────────────────────────────────────┘
```

### User Actions:
1. **View History**
   - Browse all past complaints
   - See at a glance:
     - Which issues are critical vs low priority
     - Which areas have most complaints
     - How recently issues were reported
   - Total count: "📊 Total Complaints: 5"

2. **Review Complaint Details**
   - Read full description of past issue
   - See AI's analysis and categorization
   - Check what department should handle it
   - Understand urgency (Priority + Risk)
   - Know response timeframe (SLA)

3. **Find Similar Problems**
   - Click "🔍 Find Similar Problems & Solutions" on any card
   - Navigates to Similar Problems page for THAT complaint
   - Back button returns to Dashboard (not New Complaint)

4. **Compare Issues**
   - Browse multiple cards
   - See patterns in area
   - Identify recurring problems
   - Understand neighborhood issues

### Example Dashboard:
```
📋 My Complaints Dashboard

📊 Total Complaints: 3

[Card 1]
🔹 Road Damage - Pothole
Main Street has dangerous pothole...
📍 Downtown | 🏢 Public Works
⚡ HIGH | ⚠️ MODERATE | ⏱️ 24hrs
[Button]

[Card 2]
🔹 Broken Street Light
Street lamp out on Park Avenue...
📍 East Side | 🏢 Utilities
⚡ MEDIUM | ⚠️ LOW | ⏱️ 48hrs
[Button]

[Card 3]
🔹 Garbage Collection Issue
Missed trash pickup on 5th Ave...
📍 Downtown | 🏢 Sanitation
⚡ LOW | ⚠️ LOW | ⏱️ 72hrs
[Button]
```

---

## SCENE 3: Similar Problems Page

### What Users See:
- Back button in top left
- Title: "🔍 Similar Problems in [Area]"
- Subtitle: "Issue Type: [Type]"
- List of similar problems reported in same area

### Each Problem Card Shows:
```
┌──────────────────────────────────────┐
│ 📍 Road Damage                       │
│ Large pothole on Main St near...     │
│ 📅 1/16/26 • Priority: HIGH          │
│                      [▶ Expand]      │
└──────────────────────────────────────┘
```

### When Expanded:
```
┌──────────────────────────────────────┐
│ 📍 Road Damage                       │
│ Large pothole on Main St near...     │
│ 📅 1/16/26 • Priority: HIGH          │
│                      [▼ Collapse]    │
├──────────────────────────────────────┤
│ 💡 Suggestions (2)                   │
│                                      │
│ ┌─ Fill with asphalt patch          │
│ │  1/16/26                           │
│ │  ★★★★★ 4.5 (9 found helpful)     │
│ │  [★] [★] [★] [★] [★]            │
│ │                                    │
│ ├─ Contact Public Works today       │
│ │  1/15/26                           │
│ │  ★★★☆☆ 3.0 (5 found helpful)     │
│ │  [★] [★] [★] [☆] [☆]            │
│                                      │
│ 💬 Suggest a Solution                │
│ [Text Input Area]                    │
│ [✅ Submit Suggestion]               │
└──────────────────────────────────────┘
```

### User Actions:

1. **Browse Similar Issues**
   - Scroll through list of problems
   - Read descriptions
   - See when they were reported
   - Understand priority levels

2. **Expand Problem Details**
   - Click "▶ Expand" to see existing solutions
   - View suggestions from other users
   - See star ratings for each solution
   - Understand which solutions are most helpful

3. **Rate Solutions**
   - Click 1-5 stars to rate helpfulness
   - Your rating appears immediately
   - Helps other users find best solutions
   - Tracks "helpful" votes (3+ stars)

4. **Submit Solution**
   - Type your suggestion in text area
   - "This worked for me: call Public Works at..."
   - Click "✅ Submit Suggestion"
   - Your solution appears instantly
   - Others can rate your contribution

5. **Return to Source**
   - Click "← Back to [Origin]" button
   - If came from New Complaint → returns there
   - If came from Dashboard → returns to Dashboard
   - Smart routing based on entry point

---

## Complete User Journey Examples

### Journey A: Quick Problem Reporting
```
1. Open app → "New Complaint" page
2. Describe pothole with photo
3. Click "Analyze Issue"
4. View AI analysis results
5. Click "Find Similar Problems"
6. See others with same issue
7. Submit solution suggestion
8. Rate existing solutions
9. Back button → returns to New Complaint form
```

### Journey B: Dashboard Exploration
```
1. Click "My Dashboard"
2. Browse all past complaints (5 total)
3. Review complaint details
4. Click on complaint to find similar problems
5. Explore solutions from community
6. Submit improvement suggestion
7. Rate helpful solutions
8. Back button → Dashboard
9. Click another complaint
10. Repeat for multiple issues
```

### Journey C: Comprehensive Usage
```
1. File new complaint → Analyze → Find Similar Problems
   → Submit solution → Rate solutions → Back to form
2. Navigate to Dashboard
3. Browse complaint history
4. Select complaint #3 → Find Similar Problems
   → Read solutions → Rate them → Back to Dashboard
5. Select complaint #5 → Find Similar Problems
   → Submit new solution → Back to Dashboard
6. Return to New Complaint tab
7. Submit fresh complaint
8. Continue cycle...
```

---

## Key Features Across Pages

### Navigation Bar
- Always visible at top
- Shows which page you're on (highlighted)
- Click to switch pages instantly
- Clean visual feedback

### Back Buttons
- Similar Problems page has intelligent back
- Remembers which page you came from
- Returns to exact page, not forcing Dashboard
- Preserves form state

### Data Persistence
- User ID saved in browser (localStorage)
- Complaint forms preserved
- Selections remember between page switches
- All data synced with backend

### Color Coding
- **Priority Levels**: Red (Critical) → Orange (High) → Yellow (Medium) → Green (Low)
- **Risk Levels**: Same color scheme
- **Buttons**: Blue (primary) → Orange (action) → Green (submit)

### Empty States
- Dashboard shows "No complaints yet" if new user
- Similar Problems shows "No similar issues" if unique problem
- Helpful messages guide users

---

## Data Flow Diagram

```
User Input
    │
    ├─ New Complaint Page
    │  ├─ Type description
    │  ├─ Upload image/video
    │  └─ Click Analyze
    │
    └─→ Backend /analyze endpoint
        └─→ AI Analysis (Gemini)
            ├─ Issue Type
            ├─ Priority
            ├─ Department
            └─ Risk Level
                │
                └─→ Display Results
                    ├─ Feedback buttons
                    ├─ Statistics
                    └─ Similar Problems Button
                        │
                        └─→ Complaint ID saved
                            │
                            └─→ Similar Problems Page
                                ├─ Fetch /similar-problems API
                                ├─ Display matching issues
                                ├─ Fetch /suggestions API
                                ├─ Submit /suggestions API
                                └─ Rate /suggestions/:id/rate API


User Dashboard
    │
    └─→ My Dashboard Page
        ├─ Fetch /user/:id/complaints API
        ├─ Display all complaints
        │  ├─ Issue details
        │  ├─ Dates
        │  ├─ Priorities
        │  └─ Summaries
        └─ Click Similar Problems Button
           │
           └─→ Similar Problems Page
              (as above)
```

---

## Technical Summary

### Three Pages
1. **New Complaint** - Submit and analyze issues
2. **Dashboard** - View complaint history
3. **Similar Problems** - Explore community solutions

### Smart Navigation
- Navigation bar for main pages
- Intelligent back button on Similar Problems
- Context-aware routing

### User-Centric Design
- Simple, intuitive interface
- Clear visual hierarchy
- Color-coded information
- Helpful empty states
- Loading indicators

### Community Features
- Share solutions with others
- Rate helpfulness of suggestions
- Build collective knowledge
- Solve problems together

### Data Safety
- User tracking via localStorage
- No personal data exposure
- Complaint privacy
- Contribution attribution
