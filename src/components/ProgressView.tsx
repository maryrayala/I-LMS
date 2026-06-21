import { useState } from "react";
import { Course, CourseProgress } from "../types";
import { BookOpen, Award, CheckCircle2, Search, SlidersHorizontal, TrendingUp, Calendar, Zap, FolderDot, BarChart3, PieChart } from "lucide-react";

interface ProgressViewProps {
  courses: Course[];
  progressList: CourseProgress[];
}

export default function ProgressView({ courses, progressList }: ProgressViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [activeSubTab, setActiveSubTab] = useState<"visuals" | "timeline">("visuals");

  // Get list of unique categories
  const categories = ["All", ...Array.from(new Set(courses.map((c) => c.category)))];

  // Calculate high-level stats
  const totalCoursesCount = courses.length;
  const completedCourses = progressList.filter((p) => p.completed);
  
  // Total modules in curriculum
  const totalModulesCount = courses.reduce((sum, c) => sum + c.modules.length, 0);
  const completedModulesCount = progressList.reduce((sum, p) => sum + p.completedModules.length, 0);

  // Average quiz grade score across all parsed modules
  let totalGradeSum = 0;
  let gradedCount = 0;
  progressList.forEach((p) => {
    Object.values(p.quizScores).forEach((sc) => {
      totalGradeSum += sc;
      gradedCount++;
    });
  });
  const avgGrade = gradedCount > 0 ? Math.round(totalGradeSum / gradedCount) : 0;

  // Compile detailed course metric tracking metrics
  const courseMetrics = courses.map((course) => {
    const progress = progressList.find((p) => p.courseId === course.id);
    const finishedCount = progress?.completedModules?.length || 0;
    const totalCount = course.modules.length;
    const ratio = totalCount > 0 ? finishedCount / totalCount : 0;
    const isCompleted = progress?.completed || false;
    
    // Average score in this course
    const scores = progress ? Object.values(progress.quizScores) : [];
    const courseAvg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

    return {
      course,
      finishedCount,
      totalCount,
      ratio,
      isCompleted,
      courseAvg,
      percentage: Math.round(ratio * 100),
      status: isCompleted ? "Completed" : finishedCount > 0 ? "In Progress" : "Not Enrolled"
    };
  });

  // Filter course analytics details
  const filteredMetrics = courseMetrics.filter((item) => {
    const matchesSearch = item.course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.course.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "All" || item.course.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // SVG Chart Dimensions & Computations
  const totalByStatus = {
    Completed: courseMetrics.filter((m) => m.status === "Completed").length,
    "In Progress": courseMetrics.filter((m) => m.status === "In Progress").length,
    "Not Enrolled": courseMetrics.filter((m) => m.status === "Not Enrolled").length,
  };

  const chartMax = Math.max(totalCoursesCount, 5);
  const barHeightScale = 120 / chartMax;



  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Upper Folder Header tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-5 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
              <FolderDot className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-display">Student Progress Folder</h2>
              <p className="text-xs text-slate-500 mt-0.5">Review continuous syllabus diagnostics, average scores, and learning metric dashboards.</p>
            </div>
          </div>
        </div>

        {/* Sub-tab folders selector */}
        <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200/50">
          <button
            onClick={() => setActiveSubTab("visuals")}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === "visuals"
                ? "bg-white text-indigo-900 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5 text-indigo-505" />
            Analytics Charts
          </button>
          <button
            onClick={() => setActiveSubTab("timeline")}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === "timeline"
                ? "bg-white text-indigo-900 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Calendar className="h-3.5 w-3.5 text-emerald-500" />
            Lesson Directories
          </button>
        </div>
      </div>

      {/* Grid of Key Diagnostic Stats Numbers */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {/* Core Progress ratio */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm hover:border-indigo-200 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Curriculum Ratio</span>
            <span className="rounded-lg bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              {Math.round((completedModulesCount / (totalModulesCount || 1)) * 100)}%
            </span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 font-mono">
              {completedModulesCount}
            </span>
            <span className="text-xs font-semibold text-slate-400 font-mono">/ {totalModulesCount} Modules</span>
          </div>
          <p className="mt-1.5 text-[10px] text-slate-400 leading-none">Finished active sub-lesson checks</p>
        </div>

        {/* Academic GPA */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm hover:border-indigo-200 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Academic Score GPA</span>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-4 flex items-baseline gap-1">
            <span className="text-3xl font-bold text-slate-900 font-mono">
              {avgGrade > 0 ? `${avgGrade}%` : "--"}
            </span>
            {avgGrade >= 90 && <span className="text-xs text-emerald-600 font-bold ml-1">Summa Cum Laude</span>}
            {avgGrade >= 80 && avgGrade < 90 && <span className="text-xs text-indigo-600 font-bold ml-1">Excellent</span>}
          </div>
          <p className="mt-1.5 text-[10px] text-slate-400 leading-none">Weighted modular tests average</p>
        </div>

        {/* Course Success certificates */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm hover:border-indigo-200 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Fully Certified</span>
            <Award className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 font-mono">
              {completedCourses.length}
            </span>
            <span className="text-xs font-semibold text-slate-400 font-mono">/ {totalCoursesCount} Courses</span>
          </div>
          <p className="mt-1.5 text-[10px] text-slate-400 leading-none">Earned accredited gold documents</p>
        </div>

        {/* Interactive Streaks hours */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm hover:border-indigo-200 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Brain Power Hours</span>
            <Zap className="h-4 w-4 text-orange-500" />
          </div>
          <div className="mt-4 flex items-baseline gap-1">
            <span className="text-3xl font-bold text-slate-900 font-mono">
              {Math.round(completedModulesCount * 45 / 60)}h
            </span>
            <span className="text-xs font-semibold text-slate-400 font-mono">{(completedModulesCount * 45) % 60}m studied</span>
          </div>
          <p className="mt-1.5 text-[10px] text-slate-400 leading-none">Accredited student active hours ratio</p>
        </div>
      </div>

      {activeSubTab === "visuals" ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* SVG Course Status Comparison Bar Chart */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm md:col-span-6 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 font-display">Pathway Distribution</h3>
              <p className="text-[11px] text-slate-400 mb-6 mt-1">Numerical breakdown of your core enrollment workflows.</p>
            </div>

            <div className="flex justify-center items-center py-4 bg-slate-50/50 border border-slate-100 rounded-xl relative">
              <svg width="280" height="150" className="overflow-visible">
                {/* Horizontal grid guide lines */}
                {[0, 0.25, 0.5, 0.75, 1.0].map((tick, i) => {
                  const y = 30 + 90 * (1 - tick);
                  const label = Math.round(tick * chartMax);
                  return (
                    <g key={i}>
                      <line x1="35" y1={y} x2="260" y2={y} stroke="#e2e8f0" strokeWidth="0.75" strokeDasharray="3 3" />
                      <text x="25" y={y + 3} textAnchor="end" fontSize="8" className="fill-slate-400 font-mono font-semibold">{label}</text>
                    </g>
                  );
                })}

                {/* Bars */}
                {[
                  { label: "Completed", value: totalByStatus.Completed, color: "#10b981" },
                  { label: "In Study", value: totalByStatus["In Progress"], color: "#6366f1" },
                  { label: "Not Started", value: totalByStatus["Not Enrolled"], color: "#94a3b8" }
                ].map((item, idx) => {
                  const barWidth = 32;
                  const spacing = 70;
                  const x = 55 + idx * spacing;
                  const height = item.value * barHeightScale;
                  const y = 120 - height;

                  return (
                    <g key={item.label} className="group cursor-pointer">
                      {/* Bar body */}
                      <rect
                        x={x}
                        y={y}
                        width={barWidth}
                        height={Math.max(height, 4)} // minimum height of 4px for empty bars
                        rx="4"
                        fill={item.color}
                        className="transition-all duration-300 group-hover:opacity-90"
                      />
                      {/* Value label on top */}
                      <text
                        x={x + barWidth / 2}
                        y={y - 6}
                        textAnchor="middle"
                        fontSize="9"
                        className="fill-slate-700 font-bold font-mono"
                      >
                        {item.value}
                      </text>
                      {/* Label below axis */}
                      <text
                        x={x + barWidth / 2}
                        y="136"
                        textAnchor="middle"
                        fontSize="8"
                        className="fill-slate-500 font-semibold uppercase tracking-tight"
                      >
                        {item.label}
                      </text>
                    </g>
                  );
                })}

                {/* Bottom baseline */}
                <line x1="35" y1="120" x2="260" y2="120" stroke="#cbd5e1" strokeWidth="1" />
              </svg>
            </div>

            <div className="mt-4 border-t border-slate-50 pt-3">
              <p className="text-[10px] text-slate-400 text-center leading-relaxed font-mono">
                Active syllabus comprises {totalCoursesCount} programs. Scale your Completed bar by answering lesson quizzes!
              </p>
            </div>
          </div>

          {/* Structured category insights pie proportional breakdown */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm md:col-span-6 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 font-display">Category Core Insights</h3>
              <p className="text-[11px] text-slate-400 mb-4 mt-1">Your localized competency distribution indexes.</p>
            </div>

            <div className="space-y-3.5">
              {(() => {
                // Calculate finished modules per category
                const catGroupData: Record<string, { total: number; completed: number; color: string }> = {};
                courses.forEach((c) => {
                  if (!catGroupData[c.category]) {
                    let color = "#6366f1"; // tech
                    if (c.category.toLowerCase().includes("design")) color = "#ec4899";
                    else if (c.category.toLowerCase().includes("business")) color = "#f59e0b";
                    else if (c.category.toLowerCase().includes("marketing")) color = "#10b981";

                    catGroupData[c.category] = { total: 0, completed: 0, color };
                  }
                  
                  const prog = progressList.find((p) => p.courseId === c.id);
                  catGroupData[c.category].total += c.modules.length;
                  catGroupData[c.category].completed += prog?.completedModules?.length || 0;
                });

                return Object.entries(catGroupData).map(([name, data]) => {
                  const percent = data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0;
                  return (
                    <div key={name} className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-slate-700 flex items-center gap-1.5 leading-none">
                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: data.color }} />
                          {name}
                        </span>
                        <span className="font-mono text-[11px] font-bold text-slate-500">
                          {data.completed}/{data.total} Modules ({percent}%)
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 border border-slate-200/20">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${percent}%`, backgroundColor: data.color }}
                        />
                      </div>
                    </div>
                  );
                });
              })()}
            </div>

            <div className="mt-4 border-t border-slate-50 pt-3">
              <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono justify-center leading-none">
                <PieChart className="h-3.5 w-3.5" />
                <span>Competency values dynamically update based on verified results.</span>
              </div>
            </div>
          </div>

          {/* Academic active checklist log directory folder */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm md:col-span-12">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-1 font-display">Verified Syllabus Transcripts</h3>
            <p className="text-[11px] text-slate-400 mb-5">Audit and confirm course checkins with passing ratios.</p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                    <th className="pb-3 font-semibold">Course Module</th>
                    <th className="pb-3 font-semibold">Track Category</th>
                    <th className="pb-3 font-semibold">Completion Ratio</th>
                    <th className="pb-3 font-semibold">Grades GPA</th>
                    <th className="pb-3 font-semibold">Milestone Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50/50">
                  {courseMetrics.map((item) => (
                    <tr key={item.course.id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="py-4">
                        <div className="font-semibold text-slate-900 pr-4 leading-tight">{item.course.title}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">By {item.course.instructor}</div>
                      </td>
                      <td className="py-4">
                        <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 font-mono">
                          {item.course.category}
                        </span>
                      </td>
                      <td className="py-4 font-mono font-bold text-slate-600">
                        {item.finishedCount}/{item.totalCount} ({item.percentage}%)
                      </td>
                      <td className="py-4">
                        {item.courseAvg > 0 ? (
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-indigo-600">{item.courseAvg}%</span>
                            <span className="text-[10px] text-slate-400">pass rate</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-mono font-medium">N/A</span>
                        )}
                      </td>
                      <td className="py-4">
                        {item.isCompleted ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 font-sans border border-emerald-100/50 leading-none">
                            <CheckCircle2 className="h-3 w-3" />
                            Completed
                          </span>
                        ) : item.finishedCount > 0 ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 font-sans border border-indigo-100/50 leading-none animate-pulse">
                            Study Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-400 font-sans leading-none">
                            Enrolled
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Detailed Lesson Directories tab */
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
            {/* Search inputs and filters */}
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search catalog directory..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-slate-200/80 bg-white pl-10 pr-4 py-2 text-xs focus:ring-1 focus:ring-indigo-500 cursor-text"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                <span>Filter Group:</span>
              </div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="rounded-lg border border-slate-200/80 bg-white px-3 py-1.5 text-xs focus:ring-1 text-slate-700 cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Metric Course Rows */}
          <div className="grid grid-cols-1 gap-4">
            {filteredMetrics.length > 0 ? (
              filteredMetrics.map((item) => (
                <div key={item.course.id} className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm hover:border-indigo-200 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 font-mono bg-indigo-50 px-2 py-0.5 rounded-md dark:bg-indigo-950 dark:text-indigo-400">
                        {item.course.category}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">{item.course.level}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 leading-tight">{item.course.title}</h3>
                    <p className="text-[11px] text-slate-400 leading-relaxed max-w-2xl">{item.course.description}</p>
                  </div>

                  <div className="shrink-0 flex items-center gap-6 justify-between md:justify-end border-t md:border-t-0 border-slate-50 pt-3 md:pt-0">
                    <div className="text-left md:text-right">
                      <span className="text-[10px] text-slate-400 font-semibold block leading-none">COURSE PROGRESS</span>
                      <span className="mt-1 font-mono text-base font-bold text-slate-800 block">
                        {item.finishedCount}/{item.totalCount} <span className="text-xs text-slate-400 font-medium">Modules</span>
                      </span>
                    </div>

                    <div className="text-left md:text-right">
                      <span className="text-[10px] text-slate-400 font-semibold block leading-none">TESTS GRADE</span>
                      <span className="mt-1 font-mono text-base font-bold block text-indigo-600">
                        {item.courseAvg > 0 ? `${item.courseAvg}%` : "--"}
                      </span>
                    </div>

                    <div>
                      {item.isCompleted ? (
                        <div className="flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 border border-emerald-100">
                          <CheckCircle2 className="h-4 w-4" />
                          Certified
                        </div>
                      ) : (
                        <div className="h-10 w-24 overflow-hidden rounded-lg bg-slate-100 border border-slate-200 relative flex items-center justify-center">
                          <div
                            className="absolute inset-y-0 left-0 bg-indigo-100/70"
                            style={{ width: `${item.percentage}%` }}
                          />
                          <span className="relative z-10 font-mono text-xs font-bold text-slate-600">
                            {item.percentage}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 py-12 text-center">
                <BookOpen className="mx-auto h-8 w-8 text-slate-400" />
                <h3 className="mt-2 text-sm font-bold text-slate-800">No directories found</h3>
                <p className="mt-0.5 text-xs text-slate-400">Refine your search constraints or categories filter queries.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
