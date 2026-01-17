import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Serve static files from parent directory (for HTML files)
app.use(express.static(path.join(__dirname, '..')));

const upload = multer({ dest: "uploads/" });

// In-memory database
const complaints = [];
const feedback = [];

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function generateId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

async function analyzeWithGemini(text, imagePath = null) {
  const parts = [];
  
  const prompt = `You are a civic governance AI. Analyze this complaint and return ONLY valid JSON:
{
  "problem": "clear description",
  "area": "location",
  "solution": "recommended action",
  "concerned_authority": "department responsible",
  "contact_information": "contact details",
  "priority": "High | Medium | Low",
  "risk_level": "Safety | Health | Environment | Low"
}

Complaint: "${text}"`;
  
  parts.push({ text: prompt });
  
  if (imagePath) {
    try {
      const imageData = fs.readFileSync(imagePath);
      const base64Image = imageData.toString('base64');
      const mimeType = imagePath.endsWith('.png') ? 'image/png' : 'image/jpeg';
      parts.push({
        inline_data: {
          mime_type: mimeType,
          data: base64Image
        }
      });
    } catch (err) {
      console.error("Error reading image:", err.message);
    }
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: parts }]
        })
      }
    );

    const data = await response.json();

    if (!response.ok || !data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error("Gemini API error");
    }

    const output = data.candidates[0].content.parts[0].text;
    const match = output.match(/\{[\s\S]*\}/);
    return JSON.parse(match[0]);
  } catch (err) {
    return fallbackAnalyze(text, imagePath);
  }
}

function fallbackAnalyze(text, imagePath = null) {
  const lower = (text || "").toLowerCase();
  
  const authorityMap = [
    { keys: ["pothole", "road", "street"], authority: "Municipal Public Works" },
    { keys: ["garbage", "trash", "waste"], authority: "Municipal Sanitation Department" },
    { keys: ["water", "leak", "sewage"], authority: "Water Supply & Sewerage Board" },
    { keys: ["electric", "streetlight", "power"], authority: "Electricity Board" },
    { keys: ["noise", "pollution", "air"], authority: "Pollution Control Board" },
    { keys: ["crime", "theft", "police"], authority: "Local Police Station" }
  ];

  let concerned_authority = "Municipal Office";
  for (const entry of authorityMap) {
    if (entry.keys.some(k => lower.includes(k))) {
      concerned_authority = entry.authority;
      break;
    }
  }

  let area = "Unknown";
  const areaMatch = lower.match(/\b(sector\s*\d+|road|marg|nagar|colony|block\s*[a-z0-9]+|phase\s*\d+)\b[\w\s-]*/);
  if (areaMatch) area = areaMatch[0].trim();

  return {
    problem: text && text.length > 0 ? text.slice(0, 160) : "Issue reported",
    area,
    solution: "Submit complaint to the concerned authority with evidence.",
    concerned_authority,
    contact_information: "Visit local office or call city helpline.",
    priority: imagePath ? "High" : "Medium",
    risk_level: lower.includes("leak") || lower.includes("sewage") ? "Health" : "Low"
  };
}

app.get("/", (req, res) => {
  res.send("Civic backend running");
});

app.get("/stats", (req, res) => {
  res.json({
    overall: {
      total: complaints.length,
      satisfied: feedback.filter(f => f.satisfied).length,
      not_satisfied: feedback.filter(f => !f.satisfied).length
    }
  });
});

app.post("/analyze", async (req, res) => {
  const { text, user_id, image_base64 } = req.body;
  
  if (!user_id) {
    return res.status(401).json({ success: false, error: "User ID required" });
  }

  if (!text && !image_base64) {
    return res.status(400).json({ success: false, error: "Text or image required" });
  }

  try {
    let imagePath = null;
    if (image_base64) {
      try {
        const tempPath = `uploads/temp-${Date.now()}.jpg`;
        const buffer = Buffer.from(image_base64, 'base64');
        fs.writeFileSync(tempPath, buffer);
        imagePath = tempPath;
      } catch (err) {
        console.error("Error writing image:", err.message);
      }
    }

    const aiDecision = await analyzeWithGemini(text || "Image analysis", imagePath);
    
    const complaintId = generateId();
    complaints.push({
      id: complaintId,
      user_id,
      text,
      has_image: !!imagePath,
      ai_decision: aiDecision,
      created_at: new Date().toISOString()
    });

    if (imagePath) {
      try {
        fs.unlinkSync(imagePath);
      } catch (err) {
        console.error("File cleanup error:", err.message);
      }
    }

    return res.json({
      success: true,
      complaint_id: complaintId,
      ai_decision: aiDecision
    });
  } catch (err) {
    console.error("Analysis error:", err.message);
    return res.status(500).json({ success: false, error: "Analysis failed" });
  }
});

app.get("/similar-problems", (req, res) => {
  res.json({
    success: true,
    total: 0,
    problems: []
  });
});

app.post("/feedback", (req, res) => {
  const { complaint_id, satisfied } = req.body;
  if (!complaint_id || satisfied === undefined) {
    return res.status(400).json({ success: false, error: "Missing fields" });
  }
  feedback.push({ complaint_id, satisfied, created_at: new Date().toISOString() });
  res.json({ success: true });
});

const PORT = 5000;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Civic backend running on http://localhost:${PORT}`);
  console.log("Ready for image/video analysis!");
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`);
  } else {
    console.error(`❌ Server error: ${err.message}`);
  }
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught exception:', err.message);
});

process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled rejection:', reason);
});
