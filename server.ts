import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import mongoose, { Schema } from "mongoose";

// Load environment variables securely
import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// ==========================================
// MONGODB SCHEMAS & MODELS
// ==========================================

let mongoConnected = false;
let connectionError = "";

const UserProfileSchema = new Schema({
  uid: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  displayName: { type: String, required: true },
  photoURL: { type: String, default: "" },
  title: { type: String, default: "Scholar" },
  bio: { type: String, default: "" },
  joinedAt: { type: String, default: () => new Date().toISOString() },
  password: { type: String }, // simple password storage for accreditation demo
});

const CourseProgressSchema = new Schema({
  uid: { type: String, required: true },
  courseId: { type: String, required: true },
  completedModules: { type: [String], default: [] },
  quizScores: { type: Map, of: Number, default: {} },
  completed: { type: Boolean, default: false },
  completedAt: { type: String },
  certificateId: { type: String },
});
// Compound unique key to keep metrics structured per user and course
CourseProgressSchema.index({ uid: 1, courseId: 1 }, { unique: true });

const CertificateSchema = new Schema({
  id: { type: String, required: true, unique: true },
  uid: { type: String, required: true },
  courseId: { type: String, required: true },
  courseTitle: { type: String, required: true },
  studentName: { type: String, required: true },
  issuedAt: { type: String, default: () => new Date().toISOString() },
  grade: { type: Number, required: true },
  verificationCode: { type: String, required: true },
  aiAppraisal: { type: String, required: true },
});

const UserProfileModel = mongoose.models.UserProfile || mongoose.model("UserProfile", UserProfileSchema);
const CourseProgressModel = mongoose.models.CourseProgress || mongoose.model("CourseProgress", CourseProgressSchema);
const CertificateModel = mongoose.models.Certificate || mongoose.model("Certificate", CertificateSchema);

// In-Memory Fallback DB in case MongoDB connection is absent or failing
const memoryStore = {
  users: [] as any[],
  progress: {} as Record<string, any[]>,
  certificates: {} as Record<string, any[]>,
};

// Lazy MongoDB initialize handler
async function connectToMongo() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn("MONGODB_URI is not provided in .env! Operating in hybrid local-memory & client localStorage fallback mode.");
    mongoConnected = false;
    connectionError = "MONGODB_URI prefix not found in variables";
    return;
  }
  try {
    // Disable Mongoose global model action buffering to prevent API route hangs under connection loss
    mongoose.set("bufferCommands", false);
    
    // Connect with a 3-second rapid timeout limit for server selection and connection
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
      connectTimeoutMS: 3000,
    });
    mongoConnected = true;
    connectionError = "";
    console.log("Successfully coupled with MongoDB Database via Mongoose!");
  } catch (err: any) {
    console.error("Mongoose failed to connect to the supplied MONGODB_URI:", err);
    mongoConnected = false;
    connectionError = err.message || "Failed to establish socket pipeline";
  }
}

// Connect instantly
connectToMongo();

// ==========================================
// MERN STACK PERSISTENCE ENDPOINTS
// ==========================================

// 1. Connection status endpoint
app.get("/api/mongodb-status", (_req, res) => {
  res.json({
    connected: mongoConnected,
    uriSupplied: !!process.env.MONGODB_URI,
    error: connectionError || null,
    provider: mongoConnected ? "MongoDB Atlas Real-time" : "In-Memory Session Engine & LocalStorage Fallback",
  });
});

// 2. Authentication: Registration API
app.post("/api/auth/register", async (req, res) => {
  const { email, password, displayName } = req.body;
  
  if (!email || !displayName) {
    return res.status(400).json({ error: "Missing required profile registrations fields (email, displayName)." });
  }

  const cleanEmail = email.trim();
  const uid = `mern-user-${Math.floor(Math.random() * 900000) + 100000}`;
  const passwordVal = password || "defaultPass123";

  const newProfile = {
    uid,
    email: cleanEmail,
    displayName: displayName.trim(),
    photoURL: "",
    title: "Senior Certified Scholar",
    bio: "Enrolled in premium curriculum pathways. Accomplishing structured milestones.",
    joinedAt: new Date().toISOString(),
    password: passwordVal,
  };

  if (mongoConnected) {
    try {
      // Check existing
      const existing = await UserProfileModel.findOne({ email: cleanEmail });
      if (existing) {
        return res.status(400).json({ error: "A scholar is already registered with this email address." });
      }

      const instance = new UserProfileModel(newProfile);
      await instance.save();
      return res.json({ success: true, user: { uid, email: cleanEmail, displayName: newProfile.displayName } });
    } catch (err: any) {
      console.error("MongoDB register error:", err);
    }
  }

  // Fallback storage
  const isDuplicate = memoryStore.users.some(u => u.email === cleanEmail);
  if (isDuplicate) {
    return res.status(400).json({ error: "A scholar with this email is already registered." });
  }

  memoryStore.users.push(newProfile);
  return res.json({ success: true, user: { uid, email: cleanEmail, displayName: newProfile.displayName } });
});

// 3. Authentication: Login API
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required to access the academic portal." });
  }

  const cleanEmail = email.trim();
  const pass = password || "defaultPass123";

  if (mongoConnected) {
    try {
      const user = await UserProfileModel.findOne({ email: cleanEmail });
      if (user) {
        // Since it's educational demo credentials, check matching password
        if (user.password && user.password !== pass) {
          return res.status(401).json({ error: "Invalid password for this registered email profile." });
        }
        return res.json({ success: true, user: { uid: user.uid, email: user.email, displayName: user.displayName } });
      } else {
        return res.status(404).json({ error: "No scholar found. Please sign up to create your transcript portal." });
      }
    } catch (err: any) {
      console.error("MongoDB Login error:", err);
    }
  }

  // Fallback memory search
  const found = memoryStore.users.find(u => u.email === cleanEmail);
  if (found) {
    if (found.password && found.password !== pass) {
      return res.status(401).json({ error: "Invalid passphrase." });
    }
    return res.json({ success: true, user: { uid: found.uid, email: found.email, displayName: found.displayName } });
  }

  return res.status(404).json({ error: "Scholar email profile not found. Please register to initialize your record." });
});

// 4. Profiles management
app.get("/api/profile/:uid", async (req, res) => {
  const { uid } = req.params;
  if (mongoConnected) {
    try {
      const profile = await UserProfileModel.findOne({ uid });
      if (profile) return res.json(profile);
    } catch (err) {
      console.error("MongoDB getProfile failure:", err);
    }
  }
  const memoryUser = memoryStore.users.find(u => u.uid === uid);
  return res.json(memoryUser || null);
});

app.post("/api/profile", async (req, res) => {
  const profile = req.body;
  if (!profile.uid) {
    return res.status(400).json({ error: "Missing user UID in request body." });
  }

  if (mongoConnected) {
    try {
      await UserProfileModel.findOneAndUpdate(
        { uid: profile.uid },
        { $set: profile },
        { upsert: true, new: true }
      );
      return res.json({ success: true });
    } catch (err) {
      console.error("MongoDB saveProfile error:", err);
    }
  }

  // Fallback saving is handled natively
  const idx = memoryStore.users.findIndex(u => u.uid === profile.uid);
  if (idx > -1) {
    memoryStore.users[idx] = { ...memoryStore.users[idx], ...profile };
  } else {
    memoryStore.users.push(profile);
  }
  return res.json({ success: true });
});

// 5. Progress Management
app.get("/api/progress/:uid", async (req, res) => {
  const { uid } = req.params;
  if (mongoConnected) {
    try {
      const progressList = await CourseProgressModel.find({ uid });
      return res.json(progressList);
    } catch (err) {
      console.error("MongoDB getProgress failure:", err);
    }
  }
  return res.json(memoryStore.progress[uid] || []);
});

app.post("/api/progress", async (req, res) => {
  const { uid, courseId, progress } = req.body;
  if (!uid || !courseId || !progress) {
    return res.status(400).json({ error: "Missing required progress log elements." });
  }

  if (mongoConnected) {
    try {
      await CourseProgressModel.findOneAndUpdate(
        { uid, courseId },
        { 
          $set: { 
            uid,
            courseId,
            completedModules: progress.completedModules,
            quizScores: progress.quizScores,
            completed: progress.completed,
            completedAt: progress.completedAt || null,
            certificateId: progress.certificateId || null
          }
        },
        { upsert: true, new: true }
      );
      return res.json({ success: true });
    } catch (err) {
      console.error("MongoDB saveProgress error:", err);
    }
  }

  // Local storage cache fallback
  if (!memoryStore.progress[uid]) memoryStore.progress[uid] = [];
  const idx = memoryStore.progress[uid].findIndex(p => p.courseId === courseId);
  if (idx > -1) {
    memoryStore.progress[uid][idx] = { uid, courseId, ...progress };
  } else {
    memoryStore.progress[uid].push({ uid, courseId, ...progress });
  }
  return res.json({ success: true });
});

app.post("/api/progress/complete", async (req, res) => {
  const { uid, courseId, certificateId } = req.body;
  if (!uid || !courseId) {
    return res.status(400).json({ error: "Missing progress complete identifiers." });
  }

  if (mongoConnected) {
    try {
      await CourseProgressModel.findOneAndUpdate(
        { uid, courseId },
        { 
          $set: { 
            completed: true,
            completedAt: new Date().toISOString(),
            certificateId
          }
        }
      );
      return res.json({ success: true });
    } catch (err) {
      console.error("MongoDB completeCourse failure:", err);
    }
  }

  if (memoryStore.progress[uid]) {
    const item = memoryStore.progress[uid].find(p => p.courseId === courseId);
    if (item) {
      item.completed = true;
      item.completedAt = new Date().toISOString();
      item.certificateId = certificateId;
    }
  }
  return res.json({ success: true });
});

// 6. Certificates Management
app.get("/api/certificates/:uid", async (req, res) => {
  const { uid } = req.params;
  if (mongoConnected) {
    try {
      const certs = await CertificateModel.find({ uid });
      return res.json(certs);
    } catch (err) {
      console.error("MongoDB list certificates failure:", err);
    }
  }
  return res.json(memoryStore.certificates[uid] || []);
});

app.post("/api/certificates", async (req, res) => {
  const cert = req.body;
  if (!cert.id || !cert.uid) {
    return res.status(400).json({ error: "Missing essential academic Certificate records." });
  }

  if (mongoConnected) {
    try {
      const instance = new CertificateModel(cert);
      await instance.save();
      return res.json({ success: true });
    } catch (err) {
      console.warn("MongoDB certificate save failed (it might already exist):", err);
    }
  }

  if (!memoryStore.certificates[cert.uid]) memoryStore.certificates[cert.uid] = [];
  const exists = memoryStore.certificates[cert.uid].some(c => c.id === cert.id);
  if (!exists) {
    memoryStore.certificates[cert.uid].push(cert);
  }
  return res.json({ success: true });
});

// ==========================================
// INITIAL GEMINI CONFIGURATIONS
// ==========================================

// Initialize Gemini Client Lazily to prevent crash if key is missing
let aiClient: GoogleGenAI | null = null;
function getAi(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key) {
      aiClient = new GoogleGenAI({ apiKey: key });
    }
  }
  return aiClient;
}

// REST route for AI certificate appraisal
app.post("/api/generate-appraisal", async (req, res) => {
  const { studentName, courseTitle, grade } = req.body;

  if (!studentName || !courseTitle) {
    return res.status(400).json({ error: "Missing required fields: studentName or courseTitle" });
  }

  const calculatedGrade = grade || 100;

  try {
    const ai = getAi();
    if (!ai) {
      // Return a premium styled fallback citation if key is missing
      const fallbackCitation = `This certificate recognizes outstanding dedication in mastering the core principles of ${courseTitle}. Having finished all curriculum requirements and completed active module testing modules with an overall grade of ${calculatedGrade}%, this learner is accredited for exhibiting excellent analytical aptitude, practical design discipline, and technological mastery.`;
      return res.json({ appraisal: fallbackCitation, source: "fallback" });
    }

    const prompt = `Write a professional, academic, inspiring, and concise certification citation/appraisal for a student named "${studentName}" who completed the course "${courseTitle}" with a final score of ${calculatedGrade}%. Highlight their commitment to learning, core competence, and analytical rigor. Keep the appraisal to exactly 3 or 4 sentences, in a highly polished and professional tone matching an Ivy League elite academy or high-end technical institute. Do not use markdown like bold stars or headers. Simply output the raw paragraph.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const text = response.text?.trim() || "Excellent performance, diligence, and academic rigor demonstrated throughout this technical curriculum.";
    return res.json({ appraisal: text, source: "gemini" });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    const fallbackCitation = `This certificate recognizes outstanding dedication in mastering the core principles of ${courseTitle}. Having finished all curriculum requirements and completed active module testing modules with an overall grade of ${calculatedGrade}%, this learner is accredited for exhibiting excellent analytical aptitude, practical design discipline, and technological mastery.`;
    return res.json({ appraisal: fallbackCitation, source: "error-fallback" });
  }
});

// REST route for AI doubts chatbot
app.post("/api/lesson-chatbot", async (req, res) => {
  const { lessonTitle, lessonDescription, query, chatHistory } = req.body;

  if (!query) {
    return res.status(400).json({ error: "Missing query" });
  }

  try {
    const ai = getAi();
    if (!ai) {
      const fallbackResponse = `[Demo Mode] As there is no active Gemini API Key detected in this instance, here is a simulated educational guide for your question about "${lessonTitle}":

To best understand this lesson's objectives:
1. Make sure to review the video content and take note of the terminology.
2. In "${lessonTitle}", the focus is on mastering real-world practical patterns. If you are preparing notes, map out how this links with other course metrics!
3. Formulate specific test cases in your scratchpad before attempting the Module Knowledge Check.

(Note: Once a GEMINI_API_KEY secret is provisioned, this chatbot will answer with intelligent personalized Gemini-3.5 tutoring!)`;
      return res.json({ response: fallbackResponse, source: "fallback" });
    }

    const formattedHistory = (chatHistory || []).map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.text }]
    }));

    const systemMessage = `You are a warm, highly encouraging, and deeply knowledgeable elite academic AI tutor. The student is currently studying the lesson: "${lessonTitle}". Lesson description: "${lessonDescription}". Answer the student's doubt with expert precision, dividing your explanations into clear, easily digestible points or paragraphs. Keep your response helpful, friendly, and under 250 words. Speak directly to the student and don't prefix with roles.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        ...formattedHistory,
        { role: "user", parts: [{ text: query }] }
      ],
      config: {
        systemInstruction: systemMessage,
      }
    });

    const text = response.text?.trim() || "I am processing your query. Could you please specify your concern about this curriculum?";
    return res.json({ response: text, source: "gemini" });
  } catch (error: any) {
    console.error("Lesson Chatbot error:", error);
    return res.status(500).json({ error: "Failed to generate AI response. Please ensure your Gemini configuration parameters are set." });
  }
});

// Vite middleware configuration for double development/production environment support
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in development mode...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in production mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

