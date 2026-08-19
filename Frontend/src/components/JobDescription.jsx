import React, { useContext, useEffect, useState } from "react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { APPLICATION_API_END_POINT, JOB_API_END_POINT, AI_API_END_POINT } from "@/utils/constant";
import { setSingleJob } from "./redux/jobSlice";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { LoadingBarContext } from "./LoadingBarContext";
import MDEditor from "@uiw/react-md-editor";
import confetti from "canvas-confetti";
import SalaryInsights from "./SalaryInsights";
import {
  Sparkles,
  Bot,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  MapPin,
  IndianRupee,
  Clock,
  Building2,
  Users,
  Calendar,
  Loader2,
  HelpCircle,
  Mic,
  MicOff,
  Send,
  ChevronRight,
  ChevronLeft,
  Trophy,
  ThumbsUp,
  RotateCcw,
  FileText,
  Copy,
  Download
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const JobDescription = () => {
  const { singleJob } = useSelector((store) => store.job);
  const { user } = useSelector((store) => store.auth);
  const isInitiallyApplied = singleJob?.applications?.some(
    (application) => application.applicant === user?._id || application === user?._id || false
  );
  const [isApplied, setIsApplied] = useState(isInitiallyApplied);
  const [atsModalOpen, setAtsModalOpen] = useState(false);
  const [atsLoading, setAtsLoading] = useState(false);
  const [atsResult, setAtsResult] = useState(null);

  const [prepModalOpen, setPrepModalOpen] = useState(false);
  const [prepLoading, setPrepLoading] = useState(false);
  const [prepResult, setPrepResult] = useState(null);

  // Tailored Resume State
  const [tailorModalOpen, setTailorModalOpen] = useState(false);
  const [tailorLoading, setTailorLoading] = useState(false);
  const [tailorResult, setTailorResult] = useState(null);

  // Mock Interview State
  const [mockModalOpen, setMockModalOpen] = useState(false);
  const [mockCurrentIdx, setMockCurrentIdx] = useState(0);
  const [mockUserAnswer, setMockUserAnswer] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [evaluatingMock, setEvaluatingMock] = useState(false);
  const [mockFeedback, setMockFeedback] = useState(null);
  const [mockEvaluations, setMockEvaluations] = useState({});
  const recognitionRef = React.useRef(null);

  const params = useParams();
  const navigate = useNavigate();
  const jobId = params.id;
  const dispatch = useDispatch();
  const loadingBarRef = useContext(LoadingBarContext);

  const applyJobHandler = async () => {
    if (!user) {
      toast.error("Please login to apply for this job.");
      navigate("/login");
      return;
    }

    const hasResume = Boolean(user.profile?.resume || user.profile?.resumeOriginalName);
    if (!hasResume) {
      toast.error("Please upload your resume in your profile before applying for jobs!", {
        action: {
          label: "Go to Profile",
          onClick: () => navigate("/profile"),
        },
        duration: 6000,
      });
      return;
    }

    try {
      if (loadingBarRef?.current) loadingBarRef.current.continuousStart();
      const res = await axios.post(
        `${APPLICATION_API_END_POINT}/apply/${jobId}`,
        {},
        { withCredentials: true }
      );
      if (res.data.success) {
        setIsApplied(true);
        const updateSingleJob = {
          ...singleJob,
          applications: [...(singleJob.applications || []), { applicant: user?._id }],
        };
        dispatch(setSingleJob(updateSingleJob));
        toast.success(res.data.message);

        // Trigger celebratory confetti burst!
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to apply");
    } finally {
      if (loadingBarRef?.current) loadingBarRef.current.complete();
    }
  };

  const handleCheckAts = async () => {
    if (!user) {
      toast.error("Please login to run AI ATS Score Analysis.");
      return;
    }
    setAtsModalOpen(true);
    if (atsResult) return;

    try {
      setAtsLoading(true);
      const res = await axios.post(
        `${AI_API_END_POINT}/match-resume`,
        { jobId },
        { withCredentials: true }
      );
      if (res.data.success) {
        setAtsResult(res.data.data);
      }
    } catch (error) {
      toast.error("Failed to analyze ATS match.");
    } finally {
      setAtsLoading(false);
    }
  };

  const handleInterviewPrep = async () => {
    setPrepModalOpen(true);
    if (prepResult) return;

    try {
      setPrepLoading(true);
      const res = await axios.get(
        `${AI_API_END_POINT}/interview-prep/${jobId}`,
        { withCredentials: true }
      );
      if (res.data.success) {
        setPrepResult(res.data);
      }
    } catch (error) {
      toast.error("Failed to generate interview questions.");
    } finally {
      setPrepLoading(false);
    }
  };

  const getQuestionsList = () => {
    if (!prepResult) return [];
    if (Array.isArray(prepResult.questions)) return prepResult.questions;
    if (Array.isArray(prepResult)) return prepResult;
    return [];
  };

  const startMockInterview = async () => {
    setMockModalOpen(true);
    setMockCurrentIdx(0);
    setMockUserAnswer("");
    setMockFeedback(null);

    if (!prepResult) {
      try {
        setPrepLoading(true);
        const res = await axios.get(`${AI_API_END_POINT}/interview-prep/${jobId}`, {
          withCredentials: true,
        });
        if (res.data.success) {
          setPrepResult(res.data);
        }
      } catch (err) {
        toast.error("Failed to load interview questions for mock practice.");
      } finally {
        setPrepLoading(false);
      }
    }
  };

  const handleToggleVoiceRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Speech recognition is not supported on this browser. You can type your answer.");
      return;
    }

    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsRecording(true);
        toast.info("🎙️ Listening... Speak your answer!");
      };

      recognition.onresult = (event) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            transcript += event.results[i][0].transcript + " ";
          }
        }
        if (transcript) {
          setMockUserAnswer((prev) => (prev ? prev + " " + transcript.trim() : transcript.trim()));
        }
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error("Speech recognition initialization error:", e);
      setIsRecording(false);
    }
  };

  const handleEvaluateMockAnswer = async () => {
    const questions = getQuestionsList();
    const currentQ = questions[mockCurrentIdx];
    if (!currentQ || !mockUserAnswer.trim()) {
      toast.error("Please type or speak your answer before submitting.");
      return;
    }

    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }

    try {
      setEvaluatingMock(true);
      const res = await axios.post(
        `${AI_API_END_POINT}/evaluate-mock-answer`,
        {
          question: currentQ.question,
          userAnswer: mockUserAnswer,
          jobTitle: singleJob?.title,
          jobRequirements: singleJob?.requirements,
        },
        { withCredentials: true }
      );

      if (res.data.success && res.data.feedback) {
        setMockFeedback(res.data.feedback);
        setMockEvaluations((prev) => ({
          ...prev,
          [mockCurrentIdx]: {
            answer: mockUserAnswer,
            feedback: res.data.feedback,
          },
        }));
        toast.success("✨ Answer evaluated by AI Bar Raiser!");
      }
    } catch (error) {
      console.error("AI Evaluation error:", error);
      toast.error(error.response?.data?.message || "Failed to evaluate answer.");
    } finally {
      setEvaluatingMock(false);
    }
  };

  const handleTailorResume = async () => {
    if (!user) {
      toast.error("Please login to generate an AI tailored resume.");
      navigate("/login");
      return;
    }
    setTailorModalOpen(true);
    if (!tailorResult) {
      try {
        setTailorLoading(true);
        const res = await axios.post(
          `${AI_API_END_POINT}/tailor-resume`,
          { jobId },
          { withCredentials: true }
        );
        if (res.data.success) {
          setTailorResult(res.data.tailoredData);
          toast.success("✨ AI Tailored Resume Profile generated!");
        }
      } catch (err) {
        toast.error("Failed to generate tailored resume.");
      } finally {
        setTailorLoading(false);
      }
    }
  };

  const handleNextMockQuestion = () => {
    const questions = getQuestionsList();
    if (mockCurrentIdx < questions.length - 1) {
      const nextIdx = mockCurrentIdx + 1;
      setMockCurrentIdx(nextIdx);
      const existing = mockEvaluations[nextIdx];
      setMockUserAnswer(existing ? existing.answer : "");
      setMockFeedback(existing ? existing.feedback : null);
    }
  };

  const handlePrevMockQuestion = () => {
    if (mockCurrentIdx > 0) {
      const prevIdx = mockCurrentIdx - 1;
      setMockCurrentIdx(prevIdx);
      const existing = mockEvaluations[prevIdx];
      setMockUserAnswer(existing ? existing.answer : "");
      setMockFeedback(existing ? existing.feedback : null);
    }
  };

  useEffect(() => {
    const fetchSingleJob = async () => {
      try {
        if (loadingBarRef?.current) loadingBarRef.current.continuousStart();
        const res = await axios.get(`${JOB_API_END_POINT}/get/${jobId}`, {
          withCredentials: true,
        });

        if (res.data.success) {
          dispatch(setSingleJob(res.data.job));
          setIsApplied(
            res.data.job.applications?.some(
              (application) =>
                application.applicant === user?._id ||
                application?._id === user?._id ||
                application === user?._id
            )
          );
        }
      } catch (error) {
        console.error("Axios error:", error);
      } finally {
        if (loadingBarRef?.current) loadingBarRef.current.complete();
      }
    };
    fetchSingleJob();
  }, [jobId, dispatch, user?._id]);

  return (
    <div className="px-3 sm:px-4 mx-auto my-6 sm:my-8 max-w-5xl">
      {/* Header Banner */}
      <div className="p-4 sm:p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center border border-purple-100 dark:border-purple-900 shadow-sm overflow-hidden flex-shrink-0">
              {singleJob?.company?.logo ? (
                <img
                  src={singleJob.company.logo}
                  alt={singleJob.company.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Building2 className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              )}
            </div>

            <div>
              <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                {singleJob?.company?.name || "Company"}
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-0.5">
                {singleJob?.title}
              </h1>
              <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                <Badge className="bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 hover:bg-blue-50 border-0 font-medium text-xs">
                  <Users className="w-3 h-3 mr-1" /> {singleJob?.position} Openings
                </Badge>
                <Badge className="bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 hover:bg-red-50 border-0 font-medium text-xs">
                  <Briefcase className="w-3 h-3 mr-1" /> {singleJob?.jobType}
                </Badge>
                <Badge className="bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 hover:bg-purple-50 border-0 font-medium text-xs">
                  <IndianRupee className="w-3 h-3 mr-1" /> {singleJob?.salary} LPA
                </Badge>
                <Badge className="bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300 hover:bg-green-50 border-0 font-medium text-xs">
                  <MapPin className="w-3 h-3 mr-1" /> {singleJob?.location}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            {user?.role === "student" && (
              <Button
                onClick={isApplied ? null : applyJobHandler}
                disabled={isApplied}
                className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-semibold transition-all shadow-sm ${
                  isApplied
                    ? "bg-gray-400 dark:bg-gray-700 text-white cursor-not-allowed"
                    : "bg-[#6A38C2] hover:bg-[#5b30a6] text-white font-bold"
                }`}
              >
                {isApplied ? "✓ Already Applied" : "Apply for Job"}
              </Button>
            )}
          </div>
        </div>

        {/* AI Action Quick Bar */}
        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5">
          <button
            onClick={handleCheckAts}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-50/80 dark:bg-purple-950/40 hover:bg-purple-600 hover:text-white dark:hover:bg-purple-600 dark:hover:text-white border border-purple-200/80 dark:border-purple-800/80 shadow-sm transition-all duration-200 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" /> Check ATS Match Score
          </button>

          <button
            onClick={handleTailorResume}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50/80 dark:bg-rose-950/40 hover:bg-rose-600 hover:text-white dark:hover:bg-rose-600 dark:hover:text-white border border-rose-200/80 dark:border-rose-800/80 shadow-sm transition-all duration-200 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" /> AI Tailored Resume
          </button>

          <button
            onClick={handleInterviewPrep}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50/80 dark:bg-blue-950/40 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white border border-blue-200/80 dark:border-blue-800/80 shadow-sm transition-all duration-200 cursor-pointer"
          >
            <Bot className="w-3.5 h-3.5" /> AI Interview Prep Coach
          </button>

          <button
            onClick={startMockInterview}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50/80 dark:bg-emerald-950/40 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white border border-emerald-200/80 dark:border-emerald-800/80 shadow-sm transition-all duration-200 cursor-pointer"
          >
            <Mic className="w-3.5 h-3.5" /> 🎙️ Practice AI Mock Interview
          </button>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {/* Left Column: Job Overview & Description */}
        <div className="md:col-span-2 space-y-6">
          <div className="p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">About the Role</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
              {singleJob?.description}
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Requirements & Skills</h3>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <MDEditor.Markdown
                source={singleJob?.requirements || "No specific requirements listed."}
                className="bg-transparent text-sm leading-relaxed"
                style={{ backgroundColor: "transparent", color: "inherit" }}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Key Details Card & Salary Insights */}
        <div className="space-y-6">
          <div className="p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-xl space-y-4">
            <h3 className="text-base font-bold text-gray-900 dark:text-white border-b pb-3 dark:border-gray-800">
              Job Summary
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Experience</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">{singleJob?.experienceLevel} Years</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 flex items-center gap-1.5"><IndianRupee className="w-3.5 h-3.5" /> Annual Package</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">₹{singleJob?.salary} LPA</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Applicants</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">{singleJob?.applications?.length || 0} applied</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Posted Date</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">{singleJob?.createdAt?.split("T")[0]}</span>
              </div>
            </div>
          </div>

          {/* Real-Time Salary Insights & Skill Trends Benchmark */}
          <SalaryInsights job={singleJob} />
        </div>
      </div>

      {/* 1. AI ATS Match Score Modal */}
      <Dialog open={atsModalOpen} onOpenChange={setAtsModalOpen}>
        <DialogContent className="sm:max-w-lg rounded-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold text-purple-700">
              <Sparkles className="h-5 w-5 text-purple-600" /> AI Resume ATS Match
            </DialogTitle>
            <DialogDescription>
              Comparing your profile skills and experience with {singleJob?.title} requirements.
            </DialogDescription>
          </DialogHeader>

          {atsLoading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="h-8 w-8 text-purple-600 animate-spin" />
              <p className="text-sm font-medium text-gray-600">Analyzing resume skills & job fit with AI...</p>
            </div>
          ) : atsResult ? (
            <div className="space-y-4 pt-2">
              {/* Match Score Meter */}
              <div className="p-4 bg-purple-50 dark:bg-purple-950/40 rounded-xl border border-purple-100 dark:border-purple-900 text-center flex flex-col items-center justify-center">
                {/* 1. Scanned Source Badge */}
                <div className="mb-2">
                  {atsResult.isResumeScanned ? (
                    <span className="inline-flex items-center gap-1 text-[11px] bg-green-100 dark:bg-green-950/80 text-green-700 dark:text-green-300 px-3 py-1 rounded-full font-semibold border border-green-200 dark:border-green-800">
                      📄 Scanned from your Resume PDF
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full font-semibold border border-purple-200 dark:border-purple-800">
                      👤 Based on Profile Data
                    </span>
                  )}
                </div>

                {/* 2. ATS Match Score Header */}
                <span className="text-xs font-bold tracking-wider text-purple-700 dark:text-purple-300 uppercase">
                  ATS Match Score
                </span>

                {/* 3. Score Percentage */}
                <div className="text-4xl font-extrabold text-purple-600 dark:text-purple-400 my-1.5">
                  {atsResult.matchPercentage}%
                </div>

                <p className="text-xs text-gray-600 dark:text-gray-300 max-w-md mx-auto leading-relaxed">{atsResult.summary}</p>
              </div>

              {/* Matched Skills */}
              <div>
                <h4 className="text-xs font-bold text-green-700 dark:text-green-400 flex items-center gap-1.5 mb-2">
                  <CheckCircle2 className="h-4 w-4" /> Matched Skills ({atsResult.matchingSkills?.length || 0})
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {atsResult.matchingSkills?.map((s, idx) => (
                    <span key={idx} className="text-xs bg-green-50 text-green-800 dark:bg-green-950/40 dark:text-green-300 px-2 py-0.5 rounded-lg border border-green-200 dark:border-green-800">
                      ✓ {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Missing Skills */}
              {atsResult.missingSkills?.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5 mb-2">
                    <AlertCircle className="h-4 w-4" /> Recommended Skills to Highlight
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {atsResult.missingSkills?.map((s, idx) => (
                      <span key={idx} className="text-xs bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 px-2 py-0.5 rounded-lg border border-amber-200 dark:border-amber-800">
                        + {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actionable Recommendations */}
              <div>
                <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
                  💡 Tips to Improve Your Application:
                </h4>
                <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1.5 list-disc pl-4">
                  {atsResult.recommendations?.map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* 2. AI Interview Prep Modal */}
      <Dialog open={prepModalOpen} onOpenChange={setPrepModalOpen}>
        <DialogContent className="sm:max-w-2xl rounded-2xl max-h-[88vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold text-blue-600 dark:text-blue-400">
              <Bot className="h-5 w-5 text-blue-600 dark:text-blue-400" /> AI Interview Prep Coach
            </DialogTitle>
            <DialogDescription>
              Tailored interview strategy & top questions for {singleJob?.title} at {singleJob?.company?.name || "Company"}.
            </DialogDescription>
          </DialogHeader>

          {prepLoading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Analyzing your resume & JD to generate interview strategy and questions...
              </p>
            </div>
          ) : prepResult ? (
            <div className="space-y-6 pt-2">
              {/* Context Badge */}
              <div className="flex items-center justify-center">
                {prepResult.isResumeScanned ? (
                  <span className="inline-flex items-center gap-1 text-[11px] bg-green-100 dark:bg-green-950/80 text-green-700 dark:text-green-300 px-3 py-1 rounded-full font-semibold border border-green-200 dark:border-green-800">
                    📄 Tailored to your Uploaded Resume & Job Requirements
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full font-semibold border border-blue-200 dark:border-blue-800">
                    🎯 Based on Job Listing & Profile
                  </span>
                )}
              </div>

              {/* 🎯 Skill Focus & Interview Strategy Summary */}
              {prepResult.focusSummary && (
                <div className="p-4 bg-gradient-to-br from-blue-50/80 to-purple-50/60 dark:from-blue-950/40 dark:to-purple-950/30 rounded-2xl border border-blue-100 dark:border-blue-900/60 shadow-sm space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                      Interview Preparation Strategy & Skill Focus
                    </h3>
                  </div>

                  {prepResult.focusSummary.overview && (
                    <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                      {prepResult.focusSummary.overview}
                    </p>
                  )}

                  {prepResult.focusSummary.focusSkills?.length > 0 && (
                    <div className="pt-2 border-t border-blue-100/60 dark:border-blue-900/40 space-y-2">
                      <span className="text-[11px] font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wide">
                        Key Focus Areas to Brush Up:
                      </span>
                      <ul className="space-y-1.5">
                        {prepResult.focusSummary.focusSkills.map((item, idx) => (
                          <li key={idx} className="text-xs text-gray-700 dark:text-gray-300 flex items-start gap-2">
                            <span className="text-blue-600 dark:text-blue-400 font-bold mt-0.5">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* 📝 Top Questions Header */}
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
                <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  Top Interview Questions & Model Answers
                </h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-bold">
                  {(Array.isArray(prepResult.questions) ? prepResult.questions : (Array.isArray(prepResult) ? prepResult : [])).length} Questions
                </span>
              </div>

              {/* 📋 Questions List */}
              <div className="space-y-5 divide-y divide-gray-100 dark:divide-gray-800">
                {(Array.isArray(prepResult.questions) ? prepResult.questions : (Array.isArray(prepResult) ? prepResult : [])).map((q, idx) => (
                  <div key={idx} className="pt-4 first:pt-0 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-100 dark:border-blue-900/50">
                        {q.type || "Technical Question"}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-snug flex items-start gap-1.5">
                      <span className="text-blue-600 dark:text-blue-400 font-extrabold flex-shrink-0">
                        Q{idx + 1}.
                      </span>
                      <span>{q.question}</span>
                    </h4>

                    <div className="p-3.5 bg-gray-50 dark:bg-gray-800/60 rounded-xl text-xs text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-800/60 leading-relaxed">
                      <strong className="text-purple-600 dark:text-purple-400 font-bold block mb-1">
                        💡 How to Answer:
                      </strong>
                      {q.sampleAnswerGuidance}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* 3. AI Mock Interview Practice Modal */}
      <Dialog open={mockModalOpen} onOpenChange={setMockModalOpen}>
        <DialogContent className="sm:max-w-2xl rounded-2xl max-h-[90vh] overflow-y-auto p-6">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2 text-xl font-bold text-emerald-600 dark:text-emerald-400">
                <Mic className="h-5 w-5 text-emerald-600 dark:text-emerald-400" /> AI Mock Interview Practice
              </DialogTitle>
              {getQuestionsList().length > 0 && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
                  Question {mockCurrentIdx + 1} of {getQuestionsList().length}
                </span>
              )}
            </div>
            <DialogDescription className="text-xs">
              Practice answering questions aloud or by typing. Receive instant AI feedback, scoring & ideal answers.
            </DialogDescription>
          </DialogHeader>

          {prepLoading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Preparing mock interview questions...
              </p>
            </div>
          ) : getQuestionsList().length > 0 ? (
            <div className="space-y-4 pt-2">
              {/* Question Box */}
              <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-800/60">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                  {getQuestionsList()[mockCurrentIdx]?.type || "Technical Question"}
                </span>
                <h3 className="text-base font-bold text-gray-900 dark:text-white mt-1 leading-snug">
                  Q{mockCurrentIdx + 1}. {getQuestionsList()[mockCurrentIdx]?.question}
                </h3>
              </div>

              {/* Answer Input Area */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
                    Your Answer:
                  </label>
                  <Button
                    type="button"
                    variant={isRecording ? "destructive" : "outline"}
                    size="sm"
                    onClick={handleToggleVoiceRecording}
                    className={`text-xs h-8 rounded-xl font-semibold flex items-center gap-1.5 ${
                      isRecording ? "animate-pulse shadow-md" : "border-emerald-300 text-emerald-700 dark:border-emerald-700 dark:text-emerald-300 hover:bg-emerald-50"
                    }`}
                  >
                    {isRecording ? (
                      <>
                        <MicOff className="w-3.5 h-3.5" /> Stop Speaking
                      </>
                    ) : (
                      <>
                        <Mic className="w-3.5 h-3.5 text-emerald-600" /> 🎙️ Speak Answer (Voice)
                      </>
                    )}
                  </Button>
                </div>

                <textarea
                  rows={4}
                  value={mockUserAnswer}
                  onChange={(e) => setMockUserAnswer(e.target.value)}
                  placeholder="Type or speak your answer here. Explain your reasoning, architecture, and technical details clearly..."
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-3 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none leading-relaxed"
                />

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-gray-400">
                    {mockUserAnswer.trim().split(/\s+/).filter(Boolean).length} words
                  </span>

                  <Button
                    onClick={handleEvaluateMockAnswer}
                    disabled={evaluatingMock || !mockUserAnswer.trim()}
                    className="text-xs h-8 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm"
                  >
                    {evaluatingMock ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> Evaluating with AI...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 mr-1" /> Evaluate My Answer
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* AI Feedback Box */}
              {mockFeedback && (
                <div className="p-4 bg-gradient-to-br from-gray-50 to-emerald-50/40 dark:from-gray-900 dark:to-emerald-950/20 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 space-y-3 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between border-b border-emerald-100 dark:border-emerald-900/50 pb-2.5">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-xs font-bold text-gray-900 dark:text-white">
                        AI Bar Raiser Evaluation
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold px-3 py-1 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 rounded-full border border-emerald-300 dark:border-emerald-700">
                        ⭐ {mockFeedback.score} / 10 • {mockFeedback.verdict}
                      </span>
                    </div>
                  </div>

                  {mockFeedback.summary && (
                    <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                      {mockFeedback.summary}
                    </p>
                  )}

                  {/* Strengths */}
                  {mockFeedback.strengths?.length > 0 && (
                    <div>
                      <span className="text-[11px] font-bold text-green-700 dark:text-green-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> What You Answered Well:
                      </span>
                      <ul className="mt-1 space-y-1">
                        {mockFeedback.strengths.map((st, i) => (
                          <li key={i} className="text-xs text-gray-700 dark:text-gray-300 flex items-start gap-1.5 pl-2">
                            <span className="text-green-600 font-bold">•</span> {st}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Areas for Improvement */}
                  {mockFeedback.areasForImprovement?.length > 0 && (
                    <div>
                      <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> Key Gaps & Tips to Mention:
                      </span>
                      <ul className="mt-1 space-y-1">
                        {mockFeedback.areasForImprovement.map((imp, i) => (
                          <li key={i} className="text-xs text-gray-700 dark:text-gray-300 flex items-start gap-1.5 pl-2">
                            <span className="text-amber-600 font-bold">•</span> {imp}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Ideal Model Answer */}
                  {mockFeedback.modelAnswer && (
                    <details className="pt-2 border-t border-emerald-100 dark:border-emerald-900/50 group">
                      <summary className="text-[11px] font-bold text-purple-700 dark:text-purple-300 cursor-pointer hover:underline flex items-center gap-1">
                        💡 How a Senior Staff Engineer Answers This (Click to Reveal)
                      </summary>
                      <p className="mt-2 p-3 bg-purple-50/50 dark:bg-purple-950/30 rounded-xl text-xs text-gray-700 dark:text-gray-300 leading-relaxed border border-purple-100 dark:border-purple-900/40">
                        {mockFeedback.modelAnswer}
                      </p>
                    </details>
                  )}
                </div>
              )}

              {/* Navigation Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={mockCurrentIdx === 0}
                  onClick={handlePrevMockQuestion}
                  className="text-xs rounded-xl"
                >
                  <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Previous Question
                </Button>

                <div className="flex items-center gap-2">
                  {mockCurrentIdx < getQuestionsList().length - 1 ? (
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleNextMockQuestion}
                      className="text-xs rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                    >
                      Next Question <ChevronRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        toast.success("🎉 Fantastic job completing the AI Mock Interview Practice!");
                        setMockModalOpen(false);
                      }}
                      className="text-xs rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold"
                    >
                      Finish Practice 🎉
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-gray-500">
              No interview questions available. Please click AI Interview Prep Coach first.
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 4. AI Tailored Resume Modal */}
      <Dialog open={tailorModalOpen} onOpenChange={setTailorModalOpen}>
        <DialogContent className="sm:max-w-2xl rounded-3xl max-h-[88vh] overflow-y-auto p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl font-bold text-rose-600 dark:text-rose-400">
              <FileText className="h-5 w-5 text-rose-600" /> AI Tailored Resume Profile
            </DialogTitle>
            <DialogDescription className="text-xs">
              Custom-optimized profile, bullet points, and cover letter draft for {singleJob?.title} at {singleJob?.company?.name || "this company"}.
            </DialogDescription>
          </DialogHeader>

          {tailorLoading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="h-8 w-8 text-rose-600 animate-spin" />
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                Generating ATS-optimized resume profile and high-impact bullets...
              </p>
            </div>
          ) : tailorResult ? (
            <div className="space-y-5 pt-2 text-xs">
              {/* Projected ATS Score Banner */}
              <div className="p-4 bg-rose-50 dark:bg-rose-950/40 rounded-2xl border border-rose-100 dark:border-rose-900 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600">Projected ATS Match</span>
                  <h4 className="text-xl font-extrabold text-gray-900 dark:text-white">
                    {tailorResult.atsScoreProjection || 94}% Optimized
                  </h4>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const fullText = `TAILORED EXECUTIVE SUMMARY:\n${tailorResult.tailoredSummary}\n\nTOP KEYWORDS:\n${(tailorResult.topMatchingSkills || []).join(", ")}\n\nHIGH-IMPACT BULLET POINTS:\n${(tailorResult.tailoredBulletPoints || []).map(b => "• " + b).join("\n")}\n\nCOVER LETTER DRAFT:\n${tailorResult.coverLetterDraft}`;
                    navigator.clipboard.writeText(fullText);
                    toast.success("📋 Complete Tailored Resume copied to clipboard!");
                  }}
                  className="rounded-xl text-xs flex items-center gap-1.5 border-rose-200 text-rose-700 dark:border-rose-800 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-950"
                >
                  <Copy className="w-3.5 h-3.5" /> Copy Full Resume
                </Button>
              </div>

              {/* Tailored Professional Summary */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" /> Tailored Professional Summary
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(tailorResult.tailoredSummary);
                      toast.success("Summary copied!");
                    }}
                    className="text-[11px] text-purple-600 hover:underline font-semibold cursor-pointer"
                  >
                    Copy
                  </button>
                </div>
                <p className="p-3.5 rounded-xl bg-gray-50/80 dark:bg-gray-800/60 border border-gray-200/70 dark:border-gray-700 leading-relaxed text-gray-700 dark:text-gray-300">
                  {tailorResult.tailoredSummary}
                </p>
              </div>

              {/* Highlighted Match Skills */}
              <div className="space-y-1.5">
                <span className="font-bold text-gray-900 dark:text-white">Keywords to Highlight on Resume</span>
                <div className="flex flex-wrap gap-1.5">
                  {(tailorResult.topMatchingSkills || []).map((sk, idx) => (
                    <span key={idx} className="bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-semibold px-2.5 py-1 rounded-xl text-[11px] border border-purple-200/60 dark:border-purple-800/60">
                      ✓ {sk}
                    </span>
                  ))}
                </div>
              </div>

              {/* Tailored Bullet Points */}
              <div className="space-y-1.5">
                <span className="font-bold text-gray-900 dark:text-white">Recommended High-Impact Experience Bullets</span>
                <ul className="space-y-2">
                  {(tailorResult.tailoredBulletPoints || []).map((bullet, idx) => (
                    <li key={idx} className="p-2.5 rounded-xl bg-gray-50/80 dark:bg-gray-800/60 border border-gray-200/60 dark:border-gray-700 flex items-start gap-2">
                      <span className="text-rose-600 font-bold">•</span>
                      <span className="leading-relaxed text-gray-700 dark:text-gray-300">{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Cover Letter Pitch */}
              {tailorResult.coverLetterDraft && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900 dark:text-white">1-Click Cover Letter Pitch</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(tailorResult.coverLetterDraft);
                        toast.success("Cover letter copied!");
                      }}
                      className="text-[11px] text-purple-600 hover:underline font-semibold cursor-pointer"
                    >
                      Copy
                    </button>
                  </div>
                  <p className="p-3.5 rounded-xl bg-gray-50/80 dark:bg-gray-800/60 border border-gray-200/70 dark:border-gray-700 leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-line">
                    {tailorResult.coverLetterDraft}
                  </p>
                </div>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default JobDescription;
