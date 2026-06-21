import React, { useState, useEffect } from "react";
import { UserProfile, Course, CourseProgress } from "../types";
import { saveProfile } from "../lib/dbService";
import { Award, CheckCircle2, BookOpen, Clock, Check, Save, User } from "lucide-react";

interface ProfileViewProps {
  userProfile: UserProfile;
  courses: Course[];
  progressList: CourseProgress[];
  onProfileUpdated: (updated: UserProfile) => void;
}

export default function ProfileView({ userProfile, courses, progressList, onProfileUpdated }: ProfileViewProps) {
  const [displayName, setDisplayName] = useState(userProfile.displayName || "");
  const [title, setTitle] = useState(userProfile.title || "");
  const [bio, setBio] = useState(userProfile.bio || "");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Sync state if userProfile props change
  useEffect(() => {
    setDisplayName(userProfile.displayName || "");
    setTitle(userProfile.title || "");
    setBio(userProfile.bio || "");
  }, [userProfile]);

  // Calculate statistics
  const totalCoursesInteracted = progressList.length;
  const completedCoursesCount = progressList.filter((p) => p.completed).length;

  // Calculate skill traits index
  const getSkillMetrics = () => {
    let frontend = 25;
    let backend = 25;
    let ai = 25;
    let analytics = 30;
    let quality = 35;

    progressList.forEach((p) => {
      const course = courses.find((c) => c.id === p.courseId);
      if (!course) return;
      
      const finishedModules = p.completedModules.length;
      const totalModules = course.modules.length;
      const completionRatio = totalModules > 0 ? (finishedModules / totalModules) : 0;
      
      if (course.category.toLowerCase().includes("frontend") || course.category.toLowerCase().includes("react") || course.category.toLowerCase().includes("css")) {
        frontend += Math.round(completionRatio * 45);
      } else if (course.category.toLowerCase().includes("backend") || course.category.toLowerCase().includes("firebase") || course.category.toLowerCase().includes("db")) {
        backend += Math.round(completionRatio * 45);
      } else if (course.category.toLowerCase().includes("ai") || course.category.toLowerCase().includes("llm") || course.category.toLowerCase().includes("gemini")) {
        ai += Math.round(completionRatio * 45);
      } else {
        analytics += Math.round(completionRatio * 40);
      }

      let quizSum = 0;
      let quizCount = 0;
      Object.values(p.quizScores).forEach((sc) => {
        quizSum += sc;
        quizCount++;
      });
      if (quizCount > 0) {
        quality += Math.round((quizSum / quizCount) * 0.5);
      }
    });

    return {
      "Frontend": Math.min(frontend, 100),
      "Backend": Math.min(backend, 100),
      "AI Engineering": Math.min(ai, 100),
      "Analytics": Math.min(analytics, 100),
      "Code Quality": Math.min(quality, 100),
    };
  };

  const skills = getSkillMetrics();
  const center = 110;
  const radius = 70;
  const entries = Object.entries(skills);

  const getCoordinates = (index: number, val: number) => {
    const angle = (index * 2 * Math.PI) / 5 - Math.PI / 2;
    const x = center + (radius * (val / 100)) * Math.cos(angle);
    const y = center + (radius * (val / 100)) * Math.sin(angle);
    return { x, y };
  };

  const pointsString = entries
    .map(([_, val], i) => {
      const { x, y } = getCoordinates(i, val);
      return `${x},${y}`;
    })
    .join(" ");

  // Calculate cumulative grade average
  let totalScoresSum = 0;
  let scoresCount = 0;
  progressList.forEach((p) => {
    Object.values(p.quizScores).forEach((score) => {
      totalScoresSum += score;
      scoresCount++;
    });
  });
  const cumulativeGrade = scoresCount > 0 ? Math.round(totalScoresSum / scoresCount) : null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    const updatedProfile: UserProfile = {
      ...userProfile,
      displayName: displayName.trim(),
      title: title.trim(),
      bio: bio.trim(),
    };

    try {
      await saveProfile(updatedProfile);
      onProfileUpdated(updatedProfile);
      setSuccess(true);
      setEditing(false);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Error saving student profile details:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 font-sans">
      
      {/* Top Welcome Title Grid */}
      <div className="mb-8 border-b border-slate-100 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="font-mono text-[9px] font-bold tracking-[0.2em] text-indigo-600 uppercase">
            STUDENT DASHBOARD 🎓
          </span>
          <h2 className="text-3xl font-extralight tracking-tight text-slate-900 mt-1">
            Personal Performance <span className="font-medium">Curriculum Portfolio 🚀</span>
          </h2>
        </div>

        {/* Action Button Segment */}
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="self-start md:self-center inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition cursor-pointer"
          >
            <User className="h-3.5 w-3.5 text-slate-400" />
            Edit Profile Credentials 📝
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        
        {/* Profile Card & Info Bar (Left) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Main User Profile Details Card */}
          <div className="overflow-hidden rounded-xl border border-slate-200/60 bg-white shadow-sm transition hover:shadow-md duration-300">
            {/* Elegant Asymmetric Header Gradient Badge */}
            <div className="h-28 bg-gradient-to-br from-indigo-50 via-slate-50 to-indigo-100/40 relative border-b border-slate-100">
              <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-md border border-slate-100 px-2.5 py-1 rounded text-[9px] font-mono tracking-widest text-indigo-700 font-bold uppercase">
                ✨ ACCOMPLISHED LEVEL
              </div>
            </div>

            <div className="relative px-6 pb-6 pt-16 text-center">
              {/* Overlapping Rounded Avatar Mask */}
              <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-slate-100 shadow-md">
                  <img
                    src={userProfile.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userProfile.displayName || "Scholar")}`}
                    alt={userProfile.displayName || "Scholar"}
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>

              {/* Student Identification Info */}
              <div className="mt-2 text-center">
                <h3 className="text-xl font-bold text-slate-900 tracking-tight leading-none">
                  {userProfile.displayName || "Scholar Candidate"}
                </h3>
                <p className="mt-2 text-xs font-mono font-bold uppercase tracking-wider text-indigo-600 block">
                  {userProfile.title || "Academic Student"}
                </p>
                <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-mono">
                  <span>🗓️ Registered Member Since:</span>
                  <span className="font-bold text-slate-600">{new Date(userProfile.joinedAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Verified Badge Segment */}
              <div className="mt-5 border-t border-slate-100 pt-5 text-left">
                <span className="font-mono text-[9px] text-slate-400 uppercase tracking-widest font-bold">
                  STUDENT DISCIPLINE STATEMENT 💡
                </span>
                <p className="mt-2 text-xs text-slate-500 leading-relaxed italic border-l-2 border-indigo-500/30 pl-3">
                  "{userProfile.bio || "Candidate is actively compiling core curriculum standards. Benchmark metrics are structured live via lesson modules and verified interactive quizzes."}"
                </p>
              </div>
            </div>
          </div>

          {/* Inline Profile Configuration Form */}
          {editing && (
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="border-b border-slate-100 pb-3 mb-4">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Configure Credentials 🛠️</h4>
                <p className="text-[10px] text-slate-400 mt-0.5 font-sans">Your updated full name will instantly print on digital certificates.</p>
              </div>

              <form onSubmit={handleSave} className="flex flex-col gap-4">
                <div>
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                    Full Profile Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 transition"
                    placeholder="e.g. Richard Feynman"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                    Academic Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 transition"
                    placeholder="e.g. Junior Systems Architect"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                    Personal Biography
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 transition resize-none"
                    placeholder="Describe your design and learning path objectives..."
                    required
                  />
                </div>

                <div className="flex gap-2 justify-end pt-2 border-t border-slate-100 mt-2">
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-500 transition disabled:opacity-50 cursor-pointer"
                  >
                    <Save className="h-3.5 w-3.5" />
                    {saving ? "Updating..." : "Save Parameters"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {success && (
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3.5 text-xs text-emerald-700 flex items-center gap-2">
              <Check className="h-4 w-4 shrink-0" />
              <span>Academic credentials updated successfully! 🎉</span>
            </div>
          )}
        </div>

        {/* Dynamic Analytics & Radar Metrics grids (Right) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Real-time Metric bento-grid */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="border-b border-slate-100 pb-4 mb-5">
              <h4 className="text-sm font-bold uppercase text-slate-800 tracking-wider">Metrics and Milestones 📊</h4>
              <p className="text-xs text-slate-400 mt-1">Syllabus benchmarks gathered during active workspace testing periods.</p>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              
              <div className="rounded-xl border border-slate-100 hover:border-indigo-100/80 hover:bg-slate-50/50 p-4 transition duration-300">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100/50">
                  <BookOpen className="h-4 w-4" />
                </div>
                <span className="mt-4 block text-3xl font-light text-slate-900 font-mono leading-none">
                  {totalCoursesInteracted}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-2 block">
                  📚 Enrolled Paths
                </span>
              </div>

              <div className="rounded-xl border border-slate-100 hover:border-emerald-100/80 hover:bg-slate-50/50 p-4 transition duration-300">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100/50">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <span className="mt-4 block text-3xl font-light text-slate-900 font-mono leading-none">
                  {completedCoursesCount}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-2 block">
                  🏆 Graduations
                </span>
              </div>

              <div className="rounded-xl border border-slate-100 hover:border-purple-100/80 hover:bg-slate-50/50 p-4 transition duration-300">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600 border border-purple-100/50">
                  <Award className="h-4 w-4" />
                </div>
                <span className="mt-4 block text-3xl font-light text-slate-900 font-mono leading-none">
                  {cumulativeGrade ? `${cumulativeGrade}%` : "0%"}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-2 block">
                  🎯 Score Average
                </span>
              </div>

              <div className="rounded-xl border border-slate-100 hover:border-amber-100/80 hover:bg-slate-50/50 p-4 transition duration-300">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 border border-amber-100/50">
                  <Clock className="h-4 w-4" />
                </div>
                <span className="mt-4 block text-3xl font-light text-slate-900 font-mono leading-none">
                  {progressList.reduce((acc, p) => acc + (p.completedModules.length * 15), 0)}m
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-2 block">
                  ⏱️ Active Vol (min)
                </span>
              </div>

            </div>
          </div>

          {/* Minimalist Skill Radar Component */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            
            <div className="md:col-span-5 flex flex-col justify-center">
              <span className="font-mono text-[9px] font-bold tracking-[0.2em] text-indigo-600 uppercase">
                ACADEMIC COMPETENCY INDEX 🎯
              </span>
              <h4 className="text-lg font-bold text-slate-800 tracking-tight mt-1">
                Student Fingerprint Graph 📈
              </h4>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                This dynamic radar graph compiles real-time learning benchmarks based on active testing modules of coursework.
              </p>

              {/* Skill list segments */}
              <div className="mt-5 space-y-2.5 w-full">
                {entries.map(([label, score]) => (
                  <div key={label} className="group">
                    <div className="flex justify-between items-center text-[11px] font-semibold text-slate-600 pb-1.5">
                      <span className="flex items-center gap-1.5 leading-none text-slate-500 font-medium">
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 group-hover:scale-125 transition" />
                        {label}
                      </span>
                      <span className="font-mono text-indigo-600 font-bold">{score}%</span>
                    </div>
                    {/* Tiny micro progress visual indicator */}
                    <div className="h-1 w-full bg-slate-50 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500/80 transition-all duration-500" style={{ width: `${score}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Radar chart box */}
            <div className="md:col-span-7 flex justify-center items-center py-5 bg-slate-55 border border-slate-50 rounded-xl">
              <svg width="220" height="220" className="overflow-visible mx-auto">
                {/* Background grid concentric circles */}
                {[0.25, 0.5, 0.75, 1.0].map((lvl, idx) => {
                  const lvlPoints = entries
                    .map((_, i) => {
                      const { x, y } = getCoordinates(i, 100 * lvl);
                      return `${x},${y}`;
                    })
                    .join(" ");
                  return (
                    <polygon
                      key={idx}
                      points={lvlPoints}
                      fill="none"
                      stroke="#f1f5f9"
                      strokeWidth="1.5"
                    />
                  );
                })}

                {/* Concentric grid rings (Minimal circles as guides) */}
                {[20, 45, 70].map((r, i) => (
                  <circle
                    key={i}
                    cx={center}
                    cy={center}
                    r={r}
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="0.5"
                    strokeDasharray="3 3"
                  />
                ))}

                {/* Radial lines and text coordinates labels */}
                {entries.map(([label, _], i) => {
                  const outer = getCoordinates(i, 100);
                  const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
                  const labelRadius = radius + 15;
                  const lx = center + labelRadius * Math.cos(angle);
                  const ly = center + labelRadius * Math.sin(angle);
                  
                  let anchor: "start" | "middle" | "end" = "middle";
                  if (Math.cos(angle) > 0.1) anchor = "start";
                  else if (Math.cos(angle) < -0.1) anchor = "end";

                  return (
                    <g key={i}>
                      <line
                        x1={center}
                        y1={center}
                        x2={outer.x}
                        y2={outer.y}
                        stroke="#f1f5f9"
                        strokeWidth="1.5"
                      />
                      <text
                        x={lx}
                        y={ly}
                        textAnchor={anchor}
                        fontSize="8.5"
                        fontWeight="700"
                        className="fill-slate-400 font-mono tracking-wider uppercase font-black"
                        dominantBaseline="central"
                      >
                        {label}
                      </text>
                    </g>
                  );
                })}

                {/* Translucent overlay fill polygon */}
                <polygon
                  points={pointsString}
                  fill="rgba(79, 70, 229, 0.08)"
                  stroke="#4f46e5"
                  strokeWidth="2"
                  className="transition-all duration-500"
                />

                {/* Outer dots nodes */}
                {entries.map(([_, val], i) => {
                  const { x, y } = getCoordinates(i, val);
                  return (
                    <circle
                      key={i}
                      cx={x}
                      cy={y}
                      r="3.5"
                      fill="#4f46e5"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Active Courses Tracking Transcript Registry */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="border-b border-slate-100 pb-4 mb-4 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold uppercase text-slate-800 tracking-wider">Active Learning Transcripts 📑</h4>
                <p className="text-xs text-slate-400 mt-0.5">Formal register of coursework progress and module checkmarks.</p>
              </div>
              <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 font-mono text-[9px] px-2 py-0.5 rounded font-bold uppercase">
                Accredited Tracker 🛡️
              </span>
            </div>

            {progressList.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-xs text-slate-400 italic">No course records active yet. Navigate to the Explorer tab to enroll.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {progressList.map((progress) => {
                  const courseObj = courses.find((c) => c.id === progress.courseId);
                  if (!courseObj) return null;

                  const finishedModuleCount = progress.completedModules.length;
                  const total = courseObj.modules.length;
                  const percent = Math.round((finishedModuleCount / total) * 100);

                  return (
                    <div key={progress.courseId} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-lg border border-slate-100 bg-slate-50/20 p-4 hover:bg-slate-50/50 transition">
                      <div className="space-y-1">
                        <span className="font-mono text-[8px] tracking-wide bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold">
                          {courseObj.category.toUpperCase()}
                        </span>
                        <h5 className="text-sm font-bold text-slate-800 tracking-tight">{courseObj.title}</h5>
                        <p className="text-[10.5px] text-slate-400 font-sans">
                          Complete: {finishedModuleCount} of {total} testing syllabus modules
                        </p>
                      </div>

                      <div className="flex items-center gap-5 w-full sm:w-auto justify-between sm:justify-end shrink-0">
                        <div className="text-right">
                          <span className="font-mono text-[10.5px] font-bold text-slate-600 block">{percent}% SYLLABUS FINISHED</span>
                          <div className="mt-1 h-1.5 w-24 overflow-hidden rounded-full bg-slate-100 border border-slate-200/50">
                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${percent}%` }}></div>
                          </div>
                        </div>

                        {progress.completed ? (
                          <span className="rounded-full bg-emerald-50 border border-emerald-100/80 px-2.5 py-0.5 text-[9px] font-bold font-mono text-emerald-700 tracking-wide uppercase">
                            Accredited 🎓
                          </span>
                        ) : (
                          <span className="rounded-full bg-slate-100 border border-slate-200/60 px-2.5 py-0.5 text-[9px] font-mono text-slate-500 tracking-wide uppercase">
                            Active ⚡
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
