import { UserProfile, CourseProgress, Certificate } from "../types";

// Local storage key names for fallback mode
const STORAGE_PROGRESS_KEY = "ilms_progress";
const STORAGE_PROFILE_KEY = "ilms_profiles";
const STORAGE_CERTIFICATE_KEY = "ilms_certificates";

/**
 * Checks connectivity status of MongoDB from Express server
 */
export async function getMongoDbStatus(): Promise<{ connected: boolean; provider: string; error?: string }> {
  try {
    const res = await fetch("/api/mongodb-status");
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn("Could not query server database health endpoint:", err);
  }
  return { connected: false, provider: "Client LocalStorage Offline Mode" };
}

/**
 * Robust Profiling Services
 */
export async function saveProfile(profile: UserProfile): Promise<void> {
  try {
    const res = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
    if (!res.ok) {
      console.warn("POST /api/profile returned non-OK status");
    }
  } catch (err) {
    console.warn("MongoDB API error saving profile, falling back to LocalStorage:", err);
  }
  // Store in LocalStorage fallback
  const profiles = JSON.parse(localStorage.getItem(STORAGE_PROFILE_KEY) || "{}");
  profiles[profile.uid] = profile;
  localStorage.setItem(STORAGE_PROFILE_KEY, JSON.stringify(profiles));
}

export async function getProfile(uid: string): Promise<UserProfile | null> {
  try {
    const res = await fetch(`/api/profile/${uid}`);
    if (res.ok) {
      const data = await res.json();
      if (data) return data as UserProfile;
    }
  } catch (err) {
    console.warn("MongoDB API error getting profile, using LocalStorage:", err);
  }

  // LocalStorage fallback
  const profiles = JSON.parse(localStorage.getItem(STORAGE_PROFILE_KEY) || "{}");
  return profiles[uid] || null;
}

/**
 * Robust Progress Tracking Services
 */
export async function saveModuleProgress(
  uid: string,
  courseId: string,
  moduleId: string,
  score: number,
  passed: boolean
): Promise<CourseProgress> {
  // Find current progress
  const currentProgressList = await getCourseProgressList(uid);
  let courseProgress = currentProgressList.find((p) => p.courseId === courseId);

  if (!courseProgress) {
    courseProgress = {
      courseId,
      completedModules: [],
      quizScores: {},
      completed: false,
    };
  }

  // Update modules and scores
  if (!courseProgress.completedModules.includes(moduleId) && passed) {
    courseProgress.completedModules.push(moduleId);
  }
  courseProgress.quizScores[moduleId] = score;

  try {
    const res = await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid, courseId, progress: courseProgress }),
    });
    if (!res.ok) {
      console.warn("POST /api/progress returned non-OK status");
    }
  } catch (err) {
    console.warn("MongoDB API error saving progress, falling back to LocalStorage:", err);
  }

  // Update in LocalStorage fallback
  const allProgress = JSON.parse(localStorage.getItem(STORAGE_PROGRESS_KEY) || "{}");
  if (!allProgress[uid]) allProgress[uid] = {};
  allProgress[uid][courseId] = courseProgress;
  localStorage.setItem(STORAGE_PROGRESS_KEY, JSON.stringify(allProgress));

  return courseProgress;
}

export async function getCourseProgressList(uid: string): Promise<CourseProgress[]> {
  try {
    const res = await fetch(`/api/progress/${uid}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.length > 0) {
        // Mongoose maps might turn into nested key-value pairs, we standardise it
        return data.map((item: any) => {
          let scoresObj: Record<string, number> = {};
          if (item.quizScores) {
            if (item.quizScores instanceof Map) {
              scoresObj = Object.fromEntries(item.quizScores);
            } else if (typeof item.quizScores === "object") {
              scoresObj = { ...item.quizScores };
            }
          }
          return {
            courseId: item.courseId,
            completedModules: item.completedModules || [],
            quizScores: scoresObj,
            completed: !!item.completed,
            completedAt: item.completedAt,
            certificateId: item.certificateId,
          } as CourseProgress;
        });
      }
    }
  } catch (err) {
    console.warn("MongoDB API error listing progress, looking in LocalStorage:", err);
  }

  // fallback to LocalStorage
  const allProgress = JSON.parse(localStorage.getItem(STORAGE_PROGRESS_KEY) || "{}");
  const userProgress = allProgress[uid] || {};
  return Object.values(userProgress);
}

export async function markCourseComplete(
  uid: string,
  courseId: string,
  certificateId: string
): Promise<void> {
  try {
    const res = await fetch("/api/progress/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid, courseId, certificateId }),
    });
    if (!res.ok) {
      console.warn("POST /api/progress/complete returned non-OK status");
    }
  } catch (err) {
    console.warn("MongoDB API error marking course complete, using LocalStorage:", err);
  }

  // LocalStorage update
  const allProgress = JSON.parse(localStorage.getItem(STORAGE_PROGRESS_KEY) || "{}");
  if (allProgress[uid] && allProgress[uid][courseId]) {
    allProgress[uid][courseId].completed = true;
    allProgress[uid][courseId].completedAt = new Date().toISOString();
    allProgress[uid][courseId].certificateId = certificateId;
    localStorage.setItem(STORAGE_PROGRESS_KEY, JSON.stringify(allProgress));
  }
}

/**
 * Intelligent Certification Generation (with Gemini proxy integrations)
 */
export async function createAICertificate(
  uid: string,
  courseId: string,
  courseTitle: string,
  studentName: string,
  grade: number
): Promise<Certificate> {
  const verificationCode = `ILMS-${Math.floor(100000 + Math.random() * 900000)}`;
  const certId = `cert-${courseId}-${uid}`;

  // Call Express API route backend proxy to compile professional AI citation appraisal
  let aiAppraisal = "";
  try {
    const response = await fetch("/api/generate-appraisal", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ studentName, courseTitle, grade }),
    });
    if (response.ok) {
      const data = await response.json();
      aiAppraisal = data.appraisal;
    }
  } catch (e) {
    console.warn("Failed proxying AI appraisal, using premium client synthesizer:", e);
  }

  if (!aiAppraisal) {
    aiAppraisal = `This certificate recognizes outstanding dedication in mastering the core principles of ${courseTitle}. Having finished all curriculum requirements and completed active module testing modules with an overall grade of ${grade}%, ${studentName} is accredited for exhibiting excellent analytical aptitude, practical design discipline, and technological mastery.`;
  }

  const certificate: Certificate = {
    id: certId,
    uid,
    courseId,
    courseTitle,
    studentName,
    issuedAt: new Date().toISOString(),
    grade,
    verificationCode,
    aiAppraisal,
  };

  try {
    const res = await fetch("/api/certificates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(certificate),
    });
    if (!res.ok) {
      console.warn("POST /api/certificates returned non-OK status");
    }
  } catch (err) {
    console.warn("MongoDB API error storing certificate, saving to LocalStorage fallback:", err);
  }

  // LocalStorage save
  const certs = JSON.parse(localStorage.getItem(STORAGE_CERTIFICATE_KEY) || "{}");
  if (!certs[uid]) certs[uid] = {};
  certs[uid][courseId] = certificate;
  localStorage.setItem(STORAGE_CERTIFICATE_KEY, JSON.stringify(certs));

  // Mark the course as complete too
  await markCourseComplete(uid, courseId, certId);

  return certificate;
}

export async function getCertificates(uid: string): Promise<Certificate[]> {
  try {
    const res = await fetch(`/api/certificates/${uid}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.length > 0) return data as Certificate[];
    }
  } catch (err) {
    console.warn("MongoDB query certificates failed, fetching from LocalStorage:", err);
  }

  // LocalStorage fallback
  const certs = JSON.parse(localStorage.getItem(STORAGE_CERTIFICATE_KEY) || "{}");
  const userCerts = certs[uid] || {};
  return Object.values(userCerts);
}
