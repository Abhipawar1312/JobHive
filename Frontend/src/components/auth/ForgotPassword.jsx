import React, { useState, useEffect, useRef } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { USER_API_END_POINT } from "@/utils/constant";
import { toast } from "sonner";
import { 
    Loader2, 
    KeyRound, 
    Mail, 
    ArrowLeft, 
    Lock, 
    Eye, 
    EyeOff, 
    CheckCircle2, 
    ShieldCheck, 
    RefreshCw,
    Sparkles
} from "lucide-react";

const ForgotPassword = () => {
    // 1: Request OTP, 2: Verify 6-Box OTP, 3: Create New Password
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
    const [resetToken, setResetToken] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);

    const otpInputRefs = useRef([]);
    const navigate = useNavigate();

    // Resend countdown timer
    useEffect(() => {
        let interval = null;
        if (resendTimer > 0) {
            interval = setInterval(() => {
                setResendTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [resendTimer]);

    // Password strength evaluator
    const getPasswordStrength = (pass) => {
        if (!pass) return { score: 0, label: "", color: "" };
        let score = 0;
        if (pass.length >= 8) score++;
        if (/[A-Z]/.test(pass)) score++;
        if (/[0-9]/.test(pass)) score++;
        if (/[^A-Za-z0-9]/.test(pass)) score++;

        if (score <= 1) return { score: 1, label: "Weak", color: "bg-red-500", text: "text-red-500" };
        if (score === 2 || score === 3) return { score: 2, label: "Medium", color: "bg-amber-500", text: "text-amber-500" };
        return { score: 3, label: "Strong", color: "bg-emerald-500", text: "text-emerald-500" };
    };

    const strength = getPasswordStrength(newPassword);

    // -------------------------------------------------------------
    // STEP 1: Send Recovery OTP
    // -------------------------------------------------------------
    const handleSendOtp = async (e) => {
        if (e) e.preventDefault();
        if (!email || !email.includes("@")) {
            toast.error("Please enter a valid email address.");
            return;
        }

        try {
            setLoading(true);
            const res = await axios.post(`${USER_API_END_POINT}/forgot-password`, { email });
            if (res.data.success) {
                toast.success(res.data.message || "Verification code sent to your email!");
                setOtpValues(["", "", "", "", "", ""]);
                setResendTimer(60); // 60s cooldown
                setStep(2);
                setTimeout(() => {
                    otpInputRefs.current[0]?.focus();
                }, 100);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to send reset code.");
        } finally {
            setLoading(false);
        }
    };

    // -------------------------------------------------------------
    // STEP 2: 6-Box OTP Input Handlers
    // -------------------------------------------------------------
    const handleOtpChange = (index, value) => {
        if (!/^\d*$/.test(value)) return; // Only numeric digits

        const newOtp = [...otpValues];
        newOtp[index] = value.slice(-1); // Take last entered character
        setOtpValues(newOtp);

        // Advance to next input box
        if (value && index < 5) {
            otpInputRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === "Backspace" && !otpValues[index] && index > 0) {
            otpInputRefs.current[index - 1]?.focus();
        }
    };

    const handleOtpPaste = (e) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData("text").trim().slice(0, 6);
        if (!/^\d+$/.test(pasteData)) return;

        const newOtp = [...otpValues];
        pasteData.split("").forEach((char, idx) => {
            if (idx < 6) newOtp[idx] = char;
        });
        setOtpValues(newOtp);

        const nextFocusIndex = Math.min(pasteData.length, 5);
        otpInputRefs.current[nextFocusIndex]?.focus();
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        const combinedOtp = otpValues.join("");
        if (combinedOtp.length !== 6) {
            toast.error("Please enter the complete 6-digit verification code.");
            return;
        }

        try {
            setLoading(true);
            const res = await axios.post(`${USER_API_END_POINT}/verify-otp`, {
                email,
                otp: combinedOtp,
            });

            if (res.data.success) {
                toast.success("Code verified! Please create your new password.");
                setResetToken(res.data.resetToken || combinedOtp);
                setStep(3);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Invalid or expired verification code.");
        } finally {
            setLoading(false);
        }
    };

    // -------------------------------------------------------------
    // STEP 3: Set New Password
    // -------------------------------------------------------------
    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (!newPassword || newPassword.length < 6) {
            toast.error("Password must be at least 6 characters long.");
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match. Please check again.");
            return;
        }

        try {
            setLoading(true);
            const res = await axios.post(`${USER_API_END_POINT}/reset-password`, {
                email,
                resetToken,
                otp: otpValues.join(""),
                newPassword,
            });

            if (res.data.success) {
                toast.success(res.data.message || "Password updated successfully!");
                navigate("/login");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to reset password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[85vh] flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-md bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-2xl transition-all duration-300">
                
                {/* Multi-Step Stepper Progress Bar */}
                <div className="flex items-center justify-between mb-6 pb-5 border-b border-gray-100 dark:border-gray-800">
                    {[
                        { num: 1, label: "Email" },
                        { num: 2, label: "Verify OTP" },
                        { num: 3, label: "New Password" }
                    ].map((s, idx) => {
                        const isCompleted = step > s.num;
                        const isCurrent = step === s.num;

                        return (
                            <React.Fragment key={s.num}>
                                <div className="flex flex-col items-center">
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                                        isCompleted
                                            ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                                            : isCurrent
                                            ? "bg-[#6A38C2] text-white ring-4 ring-purple-100 dark:ring-purple-950/60 shadow-md shadow-purple-500/20"
                                            : "bg-gray-100 dark:bg-gray-800 text-gray-400"
                                    }`}>
                                        {isCompleted ? "✓" : s.num}
                                    </div>
                                    <span className={`text-[10px] mt-1 font-medium ${
                                        isCurrent ? "text-purple-600 dark:text-purple-400 font-bold" : isCompleted ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400"
                                    }`}>
                                        {s.label}
                                    </span>
                                </div>
                                {idx < 2 && (
                                    <div className={`flex-1 h-[2px] mx-2 transition-all ${
                                        step > idx + 1 ? "bg-emerald-500" : "bg-gray-200 dark:bg-gray-800"
                                    }`} />
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>

                {/* ------------------------------------------------------------- */}
                {/* STEP 1: ENTER EMAIL */}
                {/* ------------------------------------------------------------- */}
                {step === 1 && (
                    <div className="animate-in fade-in duration-300">
                        <div className="text-center mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto mb-3 border border-purple-100 dark:border-purple-900 shadow-sm">
                                <Mail className="w-6 h-6" />
                            </div>
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Forgot Password?</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                No worries! Enter your account email and we'll send you a 6-digit recovery code.
                            </p>
                        </div>

                        <form onSubmit={handleSendOtp} className="space-y-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="email" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                    Account Email Address
                                </Label>
                                <div className="relative">
                                    <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-10 text-xs rounded-xl h-11 bg-gray-50/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
                                        required
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#6A38C2] hover:bg-[#5b30a6] text-white py-2.5 rounded-xl font-bold text-xs shadow-md shadow-purple-500/20 transition-all duration-200 cursor-pointer h-11"
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" /> Sending Recovery Code...
                                    </div>
                                ) : (
                                    "Send Verification Code"
                                )}
                            </Button>

                            <div className="text-center pt-2">
                                <Link
                                    to="/login"
                                    className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 font-medium transition-colors"
                                >
                                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
                                </Link>
                            </div>
                        </form>
                    </div>
                )}

                {/* ------------------------------------------------------------- */}
                {/* STEP 2: 6-BOX OTP VERIFICATION */}
                {/* ------------------------------------------------------------- */}
                {step === 2 && (
                    <div className="animate-in fade-in duration-300">
                        <div className="text-center mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-3 border border-blue-100 dark:border-blue-900 shadow-sm">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Verify Code</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                We sent a 6-digit code to <span className="font-semibold text-gray-800 dark:text-gray-200">{email}</span>
                            </p>
                        </div>

                        <form onSubmit={handleVerifyOtp} className="space-y-5">
                            {/* 6-Box Input Grid */}
                            <div className="flex items-center justify-center gap-2 sm:gap-3" onPaste={handleOtpPaste}>
                                {otpValues.map((val, idx) => (
                                    <input
                                        key={idx}
                                        ref={(el) => (otpInputRefs.current[idx] = el)}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={val}
                                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                                        className="w-11 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-bold rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                                    />
                                ))}
                            </div>

                            {/* Resend Code Countdown */}
                            <div className="flex items-center justify-between text-xs px-1">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 underline transition-colors cursor-pointer"
                                >
                                    Change Email
                                </button>

                                {resendTimer > 0 ? (
                                    <span className="text-gray-400 font-medium">
                                        Resend in <span className="text-purple-600 font-bold">{resendTimer}s</span>
                                    </span>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleSendOtp}
                                        disabled={loading}
                                        className="text-purple-600 hover:text-purple-700 dark:text-purple-400 font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors"
                                    >
                                        <RefreshCw className="w-3.5 h-3.5" /> Resend Code
                                    </button>
                                )}
                            </div>

                            <Button
                                type="submit"
                                disabled={loading || otpValues.join("").length !== 6}
                                className="w-full bg-[#6A38C2] hover:bg-[#5b30a6] text-white py-2.5 rounded-xl font-bold text-xs shadow-md shadow-purple-500/20 transition-all duration-200 cursor-pointer h-11"
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" /> Verifying Code...
                                    </div>
                                ) : (
                                    "Verify & Continue"
                                )}
                            </Button>
                        </form>
                    </div>
                )}

                {/* ------------------------------------------------------------- */}
                {/* STEP 3: CREATE NEW PASSWORD */}
                {/* ------------------------------------------------------------- */}
                {step === 3 && (
                    <div className="animate-in fade-in duration-300">
                        <div className="text-center mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3 border border-emerald-100 dark:border-emerald-900 shadow-sm">
                                <KeyRound className="w-6 h-6" />
                            </div>
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Create New Password</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Your identity has been verified. Choose a secure new password.
                            </p>
                        </div>

                        <form onSubmit={handleResetPassword} className="space-y-4">
                            {/* New Password */}
                            <div className="space-y-1.5">
                                <Label htmlFor="newPassword" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                    New Password
                                </Label>
                                <div className="relative">
                                    <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                    <Input
                                        id="newPassword"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="pl-10 pr-10 text-xs rounded-xl h-11 bg-gray-50/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
                                        required
                                        autoFocus
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>

                                {/* Password Strength Meter */}
                                {newPassword && (
                                    <div className="pt-1 space-y-1">
                                        <div className="flex items-center justify-between text-[11px]">
                                            <span className="text-gray-400">Password Strength:</span>
                                            <span className={`font-bold ${strength.text}`}>{strength.label}</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden flex gap-1">
                                            <div className={`h-full flex-1 rounded-full transition-all duration-300 ${strength.score >= 1 ? strength.color : "bg-transparent"}`} />
                                            <div className={`h-full flex-1 rounded-full transition-all duration-300 ${strength.score >= 2 ? strength.color : "bg-transparent"}`} />
                                            <div className={`h-full flex-1 rounded-full transition-all duration-300 ${strength.score >= 3 ? strength.color : "bg-transparent"}`} />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Confirm New Password */}
                            <div className="space-y-1.5">
                                <Label htmlFor="confirmPassword" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                    Confirm New Password
                                </Label>
                                <div className="relative">
                                    <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                    <Input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="pl-10 pr-10 text-xs rounded-xl h-11 bg-gray-50/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={loading || !newPassword || newPassword !== confirmPassword}
                                className="w-full bg-[#6A38C2] hover:bg-[#5b30a6] text-white py-2.5 rounded-xl font-bold text-xs shadow-md shadow-purple-500/20 transition-all duration-200 cursor-pointer h-11"
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" /> Updating Password...
                                    </div>
                                ) : (
                                    "Save & Reset Password"
                                )}
                            </Button>
                        </form>
                    </div>
                )}

            </div>
        </div>
    );
};

export default ForgotPassword;
