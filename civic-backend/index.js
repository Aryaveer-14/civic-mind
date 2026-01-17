import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import admin from "firebase-admin";
import { GoogleGenerativeAI } from "@google/generative-ai";
import multer from "multer";
import fs from "fs";
import twilio from "twilio";

dotenv.config();

/* ---------------- APP SETUP ---------------- */

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Multer setup for file uploads
const upload = multer({ 
  dest: "uploads/",
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

console.log("GEMINI KEY LOADED:", !!process.env.GEMINI_API_KEY);

/* ---------------- SMS SERVICE SETUP (Twilio) ---------------- */

let twilioClient = null;
// Check if Twilio credentials are valid (not placeholder values)
const hasTwilio = process.env.TWILIO_ACCOUNT_SID && 
                   process.env.TWILIO_AUTH_TOKEN && 
                   process.env.TWILIO_PHONE_NUMBER &&
                   process.env.TWILIO_ACCOUNT_SID.startsWith('AC') &&
                   !process.env.TWILIO_ACCOUNT_SID.includes('your_');

if (hasTwilio) {
  try {
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    console.log("📱 Twilio SMS service configured");
  } catch (err) {
    console.log("⚠️  Twilio credentials invalid:", err.message);
    twilioClient = null;
  }
} else {
  console.log("⚠️  Twilio not configured. SMS will be logged to console instead.");
  console.log("    To enable SMS: Set valid TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER in .env");
}

// Helper function to send SMS
async function sendSMS(phoneNumber, message) {
  if (!hasTwilio) {
    // Fallback: log to console for testing
    console.log(`\n📱 [SMS TO ${phoneNumber}]\n${message}\n`);
    return { success: true, mock: true };
  }

  try {
    const result = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });
    console.log(`✅ SMS sent successfully to ${phoneNumber} (SID: ${result.sid})`);
    return { success: true, sid: result.sid };
  } catch (err) {
    console.error(`❌ Failed to send SMS to ${phoneNumber}:`, err.message);
    return { success: false, error: err.message };
  }
}

/* ---------------- DATABASE SETUP (Firestore or In-Memory) ---------------- */

let db = null;
let useFirestore = false;

// In-memory storage for fallback
const complaintDatabase = [];
const feedbackDatabase = [];
const userDatabase = [];
const authorityDatabase = [];

// Helper to generate IDs
function generateId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Helper to generate auth token
function generateToken() {
  return Buffer.from(Math.random().toString()).toString('base64').substring(0, 32);
}

// Helper to generate OTP (6 digit code)
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Store OTPs temporarily (in production, use Redis or database)
const otpStorage = {};

// Initialize Firestore
try {
  // Only use emulator in development
  if (process.env.NODE_ENV !== 'production') {
    process.env.FIRESTORE_EMULATOR_HOST = "localhost:8082";
  }
  
  // Initialize based on environment
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    // Production: use service account JSON from env variable
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log("🔥 Connected to production Firestore");
  } else if (process.env.NODE_ENV !== 'production') {
    // Development: use emulator
    admin.initializeApp({
      projectId: "civic-emulator"
    });
    console.log("🔥 Connected to Firestore emulator at localhost:8082");
  } else {
    // Production without credentials: skip Firestore
    throw new Error('No Firestore credentials in production');
  }
  
  db = admin.firestore();
  useFirestore = true;
} catch (err) {
  console.log("⚠️  Firestore not available, using in-memory database");
  console.log("   Reason:", err.message);
  if (process.env.NODE_ENV === 'production') {
    console.log("   💡 To enable persistence: Set FIREBASE_SERVICE_ACCOUNT in Railway");
  } else {
    console.log("   💡 To enable Firestore: ensure Java is installed and run 'firebase emulators:start'");
  }
  useFirestore = false;
}

/* ---------------- GEMINI SETUP ---------------- */

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-pro"
});


/* ---------------- GEMINI ANALYSIS ---------------- */

async function analyzeWithGemini(text, imagePath = null) {
  const parts = [];
  
  // Add text part
  const prompt = `
You are a civic governance AI.

Analyze the complaint and return ONLY valid JSON:
{
  "problem": "string - clear description of the problem reported",
  "area": "string - geographic area/location affected",
  "solution": "string - recommended solution or action",
  "concerned_authority": "string - government department or authority responsible",
  "contact_information": "string - contact details or phone/email of relevant authority",
  "priority": "High | Medium | Low",
  "risk_level": "Safety | Health | Environment | Low",
  "image_analysis": "string or null"
}

Complaint:
"${text}"
${imagePath ? '\nNote: An image has been provided. Analyze it for visual evidence of the issue.' : ''}`;
  
  parts.push({ text: prompt });
  
  // Add image part if provided
  if (imagePath) {
    try {
      const imageData = fs.readFileSync(imagePath);
      const base64Image = imageData.toString('base64');
      
      // Determine MIME type from actual file extension
      let mimeType = 'image/jpeg';
      if (imagePath.endsWith('.png')) {
        mimeType = 'image/png';
      } else if (imagePath.endsWith('.gif')) {
        mimeType = 'image/gif';
      } else if (imagePath.endsWith('.webp')) {
        mimeType = 'image/webp';
      }
      
      console.log(`📸 Processing image: ${imagePath}, MIME: ${mimeType}`);
      
      parts.push({
        inline_data: {
          mime_type: mimeType,
          data: base64Image
        }
      });
    } catch (imgErr) {
      console.error("❌ Error reading image file:", imgErr);
      throw new Error(`Failed to read image file: ${imgErr.message}`);
    }
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            parts: parts
          }
        ]
      })
    }
  );

  const data = await response.json();
  console.log("🔄 Gemini API response status:", response.status);

  if (!response.ok) {
    console.error("❌ Gemini API error:", data);
    throw new Error(`Gemini API error: ${data.error?.message || JSON.stringify(data)}`);
  }

  if (!data.candidates || !data.candidates[0]) {
    console.error("❌ No candidates in response:", data);
    throw new Error("Gemini returned no analysis results");
  }

  if (!data.candidates[0].content || !data.candidates[0].content.parts) {
    console.error("❌ Invalid response structure:", data);
    throw new Error("Gemini returned invalid response structure");
  }

  const output = data.candidates[0].content.parts[0].text;
  console.log("📝 Gemini output:", output.substring(0, 100) + "...");
  
  const match = output.match(/\{[\s\S]*\}/);

  if (!match) {
    console.error("❌ Could not extract JSON from output:", output);
    throw new Error("Gemini response does not contain valid JSON");
  }

  const result = JSON.parse(match[0]);
  console.log("✅ Parsed analysis:", result);
  return result;
}

// Fallback analysis when Gemini is unavailable or rate-limited
function fallbackAnalyze(text, imagePath = null) {
  const lower = (text || "").toLowerCase();

  // Simple keyword → authority mapping
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

  // Try to extract area words (very naive)
  let area = "Unknown";
  const areaMatch = lower.match(/\b(sector\s*\d+|road|marg|nagar|colony|block\s*[a-z0-9]+|phase\s*\d+)\b[\w\s-]*/);
  if (areaMatch) area = areaMatch[0].trim();

  // Problem summarization
  const problem = text && text.length > 0 ? text.slice(0, 160) : (imagePath ? "Issue evidenced in attached image" : "General civic issue");

  // Basic solution suggestions
  let solution = "Submit a formal complaint to the concerned authority and attach evidence.";
  if (concerned_authority === "Electricity Board") solution = "Report to Electricity Board helpline and share pole/location details.";
  if (concerned_authority === "Municipal Sanitation Department") solution = "Request immediate garbage pickup and schedule regular cleaning.";
  if (concerned_authority === "Municipal Public Works") solution = "File a road maintenance request with exact location and photos.";

  const contact_information = "Visit local office or call city helpline (dial 100/102 where applicable).";
  const priority = imagePath ? "High" : "Medium";
  const risk_level = lower.includes("leak") || lower.includes("sewage") ? "Health" : (lower.includes("pothole") ? "Safety" : "Low");

  return {
    problem,
    area,
    solution,
    concerned_authority,
    contact_information,
    priority,
    risk_level,
    image_analysis: imagePath ? "Image received; AI quota exceeded, used fallback analysis." : null
  };
}

/* ---------------- AUTHORITY CONTACTS ---------------- */

function normalize(str) {
  return (str || "").toString().trim().toLowerCase();
}

async function lookupAuthorityContact(authorityName, area) {
  const nameN = normalize(authorityName);
  const areaN = normalize(area);

  // Firestore-backed lookup
  if (useFirestore && db) {
    try {
      // First try exact name match
      let query = db.collection("authorities").where("name_normalized", "==", nameN);
      if (areaN) query = query.where("area_normalized", "==", areaN);
      const snap = await query.get();
      if (!snap.empty) {
        const doc = snap.docs[0].data();
        return {
          name: doc.name,
          department: doc.department,
          phone: doc.phone || null,
          email: doc.email || null,
          website: doc.website || null,
          address: doc.address || null,
          office_hours: doc.office_hours || null,
          area: doc.area || null
        };
      }

      // Then try aliases contains
      let aliasQuery = db.collection("authorities").where("aliases_normalized", "array-contains", nameN);
      if (areaN) aliasQuery = aliasQuery.where("area_normalized", "==", areaN);
      const aliasSnap = await aliasQuery.get();
      if (!aliasSnap.empty) {
        const doc = aliasSnap.docs[0].data();
        return {
          name: doc.name,
          department: doc.department,
          phone: doc.phone || null,
          email: doc.email || null,
          website: doc.website || null,
          address: doc.address || null,
          office_hours: doc.office_hours || null,
          area: doc.area || null
        };
      }
    } catch (err) {
      console.log("⚠️  Authority lookup failed:", err.message);
    }
  } else {
    // In-memory fallback lookup
    const candidates = authorityDatabase.filter(a => {
      const matchesName = normalize(a.name) === nameN || (Array.isArray(a.aliases) && a.aliases.map(normalize).includes(nameN));
      const matchesArea = areaN ? normalize(a.area) === areaN : true;
      return matchesName && matchesArea;
    });
    if (candidates.length > 0) {
      const a = candidates[0];
      return {
        name: a.name,
        department: a.department,
        phone: a.phone || null,
        email: a.email || null,
        website: a.website || null,
        address: a.address || null,
        office_hours: a.office_hours || null,
        area: a.area || null
      };
    }
  }

  return null;
}

async function upsertAuthorityContact(entry) {
  const now = new Date();
  const payload = {
    name: entry.name,
    department: entry.department,
    phone: entry.phone || null,
    email: entry.email || null,
    website: entry.website || null,
    address: entry.address || null,
    office_hours: entry.office_hours || null,
    area: entry.area || null,
    aliases: Array.isArray(entry.aliases) ? entry.aliases : [],
    name_normalized: normalize(entry.name),
    area_normalized: normalize(entry.area),
    aliases_normalized: (Array.isArray(entry.aliases) ? entry.aliases : []).map(normalize),
    updated_at: now
  };

  if (useFirestore && db) {
    // Key by name + area
    const key = `${payload.name_normalized}__${payload.area_normalized || ""}`;
    await db.collection("authorities").doc(key).set(payload, { merge: true });
    return { id: key };
  } else {
    // In-memory upsert
    const idx = authorityDatabase.findIndex(a => normalize(a.name) === payload.name_normalized && normalize(a.area) === payload.area_normalized);
    if (idx >= 0) {
      authorityDatabase[idx] = { ...authorityDatabase[idx], ...payload };
      return { id: idx };
    } else {
      authorityDatabase.push(payload);
      return { id: authorityDatabase.length - 1 };
    }
  }
}


/* ---------------- ROUTES ---------------- */

app.get("/", (req, res) => {
  res.json({ 
    message: "Civic Backend API Running",
    version: "1.0.0",
    status: "healthy",
    environment: process.env.NODE_ENV || 'development'
  });
});

// Health check endpoint for Railway
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    services: {
      database: useFirestore ? "firestore" : "in-memory",
      sms: hasTwilio ? "twilio" : "console",
      ai: !!process.env.GEMINI_API_KEY ? "gemini" : "disabled"
    },
    uptime: process.uptime()
  });
});

// User Registration - Step 1: Generate OTP
app.post("/register", async (req, res) => {
  console.log("📨 /register request received");
  const { email, name, contact_number, age, locality } = req.body;

  if (!email || !name || !contact_number || !age || !locality) {
    console.log("❌ Missing fields");
    return res.status(400).json({
      success: false,
      error: "All fields (email, name, contact_number, age, locality) are required"
    });
  }

  try {
    console.log("🔍 Checking for duplicate email or contact_number");
    
    // Always check in-memory database first (fast)
    console.log("💾 Checking in-memory database for duplicates");
    if (userDatabase.find(u => u.email === email)) {
      return res.status(400).json({ success: false, error: "Email already registered" });
    }
    if (userDatabase.find(u => u.contact_number === contact_number)) {
      return res.status(400).json({ success: false, error: "Contact number already registered" });
    }
    
    // If using Firestore, do a quick check with timeout
    if (useFirestore && db) {
      console.log("💾 Checking Firestore for duplicates");
      try {
        // Email check
        const emailSnapshot = await Promise.race([
          db.collection("users").where("email", "==", email).get(),
          new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 3000))
        ]);
        if (!emailSnapshot.empty) {
          console.log("❌ Email already exists");
          return res.status(400).json({ success: false, error: "Email already registered" });
        }
        
        // Contact check
        const contactSnapshot = await Promise.race([
          db.collection("users").where("contact_number", "==", contact_number).get(),
          new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 3000))
        ]);
        if (!contactSnapshot.empty) {
          console.log("❌ Contact number already exists");
          return res.status(400).json({ success: false, error: "Contact number already registered" });
        }
      } catch (firestoreErr) {
        console.warn("⚠️  Firestore check timed out, continuing with registration:", firestoreErr.message);
      }
    }

    // Generate OTP for verification
    const otp = generateOTP();
    const tempId = generateId();
  
    // Store temp user data with OTP (expires in 10 minutes)
    otpStorage[contact_number] = {
      otp,
      email,
      name,
      contact_number,
      age: parseInt(age),
      locality,
      tempId,
      createdAt: Date.now(),
      expiresAt: Date.now() + 10 * 60 * 1000  // 10 minutes expiry
    };
  
    console.log("📱 OTP generated for contact:", contact_number);
    console.log("🔐 OTP:", otp);
    
    // Send SMS with OTP (with timeout to prevent hanging)
    const smsMessage = `Your Civic verification code is: ${otp}\n\nThis code expires in 10 minutes.`;
    
    // Use Promise.race to add timeout
    const smsResult = await Promise.race([
      sendSMS(contact_number, smsMessage),
      new Promise((_, reject) => setTimeout(() => reject(new Error("SMS timeout")), 5000))
    ]).catch((err) => {
      console.warn("⚠️  SMS sending timed out or failed:", err.message);
      return { success: false, error: "SMS timeout" };
    });
    
    if (!smsResult.success && hasTwilio) {
      // If SMS fails and Twilio is configured, still allow OTP but warn user
      console.warn(`⚠️  SMS failed but OTP stored for ${contact_number}`);
    }
  
    return res.json({
      success: true,
      message: hasTwilio ? "OTP sent to your mobile number" : "OTP generated (check console/logs for testing)",
      contact_number,
      tempId,
      otp: !hasTwilio ? otp : undefined  // Only return OTP in mock mode, not when using real Twilio
    });
  } catch (err) {
    console.error("❌ Registration ERROR:", err.message, err);
    return res.status(500).json({ success: false, error: "Registration failed: " + err.message });
  }
});

// OTP Verification - Step 2: User enters OTP
app.post("/verify-otp", async (req, res) => {
  console.log("📱 /verify-otp request received");
  const { contact_number, otp } = req.body;

  if (!contact_number || !otp) {
    return res.status(400).json({
      success: false,
      error: "Contact number and OTP are required"
    });
  }

  try {
    // Check if OTP exists and is valid
    const otpData = otpStorage[contact_number];
  
    if (!otpData) {
      return res.status(400).json({
        success: false,
        error: "OTP not found. Please register again."
      });
    }
  
    // Check if OTP has expired
    if (Date.now() > otpData.expiresAt) {
      delete otpStorage[contact_number];
      return res.status(400).json({
        success: false,
        error: "OTP has expired. Please register again."
      });
    }
  
    // Verify OTP
    if (otpData.otp !== otp) {
      return res.status(400).json({
        success: false,
        error: "Invalid OTP. Please try again."
      });
    }
  
    // OTP is valid, create user in database
    let userId;
  
    if (useFirestore && db) {
      console.log("💾 Creating user in Firestore");
      try {
        const docRef = await Promise.race([
          db.collection("users").add({
            email: otpData.email,
            name: otpData.name,
            contact_number: otpData.contact_number,
            age: otpData.age,
            locality: otpData.locality,
            token: generateToken(),
            verified: true,
            verified_at: new Date(),
            created_at: new Date()
          }),
          new Promise((_, reject) => setTimeout(() => reject(new Error("Firestore timeout")), 5000))
        ]);
        userId = docRef.id;
      } catch (firestoreErr) {
        console.warn("⚠️  Firestore write timed out, falling back to in-memory:", firestoreErr.message);
        // Fallback to in-memory
        userId = generateId();
        userDatabase.push({
          id: userId,
          email: otpData.email,
          name: otpData.name,
          contact_number: otpData.contact_number,
          age: otpData.age,
          locality: otpData.locality,
          token: generateToken(),
          verified: true,
          verified_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        });
      }
    } else {
      console.log("💾 Creating user in in-memory database");
      userId = generateId();
      userDatabase.push({
        id: userId,
        email: otpData.email,
        name: otpData.name,
        contact_number: otpData.contact_number,
        age: otpData.age,
        locality: otpData.locality,
        token: generateToken(),
        verified: true,
        verified_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      });
    }
  
    // Clear OTP data
    delete otpStorage[contact_number];
  
    console.log("✅ User verified and created:", userId);
    return res.json({
      success: true,
      message: "Email verified successfully",
      user_id: userId,
      name: otpData.name,
      email: otpData.email
    });
  } catch (err) {
    console.error("❌ OTP Verification ERROR:", err.message, err);
    return res.status(500).json({ success: false, error: "OTP verification failed: " + err.message });
  }
});

// Resend OTP
app.post("/resend-otp", async (req, res) => {
  console.log("📱 /resend-otp request received");
  const { contact_number } = req.body;

  if (!contact_number) {
    return res.status(400).json({
      success: false,
      error: "Contact number is required"
    });
  }

  try {
    const otpData = otpStorage[contact_number];
  
    if (!otpData) {
      return res.status(400).json({
        success: false,
        error: "No pending registration found. Please register again."
      });
    }
  
    // Generate new OTP
    const newOtp = generateOTP();
    otpData.otp = newOtp;
    otpData.expiresAt = Date.now() + 10 * 60 * 1000;  // Reset 10 minute expiry
  
    console.log("📱 New OTP generated for contact:", contact_number);
    console.log("🔐 New OTP:", newOtp);
    
    // Send SMS with new OTP
    const smsMessage = `Your new Civic verification code is: ${newOtp}\n\nThis code expires in 10 minutes.`;
    const smsResult = await sendSMS(contact_number, smsMessage);
    
    if (!smsResult.success && hasTwilio) {
      console.warn(`⚠️  SMS failed but new OTP stored for ${contact_number}`);
    }
  
    return res.json({
      success: true,
      message: hasTwilio ? "OTP resent to your mobile number" : "New OTP generated (check console/logs)",
      otp: !hasTwilio ? newOtp : undefined  // Only return OTP in mock mode
    });
  } catch (err) {
    console.error("❌ Resend OTP ERROR:", err.message);
    return res.status(500).json({ success: false, error: "Failed to resend OTP: " + err.message });
  }
});

// User Login
app.post("/login", async (req, res) => {
  console.log("📨 /login request received");
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      error: "Email is required"
    });
  }

  try {
    let user = null;
    if (useFirestore && db) {
      try {
        const snapshot = await Promise.race([
          db.collection("users").where("email", "==", email).get(),
          new Promise((_, reject) => setTimeout(() => reject(new Error("Firestore timeout")), 5000))
        ]);
        if (snapshot.empty) {
          return res.status(401).json({ success: false, error: "User not found" });
        }
        const doc = snapshot.docs[0];
        user = { id: doc.id, ...doc.data() };
      } catch (firestoreErr) {
        console.warn("⚠️  Firestore query timed out, checking in-memory:", firestoreErr.message);
        user = userDatabase.find(u => u.email === email);
        if (!user) {
          return res.status(401).json({ success: false, error: "User not found" });
        }
      }
    } else {
      user = userDatabase.find(u => u.email === email);
      if (!user) {
        return res.status(401).json({ success: false, error: "User not found" });
      }
    }

    console.log("✅ User logged in:", user.email);
    return res.json({
      success: true,
      user_id: user.id,
      name: user.name,
      email: user.email,
      token: user.token,
      locality: user.locality
    });
  } catch (err) {
    console.error("❌ Login ERROR:", err);
    return res.status(500).json({ success: false, error: "Login failed" });
  }
});


// Get User Info
app.get("/user/:user_id", async (req, res) => {
  const { user_id } = req.params;

  try {
    let user = null;
    if (useFirestore && db) {
      const doc = await db.collection("users").doc(user_id).get();
      if (!doc.exists) {
        return res.status(404).json({ success: false, error: "User not found" });
      }
      user = { id: doc.id, ...doc.data() };
    } else {
      user = userDatabase.find(u => u.id === user_id);
      if (!user) {
        return res.status(404).json({ success: false, error: "User not found" });
      }
    }

    return res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        contact_number: user.contact_number,
        age: user.age,
        locality: user.locality
      }
    });
  } catch (err) {
    console.error("❌ User fetch ERROR:", err);
    return res.status(500).json({ success: false, error: "Failed to fetch user" });
  }
});

// Get User's Complaints/History
app.get("/user/:user_id/complaints", async (req, res) => {
  const { user_id } = req.params;

  try {
    let userComplaints = [];

    if (useFirestore && db) {
      const snapshot = await db.collection("complaints")
        .where("user_id", "==", user_id)
        .orderBy("created_at", "desc")
        .get();
      
      snapshot.forEach(doc => {
        userComplaints.push({
          id: doc.id,
          ...doc.data(),
          created_at: doc.data().created_at?.toDate?.()?.toISOString?.() || doc.data().created_at
        });
      });
    } else {
      userComplaints = complaintDatabase
        .filter(c => c.user_id === user_id)
        .sort((a, b) => {
          const dateA = new Date(a.created_at);
          const dateB = new Date(b.created_at);
          return dateB - dateA;
        });
    }

    return res.json({
      success: true,
      user_id,
      total: userComplaints.length,
      complaints: userComplaints
    });
  } catch (err) {
    console.error("❌ User Complaints ERROR:", err.message);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch user complaints"
    });
  }
});

app.post("/analyze", upload.single('image'), async (req, res) => {
  console.log("📨 /analyze request received");
  console.log("Body keys:", Object.keys(req.body));
  console.log("File present:", !!req.file);
  
  const { text, user_id, image_base64 } = req.body;
  let imagePath = req.file ? req.file.path : null;
  
  // If image_base64 is provided in JSON, write it to a temp file
  if (!imagePath && image_base64) {
    try {
      const tempPath = `uploads/temp-${Date.now()}.jpg`;
      const buffer = Buffer.from(image_base64, 'base64');
      fs.writeFileSync(tempPath, buffer);
      imagePath = tempPath;
      console.log(`📝 Wrote base64 image to ${imagePath} (${buffer.length} bytes)`);
    } catch (err) {
      console.error("❌ Failed to write base64 image:", err.message);
    }
  }

  if (!user_id) {
    return res.status(401).json({
      success: false,
      error: "User ID is required. Please log in first."
    });
  }

  if (!text && !imagePath) {
    console.log("❌ No text or image provided");
    return res.status(400).json({
      success: false,
      error: "Complaint text or image is required"
    });
  }

  try {
    console.log("🤖 Analyzing with Gemini...");
    let aiDecision;
    try {
      aiDecision = await analyzeWithGemini(text || "No text provided", imagePath);
      console.log("✅ Gemini analysis complete:", aiDecision);
    } catch (aiErr) {
      console.error("⚠️  AI analysis failed, switching to fallback:", aiErr?.message || aiErr);
      aiDecision = fallbackAnalyze(text || "No text provided", imagePath);
      console.log("✅ Fallback analysis complete:", aiDecision);
    }
    // Enrich with exact contact info when available
    const contact = await lookupAuthorityContact(aiDecision.concerned_authority, aiDecision.area);
    if (contact) {
      // Prefer exact authority name from directory for precision
      if (contact.name) {
        aiDecision.concerned_authority = contact.name;
      }
      aiDecision.contact_information_obj = contact;
      const parts = [];
      if (contact.phone) parts.push(`Phone: ${contact.phone}`);
      if (contact.email) parts.push(`Email: ${contact.email}`);
      if (contact.website) parts.push(`Website: ${contact.website}`);
      if (parts.length > 0) {
        aiDecision.contact_information = parts.join("; ");
      }
    } else {
      aiDecision.contact_information_obj = null;
    }

    console.log("💾 Saving complaint...");
    let complaintId;
    // Ensure compatibility with similar-problems query by setting issue_type
    if (!aiDecision.issue_type && aiDecision.problem) {
      aiDecision.issue_type = aiDecision.problem;
    }
    
    if (useFirestore && db) {
      // Save to Firestore
      const docRef = await db.collection("complaints").add({
        user_id,
        complaint_text: text,
        has_image: !!imagePath,
        ai_decision: aiDecision,
        ai_mode: "gemini-vision",
        created_at: new Date()
      });
      complaintId = docRef.id;
      console.log("✅ Saved to Firestore with ID:", complaintId);
    } else {
      // Save to in-memory database
      complaintId = generateId();
      complaintDatabase.push({
        id: complaintId,
        user_id,
        complaint_text: text,
        has_image: !!imagePath,
        ai_decision: aiDecision,
        ai_mode: "gemini-vision",
        created_at: new Date().toISOString()
      });
      console.log("✅ Saved to in-memory database with ID:", complaintId);
    }

    // Clean up uploaded file
    if (imagePath) {
      fs.unlinkSync(imagePath);
    }

    return res.json({
      success: true,
      complaint_id: complaintId,
      ai_decision: aiDecision,
      mode: aiDecision.image_analysis ? "fallback" : "gemini-vision"
    });

  } catch (err) {
    console.error("❌ ERROR:", err);
    
    // Clean up uploaded file on error
    if (imagePath) {
      try {
        fs.unlinkSync(imagePath);
      } catch (cleanupErr) {
        console.error("File cleanup error:", cleanupErr);
      }
    }
    
    return res.status(500).json({
      success: false,
      error: "Analysis failed",
      details: err.message
    });
  }
});

// Upsert authority contact info
app.post("/authorities/upsert", async (req, res) => {
  const { name, department, phone, email, website, address, office_hours, area, aliases } = req.body;
  if (!name) {
    return res.status(400).json({ success: false, error: "name is required" });
  }
  try {
    const result = await upsertAuthorityContact({ name, department, phone, email, website, address, office_hours, area, aliases });
    return res.json({ success: true, id: result.id });
  } catch (err) {
    console.error("❌ Upsert authority ERROR:", err.message);
    return res.status(500).json({ success: false, error: "Failed to upsert authority" });
  }
});

// Feedback
app.post("/feedback", async (req, res) => {
  const { complaint_id, satisfied } = req.body;

  if (!complaint_id || satisfied === undefined) {
    return res.status(400).json({
      success: false,
      error: "complaint_id and satisfied are required"
    });
  }

  try {
    let complaintData = null;
    
    if (useFirestore && db) {
      // Get from Firestore
      const complaintDoc = await db.collection("complaints").doc(complaint_id).get();
      complaintData = complaintDoc.data()?.ai_decision;
      
      // Save feedback to Firestore
      await db.collection("feedback").add({
        complaint_id,
        satisfied,
        issue_type: complaintData?.issue_type || "Unknown",
        department: complaintData?.department || "Unknown",
        created_at: new Date()
      });
    } else {
      // Get from in-memory database
      const complaint = complaintDatabase.find(c => c.id === complaint_id);
      complaintData = complaint?.ai_decision;
      
      // Save to in-memory database
      feedbackDatabase.push({
        id: generateId(),
        complaint_id,
        satisfied,
        issue_type: complaintData?.issue_type || "Unknown",
        department: complaintData?.department || "Unknown",
        created_at: new Date().toISOString()
      });
    }

    console.log("✅ Feedback saved for complaint:", complaint_id);
    return res.json({
      success: true
    });
  } catch (err) {
    console.error("❌ Feedback ERROR:", err.message);
    return res.status(500).json({
      success: false,
      error: "Failed to save feedback"
    });
  }
});

app.get("/stats", async (req, res) => {
  try {
    let totalSatisfied = 0;
    let totalNotSatisfied = 0;
    const byIssueType = {};

    const feedbackData = [];

    if (useFirestore && db) {
      // Get from Firestore
      const snapshot = await db.collection("feedback").get();
      snapshot.forEach(doc => {
        feedbackData.push(doc.data());
      });
    } else {
      // Get from in-memory database
      feedbackData.push(...feedbackDatabase);
    }

    // Process feedback data
    feedbackData.forEach(data => {
      const issueType = data.issue_type || "Unknown";
      
      // Overall stats
      if (data.satisfied) {
        totalSatisfied++;
      } else {
        totalNotSatisfied++;
      }
      
      // Stats by issue type
      if (!byIssueType[issueType]) {
        byIssueType[issueType] = {
          issue_type: issueType,
          satisfied: 0,
          not_satisfied: 0,
          total: 0
        };
      }
      
      if (data.satisfied) {
        byIssueType[issueType].satisfied++;
      } else {
        byIssueType[issueType].not_satisfied++;
      }
      byIssueType[issueType].total++;
    });

    const total = totalSatisfied + totalNotSatisfied;
    
    // Calculate percentages for each issue type
    const issueTypeStats = Object.values(byIssueType).map(stat => ({
      ...stat,
      satisfied_percentage: stat.total > 0 ? (stat.satisfied / stat.total) * 100 : 0,
      not_satisfied_percentage: stat.total > 0 ? (stat.not_satisfied / stat.total) * 100 : 0
    }));
    
    return res.json({
      overall: {
        total,
        satisfied: totalSatisfied,
        not_satisfied: totalNotSatisfied,
        satisfied_percentage: total > 0 ? (totalSatisfied / total) * 100 : 0,
        not_satisfied_percentage: total > 0 ? (totalNotSatisfied / total) * 100 : 0
      },
      by_issue_type: issueTypeStats
    });
  } catch (err) {
    console.error("❌ Stats ERROR:", err.message);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch stats"
    });
  }
});

// Get Similar Problems by Issue Type and Area
app.get("/similar-problems", async (req, res) => {
  try {
    const { issue_type, area, user_id } = req.query;

    if (!issue_type || !area) {
      return res.status(400).json({
        success: false,
        error: "issue_type and area are required"
      });
    }

    let similarProblems = [];

    if (useFirestore && db) {
      // Query Firestore for similar complaints
      let query = db.collection("complaints")
        .where("ai_decision.issue_type", "==", issue_type)
        .where("ai_decision.area", "==", area);
      
      const snapshot = await query.get();
      snapshot.forEach(doc => {
        const complaint = doc.data();
        // Don't include own complaint
        if (complaint.user_id !== user_id) {
          similarProblems.push({
            id: doc.id,
            ...complaint,
            created_at: complaint.created_at?.toDate?.()?.toISOString?.() || complaint.created_at
          });
        }
      });
    } else {
      // Search in-memory database
      similarProblems = complaintDatabase.filter(c => 
        c.ai_decision?.issue_type === issue_type && 
        c.ai_decision?.area === area &&
        c.user_id !== user_id
      );
    }

    // Sort by creation date (newest first)
    similarProblems = similarProblems.sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      return dateB - dateA;
    }).slice(0, 10); // Limit to 10 results

    return res.json({
      success: true,
      total: similarProblems.length,
      problems: similarProblems
    });
  } catch (err) {
    console.error("❌ Similar Problems ERROR:", err.message);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch similar problems"
    });
  }
});

// Submit a Solution/Suggestion for a Problem
app.post("/suggestions", async (req, res) => {
  try {
    // Accept both legacy and new payload shapes
    let { complaint_id, user_id, suggestion_text } = req.body;
    if (!suggestion_text && req.body.text) suggestion_text = req.body.text;
    if (!user_id && req.body.suggested_by) user_id = req.body.suggested_by;

    if (!complaint_id || !user_id || !suggestion_text) {
      return res.status(400).json({
        success: false,
        error: "complaint_id, user_id, and suggestion_text are required"
      });
    }

    const suggestionId = generateId();
    const suggestion = {
      id: suggestionId,
      complaint_id,
      user_id,
      suggestion_text,
      rating: 0,
      helpful_count: 0,
      created_at: new Date().toISOString(),
      ratings: [] // Array of individual ratings
    };

    if (useFirestore && db) {
      await db.collection("suggestions").doc(suggestionId).set(suggestion);
    } else {
      if (!Array.isArray(complaintDatabase.suggestions)) {
        complaintDatabase.suggestions = [];
      }
      complaintDatabase.suggestions = complaintDatabase.suggestions || [];
      complaintDatabase.suggestions.push(suggestion);
    }

    return res.json({
      success: true,
      suggestion_id: suggestionId,
      suggestion
    });
  } catch (err) {
    console.error("❌ Suggestion ERROR:", err.message);
    return res.status(500).json({
      success: false,
      error: "Failed to submit suggestion"
    });
  }
});

// Get Suggestions for a Problem
app.get("/suggestions/:complaint_id", async (req, res) => {
  try {
    const { complaint_id } = req.params;

    let suggestions = [];

    if (useFirestore && db) {
      const snapshot = await db.collection("suggestions")
        .where("complaint_id", "==", complaint_id)
        .orderBy("helpful_count", "desc")
        .get();
      
      snapshot.forEach(doc => {
        suggestions.push({
          id: doc.id,
          ...doc.data()
        });
      });
    } else {
      suggestions = (complaintDatabase.suggestions || [])
        .filter(s => s.complaint_id === complaint_id)
        .sort((a, b) => b.helpful_count - a.helpful_count);
    }

    return res.json({
      success: true,
      complaint_id,
      total: suggestions.length,
      suggestions
    });
  } catch (err) {
    console.error("❌ Get Suggestions ERROR:", err.message);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch suggestions"
    });
  }
});

// Rate a Suggestion
app.post("/suggestions/:suggestion_id/rate", async (req, res) => {
  try {
    const { suggestion_id } = req.params;
    const { user_id, rating } = req.body;

    if (!user_id || rating === undefined) {
      return res.status(400).json({
        success: false,
        error: "user_id and rating (0-5) are required"
      });
    }

    if (rating < 0 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: "rating must be between 0 and 5"
      });
    }

    if (useFirestore && db) {
      const docRef = db.collection("suggestions").doc(suggestion_id);
      const doc = await docRef.get();
      
      if (!doc.exists) {
        return res.status(404).json({
          success: false,
          error: "Suggestion not found"
        });
      }

      const data = doc.data();
      const ratings = data.ratings || [];
      
      // Check if user already rated
      const existingRatingIndex = ratings.findIndex(r => r.user_id === user_id);
      if (existingRatingIndex >= 0) {
        ratings[existingRatingIndex].rating = rating;
      } else {
        ratings.push({ user_id, rating });
      }

      const avgRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
      const helpful = ratings.filter(r => r.rating >= 3).length;

      await docRef.update({
        ratings,
        rating: avgRating,
        helpful_count: helpful
      });
    } else {
      const suggestion = (complaintDatabase.suggestions || []).find(s => s.id === suggestion_id);
      if (!suggestion) {
        return res.status(404).json({
          success: false,
          error: "Suggestion not found"
        });
      }

      const ratings = suggestion.ratings || [];
      const existingRatingIndex = ratings.findIndex(r => r.user_id === user_id);
      if (existingRatingIndex >= 0) {
        ratings[existingRatingIndex].rating = rating;
      } else {
        ratings.push({ user_id, rating });
      }

      suggestion.ratings = ratings;
      suggestion.rating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
      suggestion.helpful_count = ratings.filter(r => r.rating >= 3).length;
    }

    return res.json({
      success: true,
      message: "Rating submitted successfully"
    });
  } catch (err) {
    console.error("❌ Rate Suggestion ERROR:", err.message);
    return res.status(500).json({
      success: false,
      error: "Failed to rate suggestion"
    });
  }
});

/* ---------------- ERROR HANDLERS ---------------- */

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  console.error('Stack:', error.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

/* ---------------- SERVER ---------------- */

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Civic backend running on port ${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Firestore: ${useFirestore ? 'Enabled' : 'In-memory storage'}`);
  console.log(`   SMS: ${hasTwilio ? 'Enabled (Twilio)' : 'Console logging'}`);
});

server.on('error', (err) => {
  console.error('❌ Server error:', err);
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please free the port and try again.`);
  }
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});
