import { BookOpen, Award, Shield, Cpu, Palette, BarChart3, ChevronRight } from "lucide-react";
import { Course, CourseProgress } from "../types";

interface CourseCardProps {
  course: Course;
  progress: CourseProgress | undefined;
  onSelect: (courseId: string) => void;
}

export default function CourseCard({ course, progress, onSelect }: CourseCardProps) {
  // Calculate completed modules percentage
  const completedCount = progress?.completedModules?.length || 0;
  const totalCount = course.modules.length || 1;
  const percentage = Math.round((completedCount / totalCount) * 100);

  // Choose category accent theme
  const getCategoryTheme = (cat: string) => {
    switch (cat.toLowerCase()) {
      case "ai":
        return {
          bg: "bg-purple-50 text-purple-700 border-purple-100",
          iconBg: "bg-purple-100 text-purple-700",
          icon: Cpu,
        };
      case "design":
        return {
          bg: "bg-pink-50 text-pink-700 border-pink-100",
          iconBg: "bg-pink-100 text-pink-700",
          icon: Palette,
        };
      case "business":
        return {
          bg: "bg-amber-50 text-amber-700 border-amber-100",
          iconBg: "bg-amber-100 text-amber-700",
          icon: BarChart3,
        };
      case "marketing":
        return {
          bg: "bg-emerald-50 text-emerald-700 border-emerald-100",
          iconBg: "bg-emerald-100 text-emerald-700",
          icon: Shield,
        };
      default:
        return {
          bg: "bg-indigo-50 text-indigo-700 border-indigo-100",
          iconBg: "bg-indigo-100 text-indigo-700",
          icon: BookOpen,
        };
    }
  };

  const theme = getCategoryTheme(course.category);
  const CatIcon = theme.icon;

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-slate-200/80 bg-white transition-all duration-200 hover:border-indigo-200 hover:shadow-lg hover:shadow-slate-100/50">
      {/* Thumbnail */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-950 font-sans select-none">
        
        {/* Dynamic High-End Geometric Background Gradients */}
        <div className={`absolute inset-0 bg-gradient-to-br ${
          course.category.toLowerCase() === "ai" || course.category.toLowerCase().includes("intelligence")
            ? "from-indigo-900 via-purple-900 to-slate-950"
            : course.category.toLowerCase() === "design" || course.category.toLowerCase() === "creative"
            ? "from-rose-900 via-pink-900 to-slate-950"
            : course.category.toLowerCase() === "business" || course.category.toLowerCase().includes("finance")
            ? "from-amber-900 via-stone-900 to-slate-900"
            : course.category.toLowerCase() === "marketing" || course.category.toLowerCase() === "growth"
            ? "from-teal-900 via-emerald-950 to-slate-950"
            : "from-blue-900 via-slate-900 to-slate-950"
        } flex flex-col items-center justify-center`}>
          
          {/* Scientific Grid Mesh Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0c_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0c_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none opacity-45"></div>
          
          {/* Neo Design Indicator */}
          <div className="flex flex-col items-center justify-center relative scale-95 transition-transform group-hover:scale-100 duration-300">
            <div className="h-12 w-12 rounded-xl bg-white/5 border border-white/15 flex items-center justify-center text-white/40 mb-2 shadow-inner backdrop-blur-sm">
              <CatIcon className="h-6 w-6 opacity-75 text-indigo-300" />
            </div>
            <span className="text-[10px] font-bold text-white/45 tracking-widest uppercase font-mono">{course.category} Academy</span>
          </div>
        </div>

        {/* Real image loaded gracefully on top of the underlay mesh */}
        <img
          src={course.thumbnailUrl}
          alt={course.title}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 z-10"
        />
        
        {/* Top Badges Overlay (Higher indexing than image) */}
        <div className="absolute top-3 left-3 flex gap-1.5 z-20">
          <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide uppercase ${theme.bg}`}>
            <CatIcon className="h-3 w-3" />
            {course.category}
          </span>
          <span className="inline-flex items-center rounded-full bg-slate-900/75 backdrop-blur-sm px-2.5 py-0.5 text-[10px] font-semibold text-white tracking-wider uppercase">
            {course.level}
          </span>
        </div>
      </div>

      {/* Info Body */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
          <div className="flex items-center gap-1">
            <span className="text-amber-500">★</span>
            <span className="font-semibold text-slate-700 font-mono">{course.rating.toFixed(1)}</span>
          </div>
          <span>{course.duration}</span>
        </div>

        <h4 className="mt-2.5 text-base font-bold text-slate-900 leading-snug tracking-tight group-hover:text-indigo-600 transition-colors">
          {course.title}
        </h4>
        <p className="mt-1.5 line-clamp-2 text-xs text-slate-500 leading-relaxed">
          {course.description}
        </p>

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] font-medium text-slate-400">
          <span>By {course.instructor}</span>
          <span className="font-mono text-slate-500">{course.modules.length} Modules</span>
        </div>
      </div>

      {/* Progress Footer */}
      <div className="bg-slate-50 border-t border-slate-100 px-5 py-3.5">
        {percentage > 0 ? (
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-indigo-600 font-mono text-[11px]">{percentage}% Completed</span>
              <span className="text-slate-400 font-mono text-[10px]">{completedCount}/{totalCount} Modules</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-indigo-600 transition-all duration-300"
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => onSelect(course.id)}
            className="flex w-full items-center justify-between text-xs font-bold text-indigo-600 group-hover:text-indigo-500"
          >
            <span>Start Learning Course</span>
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        )}

        {percentage === 100 && (
          <div className="mt-2.5 flex items-center gap-1 text-[10px] uppercase tracking-wider text-emerald-600 font-bold justify-center rounded-md bg-emerald-50 py-1 border border-emerald-100/50">
            <Award className="h-3.5 w-3.5" />
            Certified Graduate
          </div>
        )}
      </div>

      {/* Highlight active gradient highlight top line */}
      {percentage > 0 && percentage < 100 && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-indigo-500"></div>
      )}
      {percentage === 100 && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-emerald-500"></div>
      )}
    </div>
  );
}
