import { useState, useEffect } from "react";
import { COURSES } from "./data/courses";
import { CourseProgress, UserProfile, Certificate } from "./types";
import { getProfile, getCourseProgressList, getCertificates } from "./lib/dbService";
import { motion, AnimatePresence } from "motion/react";

// Sub-components
import Navbar from "./components/Navbar";
import LoginScreen from "./components/LoginScreen";
import CourseCard from "./components/CourseCard";
import CourseView from "./components/CourseView";
import CertificatesView from "./components/CertificatesView";
import ProfileView from "./components/ProfileView";
import ProgressView from "./components/ProgressView";

// Icons & style helpers
import { Search, SlidersHorizontal, BookOpen, Award, Sparkles, GraduationCap } from "lucide-react";

export default function App() {
  const [currentUser, setCurrentUser] = useState<{ uid: string; email: string } | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [progressList, setProgressList] = useState<CourseProgress[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);

  // Intro transition splash indicator
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 2800);
    return () => clearTimeout(timer);
  }, []);

  // Navigation state
  const [activeTab, setActiveTab] = useState<"explore" | "profile" | "certificates" | "progress">("explore");
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  // Theme selection state (emerald default, forest canopy, spruce gold)
  const [activeTheme, setActiveTheme] = useState<"emerald" | "forest" | "spruce">(() => {
    return (localStorage.getItem("ilms-theme") as any) || "emerald";
  });

  const handleThemeChange = (theme: "emerald" | "forest" | "spruce") => {
    setActiveTheme(theme);
    localStorage.setItem("ilms-theme", theme);
  };

  // Color mode (light/dark mode) state
  const [colorMode, setColorMode] = useState<"light" | "dark">(() => {
    return (localStorage.getItem("ilms-color-mode") as any) || "light";
  });

  const handleColorModeChange = (mode: "light" | "dark") => {
    setColorMode(mode);
    localStorage.setItem("ilms-color-mode", mode);
  };

  // Filter controllers
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLevel, setSelectedLevel] = useState("All");

  const [loading, setLoading] = useState(true);

  // Monitor MERN Auth Session state securely via localStorage cache
  useEffect(() => {
    const cachedSession = localStorage.getItem("ilms-user-session");
    if (cachedSession) {
      try {
        const cachedUser = JSON.parse(cachedSession);
        if (cachedUser && cachedUser.uid) {
          setCurrentUser({ uid: cachedUser.uid, email: cachedUser.email || "" });

          // Sync database profiles and progress
          (async () => {
            try {
              const profile = await getProfile(cachedUser.uid);
              if (profile) {
                setUserProfile(profile);
              } else {
                const fallbackProfile: UserProfile = {
                  uid: cachedUser.uid,
                  email: cachedUser.email || "",
                  displayName: cachedUser.displayName || "Scholar",
                  joinedAt: new Date().toISOString(),
                  title: "Accredited Scholar",
                  bio: "Configuring learning objectives and taking intensive course quizzes.",
                };
                setUserProfile(fallbackProfile);
              }

              // Fetch Course Progress metrics and Certificates
              const [progress, certs] = await Promise.all([
                getCourseProgressList(cachedUser.uid),
                getCertificates(cachedUser.uid),
              ]);
              setProgressList(progress);
              setCertificates(certs);
            } catch (err) {
              console.warn("MERN Session sync warning:", err);
            } finally {
              setLoading(false);
            }
          })();
          return;
        }
      } catch (err) {
        console.warn("Could not retrieve cached MERN session:", err);
      }
    }
    setLoading(false);
  }, []);

  // Set local state manually after MERN credentials success
  const handleLoginSuccess = async (uid: string, email: string, displayName: string) => {
    const userSession = { uid, email, displayName };
    localStorage.setItem("ilms-user-session", JSON.stringify(userSession));
    
    setCurrentUser({ uid, email });
    setLoading(true);

    try {
      const profile = await getProfile(uid);
      if (profile) {
        setUserProfile(profile);
      } else {
        const localProf: UserProfile = {
          uid,
          email,
          displayName,
          joinedAt: new Date().toISOString(),
          title: "Specialist Scholar",
          bio: "Configuring learning objectives and taking interactive course quizzes.",
        };
        setUserProfile(localProf);
      }

      const [progress, certs] = await Promise.all([
        getCourseProgressList(uid),
        getCertificates(uid),
      ]);
      setProgressList(progress);
      setCertificates(certs);
    } catch (e) {
      console.warn("MERN State resolution error:", e);
    } finally {
      setLoading(false);
    }
  };

  // Logout session handler
  const handleLogout = async () => {
    localStorage.removeItem("ilms-user-session");
    setCurrentUser(null);
    setUserProfile(null);
    setProgressList([]);
    setCertificates([]);
    setSelectedCourseId(null);
  };


  // Sync Progress updates from active course quizzes
  const handleProgressUpdated = (newProgress: CourseProgress) => {
    setProgressList((prevList) => {
      const idx = prevList.findIndex((p) => p.courseId === newProgress.courseId);
      if (idx > -1) {
        const updatedList = [...prevList];
        updatedList[idx] = newProgress;
        return updatedList;
      }
      return [...prevList, newProgress];
    });
  };

  // Sync certificate earnings and instantly route them to the Awards tab!
  const handleCertificateEarned = (newCertificate: Certificate) => {
    setCertificates((prev) => [...prev, newCertificate]);
    
    // Auto mark matching progress course complete
    setProgressList((prevList) => {
      return prevList.map((p) => {
        if (p.courseId === newCertificate.courseId) {
          return { ...p, completed: true, certificateId: newCertificate.id };
        }
        return p;
      });
    });

    // Seamlessly navigate to awards tab to review their gorgeous new gold certificate!
    setActiveTab("certificates");
    setSelectedCourseId(null);
  };

  // Profile data update tracker
  const handleProfileUpdated = (updatedProfile: UserProfile) => {
    setUserProfile(updatedProfile);
  };

  // Categories list extractor
  const categoriesList = ["All", "Tech", "AI", "Design", "Business", "Marketing"];

  // Search filter implementation
  const filteredCourses = COURSES.filter((course) => {
    const matchesQuery =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === "All" || course.category === selectedCategory;
    const matchesLevel = selectedLevel === "All" || course.level === selectedLevel;

    return matchesQuery && matchesCategory && matchesLevel;
  });

  // Calculate statistics for dynamic metrics display on main explore tab
  const activeEnrolledCount = progressList.length;
  const certifiedEducations = progressList.filter((p) => p.completed).length;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 shadow-md shadow-indigo-100 mx-auto animate-bounce mb-4">
            <GraduationCap className="h-7 w-7 text-white" />
          </div>
          <p className="text-sm font-semibold text-slate-800">Initializing Educational Pipeline...</p>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">I-LMS famous decker system</p>
        </div>
      </div>
    );
  }

  const selectedCourse = COURSES.find((c) => c.id === selectedCourseId);
  const activeCourseProgress = progressList.find((p) => p.courseId === selectedCourseId);

  return (
    <>
      <AnimatePresence>
        {showIntro && (
          <motion.div
            key="intro-splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#030907] select-none pointer-events-none"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="text-center flex flex-col items-center"
            >
              {/* Spinning/glowing layout with logo */}
              <div className="relative mb-5">
                <div className="absolute inset-0 rounded-2xl bg-indigo-500/20 blur-xl animate-pulse"></div>
                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-emerald-700 border border-emerald-400/25 shadow-2xl">
                  <GraduationCap className="h-8 w-8 text-white animate-pulse" />
                </div>
              </div>

              {/* Typography hierarchy */}
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-[0.25em] font-sans text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-indigo-200 uppercase leading-none pl-[0.25em]">
                I-LMS
              </h1>

              {/* Accents and subtitles */}
              <div className="mt-4 flex items-center gap-2.5">
                <span className="h-0.5 w-4 bg-emerald-500/40"></span>
                <p className="font-mono text-[9px] tracking-[0.3em] font-bold text-emerald-400 uppercase leading-none">
                  ACCREDITED LEARNING DIRECTORY
                </p>
                <span className="h-0.5 w-4 bg-emerald-500/40"></span>
              </div>

              <span className="mt-6 font-mono text-[8px] text-slate-500 uppercase tracking-[0.35em] block pl-[0.35em]">
                Initializing Academic Portal
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {!currentUser || !userProfile ? (
        <div className={`min-h-screen flex flex-col theme-${activeTheme} ${colorMode === "dark" ? "dark bg-[#040908] text-slate-100" : "bg-slate-50 text-slate-900"}`}>
          <LoginScreen onLoginSuccess={handleLoginSuccess} />
        </div>
      ) : (
        <div className={`min-h-screen flex flex-col theme-${activeTheme} ${colorMode === "dark" ? "dark bg-[#040908] text-slate-100" : "bg-slate-50 text-slate-900"}`}>
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSelectedCourseId(null); // Reset course view on navigation tab shifts
        }}
        userProfile={userProfile}
        onLogout={handleLogout}
        activeTheme={activeTheme}
        setActiveTheme={handleThemeChange}
        colorMode={colorMode}
        setColorMode={handleColorModeChange}
      />

      {/* Main active layout */}
      <main className="flex-1 pb-16">
        {selectedCourse ? (
          <CourseView
            course={selectedCourse}
            progress={activeCourseProgress}
            uid={currentUser.uid}
            studentName={userProfile.displayName}
            onBack={() => setSelectedCourseId(null)}
            onProgressUpdated={handleProgressUpdated}
            onCertificateEarned={handleCertificateEarned}
          />
        ) : activeTab === "profile" ? (
          <ProfileView
            userProfile={userProfile}
            courses={COURSES}
            progressList={progressList}
            onProfileUpdated={handleProfileUpdated}
          />
        ) : activeTab === "certificates" ? (
          <CertificatesView certificates={certificates} />
        ) : activeTab === "progress" ? (
          <ProgressView
            courses={COURSES}
            progressList={progressList}
          />
        ) : (
          /* Explore Tab (Course List and search filters) */
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            
            {/* Minimalist Welcome banner card */}
            <div className={`relative overflow-hidden rounded-2xl p-6 sm:p-10 mb-8 shadow-sm border transition-all duration-300 ${
              colorMode === "dark" 
                ? "bg-gradient-to-r from-indigo-950/60 to-indigo-900/40 border-indigo-900/50 text-slate-100" 
                : "bg-gradient-to-r from-indigo-50 to-indigo-100/30 border-indigo-100 text-slate-900"
            }`}>
              <div className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-15" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=70&w=600&auto=format&fit=crop')" }}></div>
              <div className="relative z-10 max-w-3xl">
                <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold tracking-wide uppercase ${
                  colorMode === "dark"
                    ? "bg-indigo-500/10 border border-indigo-400/20 text-indigo-300"
                    : "bg-indigo-100 border border-indigo-200 text-indigo-800"
                }`}>
                  <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                  Self-Paced Accreditation System
                </span>
                <h2 className={`mt-4 text-3xl sm:text-4xl font-bold font-display tracking-tight ${
                  colorMode === "dark" ? "text-indigo-50" : "text-indigo-950"
                }`}>
                  Welcome back, {userProfile.displayName || "Scholar"}
                </h2>
                <p className={`mt-2.5 text-sm leading-relaxed max-w-xl ${
                  colorMode === "dark" ? "text-indigo-200/80" : "text-indigo-900/85"
                }`}>
                  You are currently enrolled in <strong className={`font-mono px-1.5 py-0.5 rounded ${
                    colorMode === "dark" ? "text-indigo-50 bg-indigo-500/20" : "text-indigo-950 bg-indigo-100"
                  }`}>{activeEnrolledCount}</strong> pathways. Complete your modular syllabi checks to unlock gold-sealed credentials, featuring custom-synthesized performance evaluations drafted by Gemini.
                </p>

                <div className="mt-6 flex flex-wrap gap-4 text-xs font-semibold">
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border leading-none transition-all ${
                    colorMode === "dark"
                      ? "bg-indigo-950/50 text-indigo-200 border-indigo-800/30"
                      : "bg-white/90 text-indigo-900 border-indigo-200/60 shadow-sm"
                  }`}>
                    <BookOpen className="h-4 w-4 text-indigo-500" />
                    <span>Enrolled: {activeEnrolledCount} Active</span>
                  </div>
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border leading-none transition-all ${
                    colorMode === "dark"
                      ? "bg-indigo-950/50 text-indigo-200 border-indigo-800/30"
                      : "bg-white/90 text-indigo-900 border-indigo-200/60 shadow-sm"
                  }`}>
                    <Award className="h-4 w-4 text-amber-500" />
                    <span>Graduated: {certifiedEducations} Certified</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Program search and advanced filter ribbon */}
            <div className="rounded-xl border border-slate-200/80 bg-white p-4 mb-8 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                
                {/* Search Bar */}
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Search className="h-4.5 w-4.5" />
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search over 20 curriculum directories, instructors, or technical stacks..."
                    className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-xs outline-none transitionfocus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 placeholder:text-slate-400"
                  />
                </div>

                {/* Level complexity dropdown filter */}
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-slate-400 shrink-0" />
                  <select
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 bg-white outline-none focus:border-indigo-500"
                  >
                    <option value="All">All Expertise Levels</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              {/* Tab filters */}
              <div className="mt-4 flex flex-wrap gap-1.5 border-t border-slate-100 pt-3.5">
                {categoriesList.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-all ${
                      selectedCategory === cat
                        ? "bg-slate-900 text-white"
                        : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Course Grid showing results */}
            {filteredCourses.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-slate-200/60 p-12 text-center bg-white">
                <p className="text-sm font-semibold text-slate-500">No curriculum paths fit your specific active filter choices.</p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("All");
                    setSelectedLevel("All");
                  }}
                  className="mt-3 inline-flex items-center text-xs font-bold text-indigo-600 hover:text-indigo-500 hover:underline"
                >
                  Reset parameters list
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">
                    Syllabi Courses ({filteredCourses.length} Pathways Loaded)
                  </h3>
                  <span className="text-[11px] font-mono text-slate-400">f famosa decker standard verified directories</span>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredCourses.map((course) => {
                    const prog = progressList.find((p) => p.courseId === course.id);
                    return (
                      <CourseCard
                        key={course.id}
                        course={course}
                        progress={prog}
                        onSelect={(id) => setSelectedCourseId(id)}
                      />
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        )}
      </main>
        </div>
      )}
    </>
  );
}
