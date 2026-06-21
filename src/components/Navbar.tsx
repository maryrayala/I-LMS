import { GraduationCap, Award, User, LogOut, BookOpen, Palette, Sun, Moon, BarChart3 } from "lucide-react";
import { UserProfile } from "../types";

interface NavbarProps {
  activeTab: "explore" | "profile" | "certificates" | "progress";
  setActiveTab: (tab: "explore" | "profile" | "certificates" | "progress") => void;
  userProfile: UserProfile | null;
  onLogout: () => void;
  activeTheme: "emerald" | "forest" | "spruce";
  setActiveTheme: (theme: "emerald" | "forest" | "spruce") => void;
  colorMode: "light" | "dark";
  setColorMode: (mode: "light" | "dark") => void;
}

export default function Navbar({
  activeTab,
  setActiveTab,
  userProfile,
  onLogout,
  activeTheme,
  setActiveTheme,
  colorMode,
  setColorMode
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand identity */}
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab("explore")}>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 shadow-md shadow-indigo-100">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-none">I-LMS</h1>
            <span className="text-[10px] font-mono tracking-widest text-indigo-600 uppercase font-semibold">Interactive</span>
          </div>
        </div>

        {/* Tactical navigation anchors */}
        <nav className="hidden md:flex items-center gap-1">
          <button
            onClick={() => setActiveTab("explore")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              activeTab === "explore"
                ? "bg-indigo-50 text-indigo-600"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <BookOpen className="h-4 w-4" />
            Explore Courses
          </button>

          <button
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              activeTab === "profile"
                ? "bg-indigo-50 text-indigo-600"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <User className="h-4 w-4" />
            Student Profile
          </button>

          <button
            onClick={() => setActiveTab("progress")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              activeTab === "progress"
                ? "bg-indigo-50 text-indigo-600"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            My Progress
          </button>

          <button
            onClick={() => setActiveTab("certificates")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              activeTab === "certificates"
                ? "bg-indigo-50 text-indigo-600"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <Award className="h-4 w-4" />
            My Certificates
          </button>
        </nav>

        {/* User context action */}
        <div className="flex items-center gap-2">
          {/* Active Theme Picker bar */}
          <div className="flex items-center gap-1.5 bg-slate-100/80 px-2 py-1 rounded-lg border border-slate-200 text-xs">
            <Palette className="h-3.5 w-3.5 text-slate-500 shrink-0" />
            <select
              value={activeTheme}
              onChange={(e) => setActiveTheme(e.target.value as any)}
              className="bg-transparent border-0 py-0.5 outline-none font-semibold text-slate-700 cursor-pointer text-[11px]"
              title="Change Dark Green Theme"
            >
              <option value="emerald">🌲 Pine Emerald</option>
              <option value="forest">🌿 Forest Canopy</option>
              <option value="spruce">✨ Spruce Gold</option>
            </select>
          </div>

          {/* Light/Dark Mode Switch */}
          <button
            onClick={() => setColorMode(colorMode === "light" ? "dark" : "light")}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-slate-100/80 text-slate-600 hover:bg-slate-200 transition-all cursor-pointer"
            title={colorMode === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
          >
            {colorMode === "light" ? (
              <Moon className="h-3.5 w-3.5 text-slate-600" />
            ) : (
              <Sun className="h-3.5 w-3.5 text-amber-500" />
            )}
          </button>

          {userProfile && (
            <div className="flex items-center gap-3 border-l border-slate-200/80 pl-3">
              <div 
                onClick={() => setActiveTab("profile")}
                className="flex items-center gap-2 cursor-pointer group"
              >
                <div className="h-9 w-9 overflow-hidden rounded-full border border-slate-200 bg-slate-100 group-hover:ring-2 group-hover:ring-indigo-500 transition-all">
                  <img
                    src={userProfile.photoURL || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${userProfile.email}`}
                    alt="profile"
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-semibold text-slate-800 leading-none group-hover:text-indigo-600 transition-colors">
                    {userProfile.displayName || "Learner"}
                  </p>
                  <p className="text-[10px] font-mono text-slate-400 mt-0.5 leading-none">
                    {userProfile.title || "Student"}
                  </p>
                </div>
              </div>

              <button
                onClick={onLogout}
                className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                title="Logout Account"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Responsive mobile sub-navigation */}
      <div className="flex md:hidden items-center justify-around border-t border-slate-100 bg-white py-1.5">
        <button
          onClick={() => setActiveTab("explore")}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 text-xs font-semibold ${
            activeTab === "explore" ? "text-indigo-600" : "text-slate-500"
          }`}
        >
          <BookOpen className="h-4 w-4" />
          <span>Explore</span>
        </button>

        <button
          onClick={() => setActiveTab("profile")}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 text-xs font-semibold ${
            activeTab === "profile" ? "text-indigo-600" : "text-slate-500"
          }`}
        >
          <User className="h-4 w-4" />
          <span>Profile</span>
        </button>

        <button
          onClick={() => setActiveTab("progress")}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 text-xs font-semibold ${
            activeTab === "progress" ? "text-indigo-600" : "text-slate-500"
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          <span>Progress</span>
        </button>

        <button
          onClick={() => setActiveTab("certificates")}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 text-xs font-semibold ${
            activeTab === "certificates" ? "text-indigo-600" : "text-slate-500"
          }`}
        >
          <Award className="h-4 w-4" />
          <span>Awards</span>
        </button>
      </div>
    </header>
  );
}
