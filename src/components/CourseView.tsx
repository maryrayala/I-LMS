import { useState, useEffect, useRef } from "react";
import { Course, CourseProgress, Module, Certificate } from "../types";
import { createAICertificate } from "../lib/dbService";
import { BookOpen, Video, CheckCircle2, ChevronLeft, Sparkles, AlertCircle, HelpCircle, ArrowRight, Play, Loader2, MessageSquare, Timer, Clock, PenTool, Copy, Send, Trash2, ExternalLink } from "lucide-react";

interface CourseViewProps {
  course: Course;
  progress: CourseProgress | undefined;
  uid: string;
  studentName: string;
  onBack: () => void;
  onProgressUpdated: (newProgress: CourseProgress) => void;
  onCertificateEarned: (cert: Certificate) => void;
}

export default function CourseView({
  course,
  progress,
  uid,
  studentName,
  onBack,
  onProgressUpdated,
  onCertificateEarned,
}: CourseViewProps) {
  // Set default active module
  const [activeModule, setActiveModule] = useState<Module>(course.modules[0]);
  const [quizActive, setQuizActive] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [quizResult, setQuizResult] = useState<{ score: number; passed: boolean; evaluated: boolean } | null>(null);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [certificateError, setCertificateError] = useState("");
  const [overrideStudentName, setOverrideStudentName] = useState(studentName);

  useEffect(() => {
    setOverrideStudentName(studentName);
  }, [studentName]);

  // Convert standard embed URL into clean direct watch URL
  const getWatchUrl = (url: string) => {
    if (url.includes("/embed/")) {
      const parts = url.split("/embed/");
      const id = parts[parts.length - 1]?.split("?")[0];
      if (id) return `https://www.youtube.com/watch?v=${id}`;
    }
    return url;
  };

  // Determine if active module is already completed
  const isCompleted = progress?.completedModules?.includes(activeModule.id) || false;

  // Determine if all modules of this course are completed
  const totalModulesCount = course.modules.length;
  const completedModulesCount = progress?.completedModules?.length || 0;
  const allModulesFinished = completedModulesCount === totalModulesCount;

  // Track if course is completed (e.g. course has Certificate already)
  const isCourseCertified = progress?.completed || false;

  // Sidebar dynamic active navigation tab ("syllabus" | "chatbot" | "focus")
  const [sidebarTab, setSidebarTab] = useState<"syllabus" | "chatbot" | "focus">("syllabus");

  // Quiz Timer State (e.g. 180 seconds or 3 minutes duration limit)
  const [quizSecondsLeft, setQuizSecondsLeft] = useState(180);
  const selectedAnswersRef = useRef(selectedAnswers);

  // Sync selectedAnswers ref each change to prevent state-closure locking
  useEffect(() => {
    selectedAnswersRef.current = selectedAnswers;
  }, [selectedAnswers]);

  // Notes preparation study timer (customizable focus countdown clock)
  const [studySecondsPreset, setStudySecondsPreset] = useState(900); // 15 Mins standard
  const [studySecondsLeft, setStudySecondsLeft] = useState(900);
  const [studyActive, setStudyActive] = useState(false);
  const [notesContent, setNotesContent] = useState(() => {
    return localStorage.getItem(`notes-course-${course.id}`) || "";
  });

  const handleNotesChange = (val: string) => {
    setNotesContent(val);
    localStorage.setItem(`notes-course-${course.id}`, val);
  };

  // AI Doubts Chatbot Message list state
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'model'; text: string }>>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  // Re-sync chatbot's welcomes when lessons transition
  useEffect(() => {
    setChatMessages([
      {
        role: "model",
        text: `Greetings, ${studentName || "Scholar"}! I'm your AI Academic Doubts Tutor. Ask any questions about "${activeModule.title}" and its theory, and I'll explain things clearly with code snippets or outlines!`
      }
    ]);
  }, [activeModule, studentName]);

  // Helper for evaluation on timer expiration
  const triggerAutoSubmit = () => {
    const questions = activeModule.quiz.questions;
    let correctCount = 0;

    questions.forEach((q) => {
      if (selectedAnswersRef.current[q.id] === q.answerIndex) {
        correctCount++;
      }
    });

    const scorePercent = Math.round((correctCount / questions.length) * 100);
    const hasPassed = scorePercent >= 70;

    setQuizResult({
      score: scorePercent,
      passed: hasPassed,
      evaluated: true,
    });

    if (hasPassed) {
      import("../lib/dbService").then((service) => {
        service.saveModuleProgress(uid, course.id, activeModule.id, scorePercent, true)
          .then((newProg) => {
            onProgressUpdated(newProg);
          });
      });
    }
  };

  // Quiz clock countdown interval
  useEffect(() => {
    let interval: any = null;
    if (quizActive && !quizResult?.evaluated) {
      interval = setInterval(() => {
        setQuizSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            triggerAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setQuizSecondsLeft(180);
    }
    return () => clearInterval(interval);
  }, [quizActive, quizResult, activeModule]);

  // Study notes countdown focus timer interval
  useEffect(() => {
    let interval: any = null;
    if (studyActive) {
      interval = setInterval(() => {
        setStudySecondsLeft((prev) => {
          if (prev <= 1) {
            setStudyActive(false);
            clearInterval(interval);
            return studySecondsPreset;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [studyActive, studySecondsPreset]);

  // Request response from REST chatbot endpoint
  const handleSendChatMessage = async () => {
    if (!chatInput.trim() || chatLoading) return;

    const userMsg = { role: "user" as const, text: chatInput };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setChatLoading(true);

    try {
      const response = await fetch("/api/lesson-chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonTitle: activeModule.title,
          lessonDescription: activeModule.description,
          query: userMsg.text,
          chatHistory: chatMessages,
        }),
      });

      if (!response.ok) {
        throw new Error("Chatbot endpoint failed");
      }

      const data = await response.json();
      setChatMessages((prev) => [...prev, { role: "model", text: data.response }]);
    } catch (err) {
      console.error(err);
      setChatMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: "I experienced brief latency connecting to the Node.js server. Please make sure process.env.GEMINI_API_KEY is verified in Secrets panel!"
        }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  // Re-sync active module when course changes
  useEffect(() => {
    setActiveModule(course.modules[0]);
    setQuizActive(false);
    setSelectedAnswers({});
    setQuizResult(null);
    setCertificateError("");
  }, [course]);

  // Handle active module transition
  const handleSelectModule = (mod: Module) => {
    setActiveModule(mod);
    setQuizActive(false);
    setSelectedAnswers({});
    setQuizResult(null);
    setCertificateError("");
  };

  // Answer choice selector
  const handleSelectAnswer = (questionId: string, optionIndex: number) => {
    if (quizResult?.evaluated) return; // locked after grading
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  // Grade the quiz
  const handleGradeQuiz = () => {
    const questions = activeModule.quiz.questions;
    let correctCount = 0;

    questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.answerIndex) {
        correctCount++;
      }
    });

    const scorePercent = Math.round((correctCount / questions.length) * 100);
    const hasPassed = scorePercent >= 70; // 70% is passing

    setQuizResult({
      score: scorePercent,
      passed: hasPassed,
      evaluated: true,
    });

    if (hasPassed) {
      // Trigger database save progress
      import("../lib/dbService").then((service) => {
        service.saveModuleProgress(uid, course.id, activeModule.id, scorePercent, true)
          .then((newProg) => {
            onProgressUpdated(newProg);
          });
      });
    }
  };

  // Reset quiz state to re-try
  const handleRetryQuiz = () => {
    setSelectedAnswers({});
    setQuizResult(null);
  };

  // Generate the high-quality AI certificate using Node.js server proxy (Gemini backend)
  const handleGenerateCertificate = async () => {
    setAiGenerating(true);
    setCertificateError("");

    // Calculate aggregated score average over all modules
    let totalScore = 0;
    let count = 0;
    course.modules.forEach((mod) => {
      const storedScore = progress?.quizScores[mod.id];
      if (storedScore !== undefined) {
        totalScore += storedScore;
        count++;
      }
    });
    const avgScore = count > 0 ? Math.round(totalScore / count) : 100;

    try {
      const certificate = await createAICertificate(
        uid,
        course.id,
        course.title,
        overrideStudentName.trim() || studentName || "Scholar",
        avgScore
      );
      onCertificateEarned(certificate);
    } catch (e: any) {
      console.error(e);
      setCertificateError("Could not compile AI Certificate. Please try again.");
    } finally {
      setAiGenerating(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb / Exit */}
      <button
        onClick={onBack}
        className="group mb-6 inline-flex items-center gap-1.5 text-xs font-semibold uppercase text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        Back to Dashboard
      </button>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Main Content Area (Player and interactive space) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Header block */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono font-bold tracking-wider text-indigo-600 uppercase">
                  ACTIVE LESSON - {course.category}
                </span>
                <h2 className="mt-1 text-2xl font-bold text-slate-900 leading-tight">
                  {course.title}
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Instructed by {course.instructor} • Total {course.modules.length} Modules
                </p>
              </div>

              {allModulesFinished && (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 bg-indigo-50/40 p-3 sm:p-4 rounded-xl border border-indigo-100/50">
                  {isCourseCertified ? (
                    <div className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700 border border-emerald-100">
                      <CheckCircle2 className="h-4 w-4" />
                      Course Completed!
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-col gap-1 sm:max-w-xs w-full">
                        <label className="text-[10px] font-mono font-bold uppercase text-slate-500 tracking-wider">
                          Print Certificate Name
                        </label>
                        <input
                          type="text"
                          value={overrideStudentName}
                          onChange={(e) => setOverrideStudentName(e.target.value)}
                          placeholder="Please enter your full name"
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold font-sans text-slate-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 transition-all"
                        />
                      </div>
                      <button
                        onClick={handleGenerateCertificate}
                        disabled={aiGenerating || !overrideStudentName.trim()}
                        className="flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-indigo-500 transition-all disabled:opacity-50 cursor-pointer h-9 shrink-0"
                      >
                        {aiGenerating ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Validating Credentials...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4" />
                            Generate Certificate
                          </>
                        )}
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {certificateError && (
              <p className="mt-3 text-xs font-medium text-rose-600">{certificateError}</p>
            )}
          </div>

          {/* AI Helper Callout to promote the AI Doubts feature */}
          <div className="rounded-2xl border border-indigo-200/60 bg-gradient-to-r from-indigo-50/60 to-emerald-50/40 p-4.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600/10 text-indigo-700 shadow-inner">
                <Sparkles className="h-5.5 w-5.5 animate-pulse" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-display">Stuck on a tricky lesson concept?</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed max-w-xl mt-1">
                  Our advanced <strong className="text-indigo-700">Real-time Gemini Tutor</strong> is pre-loaded with this module's curriculum contents and stands ready as your personal doubts partner.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setSidebarTab("chatbot");
                document.getElementById("sidebar-block")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="shrink-0 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-3.5 py-2 text-xs font-bold text-white shadow-sm shadow-indigo-100 flex items-center gap-1 transition-all cursor-pointer"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              Launch Tutor
            </button>
          </div>

          {/* Minimalist Professional Video Player */}
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-900 shadow-md flex flex-col">
            <div className="video-container bg-slate-950">
              <iframe
                src={`${activeModule.videoUrl}?autoplay=0&rel=0&modestbranding=1`}
                title={activeModule.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            </div>
            
            {/* Action Bar inside screen */}
            <div className="flex flex-wrap items-center justify-between bg-slate-950 px-6 py-4 text-white gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
                  <Video className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold tracking-tight leading-none text-slate-200 uppercase font-mono">
                    {activeModule.title}
                  </h4>
                  <span className="text-[10px] font-mono text-slate-400 mt-1 block animate-none">
                    Duration: {activeModule.duration}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={getWatchUrl(activeModule.videoUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 hover:border-slate-500 bg-slate-900 hover:bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer"
                  title="If video embed is blocked by third-party cookies or sandbox, open it directly in a new tab"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  YouTube Link
                </a>

                {isCompleted ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 text-xs font-bold text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Passed Quiz
                  </span>
                ) : (
                  <button
                    onClick={() => {
                      setQuizActive(true);
                      setQuizResult(null);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-4 py-1.5 text-xs font-bold transition-all shadow-sm shadow-indigo-950 cursor-pointer"
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                    Take Module Quiz
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Module description context */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-6">
            <h4 className="text-sm font-bold uppercase text-slate-700 tracking-wider">Module Description</h4>
            <p className="mt-2 text-xs text-slate-500 leading-relaxed">
              {activeModule.description} Let's engage with the educational video above to unlock the quiz module. Once you achieve at least a 70% passing grade, this module is registered as completed in the Firebase cloud database!
            </p>
          </div>

          {/* Dynamic Module testing quiz zone */}
          {quizActive && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm scroll-mt-6" id="quiz-block">
              <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-3 gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                    <HelpCircle className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">Module Knowledge Check</h3>
                    <p className="text-[10px] text-slate-400">Complete all parameters to evaluate mastery status (70% passing grade)</p>
                  </div>
                </div>

                {/* Real-time Dynamic Quiz Timer */}
                {!quizResult?.evaluated && (
                  <div className="flex items-center gap-1.5 bg-rose-50 px-2.5 py-1.5 rounded-lg border border-rose-100 text-[11px] font-bold font-mono text-rose-700 animate-pulse">
                    <Timer className="h-3.5 w-3.5 text-rose-600 shrink-0" />
                    <span>
                      Quiz Deadline: {Math.floor(quizSecondsLeft / 60)}:
                      {String(quizSecondsLeft % 60).padStart(2, "0")}
                    </span>
                  </div>
                )}

                <button
                  onClick={() => setQuizActive(false)}
                  className="text-xs font-semibold text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  Close Quiz
                </button>
              </div>

              {/* Quiz Body */}
              <div className="mt-6 flex flex-col gap-6">
                {activeModule.quiz.questions.map((q, qIndex) => {
                  const selectedOpt = selectedAnswers[q.id];
                  const hasGraded = quizResult?.evaluated;
                  const isAnswerCorrect = selectedOpt === q.answerIndex;

                  return (
                    <div key={q.id} className="rounded-xl border border-slate-100 p-4 bg-slate-50/50">
                      <h4 className="text-sm font-bold text-slate-800 leading-snug">
                        <span className="font-mono text-indigo-600 mr-1.5">{qIndex + 1}.</span>
                        {q.question}
                      </h4>

                      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {q.options.map((opt, optIdx) => {
                          const isOptionSelected = selectedOpt === optIdx;
                          let btnStyle = "border-slate-200 hover:bg-slate-100 bg-white";

                          if (isOptionSelected) {
                            btnStyle = "border-indigo-600 bg-indigo-50/50 text-indigo-900 ring-2 ring-indigo-200";
                          }

                          if (hasGraded) {
                            if (optIdx === q.answerIndex) {
                              btnStyle = "border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold ring-2 ring-emerald-200";
                            } else if (isOptionSelected && !isAnswerCorrect) {
                              btnStyle = "border-rose-500 bg-rose-50 text-rose-950 cursor-not-allowed ring-2 ring-rose-200";
                            } else {
                              btnStyle = "border-slate-200 bg-slate-50/50 text-slate-400 cursor-not-allowed";
                            }
                          }

                          return (
                            <button
                              key={optIdx}
                              disabled={hasGraded}
                              onClick={() => handleSelectAnswer(q.id, optIdx)}
                              className={`flex items-start text-left rounded-lg border px-4 py-2.5 text-xs font-semibold transition-all ${btnStyle}`}
                            >
                              <span className="mt-0.5 mr-2 font-mono uppercase text-[10px] text-slate-400 bg-slate-100 h-4.5 w-4.5 rounded-full flex items-center justify-center shrink-0">
                                {String.fromCharCode(65 + optIdx)}
                              </span>
                              {opt}
                            </button>
                          );
                        })}
                      </div>

                      {/* Explanation descriptor */}
                      {hasGraded && q.explanation && (
                        <div className="mt-3.5 flex items-start gap-2 rounded-lg bg-indigo-50/50 p-3 border border-indigo-100/50 text-[11px] text-indigo-800 leading-relaxed">
                          <AlertCircle className="h-4 w-4 shrink-0 text-indigo-500" />
                          <p>
                            <strong>Insight:</strong> {q.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Quiz Actions and feedback results panel */}
              <div className="mt-6 border-t border-slate-100 pt-5">
                {quizResult ? (
                  <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border p-4 bg-slate-50">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-11 w-11 items-center justify-center rounded-full ${quizResult.passed ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                        {quizResult.passed ? <CheckCircle2 className="h-6 w-6" /> : <AlertCircle className="h-6 w-6" />}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">
                          {quizResult.passed ? "Performance Check Cleared!" : "Required standard not met"}
                        </h4>
                        <p className="text-[11px] text-slate-500 font-medium">
                          Your grade: <strong className="font-mono text-slate-700">{quizResult.score}%</strong> (Minimum 70% passing threshold)
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!quizResult.passed && (
                        <button
                          onClick={handleRetryQuiz}
                          className="rounded-lg bg-slate-900 hover:bg-slate-800 px-3.5 py-1.5 text-xs font-bold text-white transition-all shadow-sm"
                        >
                          Retry Knowledge Check
                        </button>
                      )}
                      
                      {quizResult.passed && (
                        <button
                          onClick={() => {
                            setQuizActive(false);
                            setQuizResult(null);
                            setSelectedAnswers({});
                          }}
                          className="rounded-lg bg-indigo-600 hover:bg-indigo-500 px-4 py-1.5 text-xs font-bold text-white transition-all shadow-sm cursor-pointer"
                        >
                          Exit Quiz View
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] text-slate-400 font-medium">Please answer all modules checking before grading.</p>
                    <button
                      onClick={handleGradeQuiz}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 text-xs font-bold text-white transition-all shadow-md shadow-indigo-100 cursor-pointer"
                    >
                      Evaluate Answers
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Module Navigation List */}
        <div id="sidebar-block" className="lg:col-span-4 flex flex-col gap-6 scroll-mt-6">
          {/* Dynamic Sidebar Nav Tabs */}
          <div className="flex rounded-xl bg-slate-100/80 p-1 border border-slate-200">
            <button
              onClick={() => setSidebarTab("syllabus")}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-xs font-bold transition-all cursor-pointer ${
                sidebarTab === "syllabus"
                  ? "bg-white text-indigo-900 shadow-sm border border-slate-200/50"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" />
              Syllabus
            </button>
            <button
              onClick={() => setSidebarTab("chatbot")}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-xs font-bold transition-all cursor-pointer ${
                sidebarTab === "chatbot"
                  ? "bg-white text-indigo-900 shadow-sm border border-slate-200/50"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5 text-indigo-500" />
              AI Doubts
            </button>
            <button
              onClick={() => setSidebarTab("focus")}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-xs font-bold transition-all cursor-pointer ${
                sidebarTab === "focus"
                  ? "bg-white text-indigo-900 shadow-sm border border-slate-200/50"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Clock className="h-3.5 w-3.5 text-emerald-500" />
              Study & Notes
            </button>
          </div>

          {/* Core Sidebar Display Switcher */}
          {sidebarTab === "syllabus" && (
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">Course Syllabus</h3>
              <p className="text-[11px] text-slate-400 mt-0.5 mb-4 font-mono">Select individual modular steps below.</p>

              <div className="flex flex-col gap-2">
                {course.modules.map((mod, index) => {
                  const modCompleted = progress?.completedModules?.includes(mod.id);
                  const isActive = activeModule.id === mod.id;

                  return (
                    <button
                      key={mod.id}
                      onClick={() => handleSelectModule(mod)}
                      className={`group flex items-start text-left rounded-xl p-3 border transition-all ${
                        isActive
                          ? "border-indigo-600 bg-indigo-50/40 text-indigo-950 font-bold shadow-sm animate-none"
                          : "border-slate-100 bg-slate-50/50 hover:bg-slate-100 text-slate-600"
                      }`}
                    >
                      <div className="mr-3 mt-1 shrink-0">
                        {modCompleted ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-500 bg-white rounded-full shadow-sm" />
                        ) : isActive ? (
                          <Play className="h-5 w-5 text-indigo-600 bg-indigo-100 p-1 rounded-full shadow-sm" />
                        ) : (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold font-mono text-slate-600 group-hover:bg-slate-300">
                            {index + 1}
                          </span>
                        )}
                      </div>

                      <div className="flex-1">
                        <h4 className="text-xs font-bold leading-tight group-hover:text-indigo-950">
                          {mod.title}
                        </h4>
                        <p className="mt-1 font-mono text-[10px] text-slate-400 leading-none">
                          Video Duration: {mod.duration}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {sidebarTab === "chatbot" && (
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm flex flex-col h-[460px]">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">AI Doubts Tutor</h3>
                  <p className="text-[10px] text-indigo-600 mt-0.5 font-semibold">Gemini LLM Real-time Tutor</p>
                </div>
                <button
                  onClick={() => setChatMessages([{
                    role: "model",
                    text: `Greetings! Ask me any questions, and I'll clear your doubts on "${activeModule.title}" immediately!`
                  }])}
                  className="p-1 text-slate-400 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                  title="Clear Conversation History"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Chat conversations trail */}
              <div className="flex-1 overflow-y-auto mb-3 pr-1 space-y-3 scrollbar-thin text-xs">
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-xl max-w-[88%] leading-relaxed ${
                      msg.role === "user"
                        ? "bg-indigo-600 text-white ml-auto"
                        : "bg-slate-100 text-slate-700 border border-slate-200/50 mr-auto"
                    }`}
                  >
                    <p className="font-semibold text-[9px] uppercase tracking-widest text-slate-400 mb-1 leading-none font-mono">
                      {msg.role === "user" ? "You" : "AI Tutor"}
                    </p>
                    <p className="whitespace-pre-wrap text-xs">{msg.text}</p>
                  </div>
                ))}

                {chatLoading && (
                  <div className="flex items-center gap-2 text-slate-400 p-2 text-[11px] font-medium italic">
                    <Loader2 className="h-3.5 w-3.5 text-indigo-500 animate-spin" />
                    Tutor is formulating an explanation...
                  </div>
                )}
              </div>

              {/* Dynamic Inputs interface */}
              <div className="flex items-center gap-1.5 border border-slate-200 rounded-xl px-2.5 py-1.5 bg-slate-50/50">
                <input
                  type="text"
                  placeholder="Ask a doubt about this lesson..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendChatMessage()}
                  className="flex-1 bg-transparent border-0 py-1 text-xs outline-none focus:ring-0 placeholder-slate-400 text-slate-800"
                />
                <button
                  onClick={handleSendChatMessage}
                  disabled={!chatInput.trim() || chatLoading}
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 transition-all cursor-pointer shadow-sm shadow-indigo-100"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}

          {sidebarTab === "focus" && (
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm flex flex-col gap-4">
              <div className="border-b border-slate-100 pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-700">Notes Focus Lab</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Prepare personalized study summaries and notes.</p>
              </div>

              {/* Digital countdown ticker view */}
              <div className="bg-[#fcfdfd] border border-slate-200/80 p-3.5 rounded-xl flex flex-col items-center justify-center transition-all">
                <div className="flex items-center gap-1.5 mb-2">
                  <div className={`h-2 w-2 rounded-full ${studyActive ? "bg-emerald-500 animate-ping" : "bg-slate-400"}`} />
                  <span className="text-[10px] uppercase font-bold tracking-widest font-mono text-slate-500">
                    {studyActive ? "Deep Focus Block Active" : "Preparation Clock Idle"}
                  </span>
                </div>
                <div className="text-3xl font-mono font-black text-emerald-600 block text-center tracking-wider px-4 py-2 bg-emerald-50/60 rounded-xl border border-emerald-100 min-w-[150px]">
                  {Math.floor(studySecondsLeft / 60)}:
                  {String(studySecondsLeft % 60).padStart(2, "0")}
                </div>

                {/* Preset Fast Actions */}
                <div className="flex items-center gap-1 mt-3">
                  <button
                    onClick={() => {
                      setStudySecondsPreset(300);
                      setStudySecondsLeft(300);
                      setStudyActive(false);
                    }}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded-md border ${
                      studySecondsPreset === 300 
                        ? "bg-emerald-100 border-emerald-300 text-emerald-800"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    5m Note
                  </button>
                  <button
                    onClick={() => {
                      setStudySecondsPreset(900);
                      setStudySecondsLeft(900);
                      setStudyActive(false);
                    }}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded-md border ${
                      studySecondsPreset === 900 
                        ? "bg-emerald-100 border-emerald-300 text-emerald-800"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    15m Sprint
                  </button>
                  <button
                    onClick={() => {
                      setStudySecondsPreset(1500);
                      setStudySecondsLeft(1500);
                      setStudyActive(false);
                    }}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded-md border ${
                      studySecondsPreset === 1500 
                        ? "bg-emerald-100 border-emerald-300 text-emerald-800"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    25m Mastery
                  </button>
                </div>

                {/* Control switches */}
                <div className="flex items-center gap-2 mt-3.5 w-full">
                  <button
                    onClick={() => setStudyActive(!studyActive)}
                    className="flex-1 flex justify-center items-center py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all cursor-pointer shadow-sm shadow-indigo-100"
                  >
                    {studyActive ? "Pause Timer" : "Engage Clock"}
                  </button>
                  <button
                    onClick={() => {
                      setStudyActive(false);
                      setStudySecondsLeft(studySecondsPreset);
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all border border-slate-200 cursor-pointer"
                  >
                    Reset
                  </button>
                </div>
              </div>

              {/* Scribble Sandbox text area */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                  <span className="flex items-center gap-1">
                    <PenTool className="h-3 w-3 text-slate-500" />
                    Sandboxed Sandbox Notes
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono">Autosaved to Sandbox</span>
                </div>
                <textarea
                  placeholder="Summarize key points, variables, or functions study results here... (Autosaved)"
                  value={notesContent}
                  onChange={(e) => handleNotesChange(e.target.value)}
                  className="w-full h-36 p-3 rounded-xl border border-slate-200 outline-none text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 placeholder-slate-400 scrollbar-thin bg-slate-50/50 font-mono"
                />

                {/* Utility triggers */}
                <div className="flex items-center gap-2 mt-1">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(notesContent);
                      const btn = document.getElementById("clipboard-toast");
                      if (btn) {
                        btn.classList.remove("hidden");
                        setTimeout(() => btn.classList.add("hidden"), 2000);
                      }
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg border border-slate-200/80 bg-slate-50 hover:bg-slate-100 py-2 text-[10px] font-bold text-slate-600 cursor-pointer"
                  >
                    <Copy className="h-3 w-3" />
                    Copy Notes
                  </button>
                  <button
                    onClick={() => handleNotesChange("")}
                    className="inline-flex items-center justify-center gap-1 rounded-lg bg-rose-50 hover:bg-rose-100 py-2 px-3 text-[10px] font-bold text-rose-600 cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>
                {/* Micro Clipboard Toast */}
                <span id="clipboard-toast" className="hidden text-center text-[10px] font-semibold text-emerald-600 font-mono animate-bounce mt-1">
                  ✓ Preserved to your clipboard memory! Passed!
                </span>
              </div>
            </div>
          )}

          {/* Quick Stats Panel */}
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-5">
            <h4 className="text-xs font-bold uppercase text-slate-700 tracking-wider">Completion Matrix</h4>
            
            <div className="mt-4 flex flex-col gap-3 text-xs">
              <div className="flex justify-between border-b border-slate-200/50 pb-2.5">
                <span className="text-slate-500 font-medium">Finished syllabus checks:</span>
                <span className="font-bold font-mono text-slate-800">{completedModulesCount} / {totalModulesCount}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/50 pb-2.5">
                <span className="text-slate-500 font-medium">Academic course level:</span>
                <span className="font-bold text-slate-800 uppercase text-[10px] bg-slate-200 px-2 py-0.5 rounded-full font-mono">{course.level}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Credits to be earned:</span>
                <span className="font-bold font-mono text-slate-800">{course.modules.length * 5} Credits</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
