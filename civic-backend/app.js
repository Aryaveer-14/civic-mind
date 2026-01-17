import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import { GoogleGenerativeAI } from "@google/generative-ai";
import admin from "firebase-admin";

dotenv.config();

const app = express();
app.use(cors());

// serve static files from the frontend (parent directory)
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, '../')));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// --- DATABASE SETUP ---
let db = null;
const complaints = []; // Fallback in-memory storage

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    // Production: Use Service Account from Environment Variable
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    db = admin.firestore();
    console.log("🔥 Connected to Firestore (Production/ServiceAccount)");
  } else if (process.env.FIRESTORE_EMULATOR_HOST) {
     // Local Emulator
    admin.initializeApp({ projectId: "civic-emulator" });
    db = admin.firestore();
    console.log(`🔥 Connected to Firestore Emulator at ${process.env.FIRESTORE_EMULATOR_HOST}`);
  } else {
    console.log("⚠️  FIREBASE_SERVICE_ACCOUNT not set. Using in-memory storage (Data will be lost on restart).");
  }
} catch (err) {
  console.error("❌ Firebase init failed:", err.message);
  console.log("⚠️  Falling back to in-memory storage.");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

function generateId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

async function analyzeWithGemini(text, imagePath = null, mimeType = null) {
  try {
    const parts = [];
    const prompt = `You are a civic governance AI. Analyze this complaint and return ONLY valid JSON:
{"problem":"description","area":"location","solution":"action","concerned_authority":"dept","contact_information":"contact","priority":"High|Medium|Low","risk_level":"Safety|Health|Environment|Low"}
Complaint: "${text}"`;
    
    parts.push({ text: prompt });
    
    if (imagePath && fs.existsSync(imagePath)) {
      const imageData = fs.readFileSync(imagePath);
      const base64Image = imageData.toString('base64');
      const actualMimeType = mimeType || (imagePath.endsWith('.png') ? 'image/png' : 'image/jpeg');
      parts.push({ inline_data: { mime_type: actualMimeType, data: base64Image } });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ parts: parts }] }) }
    );

    const data = await response.json();
    if (!response.ok || !data.candidates?.[0]?.content?.parts?.[0]?.text) throw new Error("API error");

    const output = data.candidates[0].content.parts[0].text;
    const match = output.match(/\{[\s\S]*\}/);
    return JSON.parse(match[0]);
  } catch (err) {
    return fallbackAnalyze(text, imagePath);
  }
}

function fallbackAnalyze(text, imagePath = null) {
  const lower = (text || "").toLowerCase();
  const authorities = [
    { keys: ["pothole", "road", "street"], name: "Municipal Public Works" },
    { keys: ["garbage", "trash", "waste"], name: "Municipal Sanitation Department" },
    { keys: ["water", "leak", "sewage"], name: "Water Supply & Sewerage Board" },
    { keys: ["electric", "streetlight", "power"], name: "Electricity Board" },
    { keys: ["noise", "pollution", "air"], name: "Pollution Control Board" },
    { keys: ["crime", "theft", "police"], name: "Local Police Station" }
  ];

  let authority = "Municipal Office";
  for (const a of authorities) {
    if (a.keys.some(k => lower.includes(k))) {
      authority = a.name;
      break;
    }
  }

  let area = "Unknown";
  const match = lower.match(/\b(sector\s*\d+|road|marg|nagar|colony|block\s*[a-z0-9]+|phase\s*\d+)\b[\w\s-]*/);
  if (match) area = match[0].trim();

  return {
    problem: text && text.length > 0 ? text.slice(0, 160) : "Issue reported",
    area,
    solution: "Submit complaint to the concerned authority with evidence.",
    concerned_authority: authority,
    contact_information: "Visit local office or call city helpline.",
    priority: imagePath ? "High" : "Medium",
    risk_level: lower.includes("leak") || lower.includes("sewage") ? "Health" : "Low"
  };
}

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, '../working.html'));
});

app.get("/stats", async (req, res) => {
  try {
    let total = 0;
    if (db) {
       const snapshot = await db.collection('complaints').count().get();
       total = snapshot.data().count;
    } else {
       total = complaints.length;
    }
    res.json({ overall: { total, satisfied: 0, not_satisfied: 0 } });
  } catch (err) {
    console.error("GET /stats error:", err);
    res.status(500).json({ error: "Error" });
  }
});

app.post("/analyze", async (req, res) => {
  try {
    const { text, user_id, image_base64, media_data, mime_type } = req.body;
    
    const mediaBase64 = media_data || image_base64;

    if (!user_id) return res.status(401).json({ success: false, error: "User ID required" });
    if (!text && !mediaBase64) return res.status(400).json({ success: false, error: "Text or media required" });

    let imagePath = null;
    let finalMimeType = mime_type || 'image/jpeg';

    if (mediaBase64) {
      try {
        let ext = '.jpg';
        if (finalMimeType.includes('png')) ext = '.png';
        if (finalMimeType.includes('video') || finalMimeType.includes('mp4')) ext = '.mp4';
        
        const tempPath = `uploads/temp-${Date.now()}${ext}`;
        const buffer = Buffer.from(mediaBase64, 'base64');
        fs.writeFileSync(tempPath, buffer);
        imagePath = tempPath;
      } catch (err) {
        console.error("Media write error:", err.message);
      }
    }

    const aiDecision = await analyzeWithGemini(text || "Media analysis", imagePath, finalMimeType);
    
    const complaintId = generateId();
    const complaintData = { 
      id: complaintId, 
      user_id, 
      text, 
      has_media: !!imagePath, 
      media_type: finalMimeType, 
      ai_decision: aiDecision, 
      created_at: new Date().toISOString() 
    };

    if (db) {
      await db.collection('complaints').doc(complaintId).set(complaintData);
    } else {
      complaints.push(complaintData);
    }

    if (imagePath && fs.existsSync(imagePath)) {
      try { fs.unlinkSync(imagePath); } catch (err) { console.error("Cleanup error:", err.message); }
    }

    res.json({ success: true, complaint_id: complaintId, ai_decision: aiDecision });
  } catch (err) {
    console.error("Analysis error:", err.message);
    res.status(500).json({ success: false, error: "Analysis failed: " + err.message });
  }
});

app.get("/similar-problems", (req, res) => {
  res.json({ success: true, total: 0, problems: [] });
});

app.post("/feedback", async (req, res) => {
  const { complaint_id, satisfied } = req.body;
  if (!complaint_id || satisfied === undefined) return res.status(400).json({ success: false, error: "Missing fields" });
  
  try {
    if (db) {
      // Update Firestore document
      await db.collection('complaints').doc(complaint_id).update({
        satisfied: satisfied,
        feedback_at: new Date().toISOString()
      });
    } else {
      // Update local array
      const c = complaints.find(x => x.id === complaint_id);
      if (c) {
        c.satisfied = satisfied;
        c.feedback_at = new Date().toISOString();
      }
    }
    res.json({ success: true });
  } catch (err) {
    console.error("Feedback error:", err.message);
    res.status(500).json({ success: false, error: "Failed to save feedback" });
  }
});

const PORT = process.env.PORT || 5000;
let server = null;

try {
  // Bind to all interfaces so 127.0.0.1 works (Windows maps localhost to ::1 only)
  server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Civic backend listening on port ${PORT}`);
  });
} catch (err) {
  console.error(`❌ Failed to start server:`, err.message);
  process.exit(1);
}

setInterval(() => {
  if (server && !server.listening) {
    console.error('Server stopped listening, restarting...');
    process.exit(1);
  }
}, 5000);

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught exception:', err.message, err.stack);
});

process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled rejection:', reason);
});

console.log("Backend initialized and waiting for requests...");
