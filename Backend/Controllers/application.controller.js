import { Application } from "../models/application.model.js";
import { Job } from "../models/job.model.js";
import { User } from "../models/user.model.js";
import { Notification } from "../models/notification.model.js";
import { emitNotification, emitApplicationUpdate } from "../utils/socket.js";
import { sendApplicationConfirmationEmail, sendStatusUpdateEmail } from "../utils/emailService.js";
import { evaluateResumeWithGemini } from "../utils/geminiAtsEngine.js";

// Candidate: Apply for a Job
export const applyJob = async (req, res) => {
    try {
        const userId = req.id;
        const jobId = req.params.id;

        if (!jobId) {
            return res.status(400).json({
                message: "Job ID is required.",
                success: false
            });
        }

        // Check if candidate already applied
        const existingApplication = await Application.findOne({ job: jobId, applicant: userId });
        if (existingApplication) {
            return res.status(400).json({
                message: "You have already applied for this job.",
                success: false
            });
        }

        // Check if job exists
        const job = await Job.findById(jobId).populate("company");
        if (!job) {
            return res.status(404).json({
                message: "Job not found.",
                success: false
            });
        }

        if (job.status === "closed") {
            return res.status(400).json({
                message: "Applications are closed for this job opening.",
                success: false
            });
        }

        const applicantUser = await User.findById(userId);
        if (!applicantUser?.profile?.resume) {
            return res.status(400).json({
                message: "Please upload your resume in your profile before applying for jobs.",
                success: false
            });
        }

        // Create application with initial timeline
        const newApplication = await Application.create({
            job: jobId,
            applicant: userId,
            status: "pending",
            timeline: [
                {
                    status: "pending",
                    updatedAt: new Date(),
                    comment: "Application submitted."
                }
            ]
        });

        job.applications.push(newApplication._id);
        await job.save();

        // 🤖 Asynchronously run 100% Real Gemini AI evaluation on candidate's PDF resume against JD
        evaluateResumeWithGemini(applicantUser, job).then(async (aiResult) => {
            if (aiResult) {
                newApplication.atsScore = aiResult.matchPercentage;
                newApplication.atsFeedback = {
                    summary: aiResult.summary,
                    matchingSkills: aiResult.matchingSkills,
                    missingSkills: aiResult.missingSkills,
                    recommendations: aiResult.recommendations,
                    isResumeScanned: aiResult.isResumeScanned
                };
                await newApplication.save();

                if (job.created_by) {
                    emitApplicationUpdate(job.created_by.toString(), newApplication);
                }
            }
        }).catch(aiErr => console.error("Async AI Resume ATS Scan Error on apply:", aiErr.message));

        // 1. Create notification for Recruiter
        if (job.created_by) {
            const recruiterNotif = await Notification.create({
                recipient: job.created_by,
                sender: userId,
                type: "new_application",
                title: "New Application Received",
                message: `${applicantUser ? applicantUser.fullname : "A candidate"} applied for ${job.title}`,
                link: `/admin/jobs/${job._id}/applicants`
            });
            emitNotification(job.created_by.toString(), recruiterNotif);
        }

        // 2. Send confirmation email to Candidate (async in background)
        if (applicantUser && applicantUser.email) {
            sendApplicationConfirmationEmail(
                applicantUser.email,
                applicantUser.fullname,
                job.title,
                job.company ? job.company.name : "the Company"
            ).catch(e => console.error("Email confirm error:", e));
        }

        return res.status(201).json({
            message: "Job Applied Successfully!",
            application: newApplication,
            success: true
        });
    } catch (error) {
        console.error("Apply Job Error:", error);
        return res.status(500).json({
            message: error.message || "Internal Server Error",
            success: false
        });
    }
};

// Candidate: Get all jobs applied by logged-in user
export const getAppliedJobs = async (req, res) => {
    try {
        const userId = req.id;
        const applications = await Application.find({ applicant: userId })
            .sort({ createdAt: -1 })
            .populate({
                path: 'job',
                populate: [
                    { path: 'company' },
                    { path: 'created_by', select: 'fullname email profilePhoto role' }
                ]
            });

        return res.status(200).json({
            application: applications || [],
            success: true
        });
    } catch (error) {
        console.error("Get Applied Jobs Error:", error);
        return res.status(500).json({
            message: "Internal Server Error",
            success: false
        });
    }
};

// Recruiter: Get all applicants for a specific job
export const getApplicants = async (req, res) => {
    try {
        const jobId = req.params.id;
        const job = await Job.findById(jobId).populate({
            path: 'applications',
            options: { sort: { createdAt: -1 } },
            populate: {
                path: 'applicant',
                select: '-password'
            }
        }).populate('company');

        if (!job) {
            return res.status(404).json({
                message: 'Job Not Found',
                success: false
            });
        }

        // Auto-screen any un-scanned applicants in the background with Gemini AI
        const unscannedApps = (job.applications || []).filter(app => typeof app.atsScore !== "number" || app.atsScore <= 0);
        if (unscannedApps.length > 0) {
            (async () => {
                for (const app of unscannedApps) {
                    if (!app.applicant) continue;
                    try {
                        const aiResult = await evaluateResumeWithGemini(app.applicant, job);
                        if (aiResult) {
                            app.atsScore = aiResult.matchPercentage;
                            app.atsFeedback = {
                                summary: aiResult.summary,
                                matchingSkills: aiResult.matchingSkills,
                                missingSkills: aiResult.missingSkills,
                                recommendations: aiResult.recommendations,
                                isResumeScanned: aiResult.isResumeScanned
                            };
                            await app.save();
                            if (job.created_by) {
                                emitApplicationUpdate(job.created_by.toString(), app);
                            }
                        }
                    } catch (e) {
                        console.error("Auto AI scan error for applicant:", e.message);
                    }
                }
            })();
        }

        return res.status(200).json({
            job,
            success: true
        });
    } catch (error) {
        console.error("Get Applicants Error:", error);
        return res.status(500).json({
            message: "Internal Server Error",
            success: false
        });
    }
};

// Recruiter: Update Application Status & Interview Details
export const updateStatus = async (req, res) => {
    try {
        const { status, interviewDetails, recruiterNotes, comment } = req.body;
        const applicationId = req.params.id;

        if (!status) {
            return res.status(400).json({
                message: 'Status is required.',
                success: false
            });
        }

        const application = await Application.findById(applicationId)
            .populate("applicant")
            .populate({
                path: "job",
                populate: { path: "company" }
            });

        if (!application) {
            return res.status(404).json({
                message: 'Application not found.',
                success: false
            });
        }

        const formattedStatus = status.toLowerCase();
        application.status = formattedStatus;

        if (interviewDetails) {
            application.interviewDetails = {
                date: interviewDetails.date || application.interviewDetails?.date,
                meetingUrl: interviewDetails.meetingUrl || application.interviewDetails?.meetingUrl,
                notes: interviewDetails.notes || application.interviewDetails?.notes
            };
        }

        if (recruiterNotes !== undefined) {
            application.recruiterNotes = recruiterNotes;
        }

        application.timeline.push({
            status: formattedStatus,
            updatedAt: new Date(),
            comment: comment || `Status updated to ${formattedStatus}`
        });

        await application.save();

        // 1. Notify Candidate in Real-time
        if (application.applicant) {
            const notif = await Notification.create({
                recipient: application.applicant._id,
                sender: req.id,
                type: formattedStatus === "interview" ? "interview_scheduled" : "status_change",
                title: formattedStatus === "interview" ? "Interview Scheduled!" : "Application Status Updated",
                message: `Your application for ${application.job?.title || "Job"} has been updated to "${formattedStatus.toUpperCase()}".`,
                link: "/profile"
            });
            emitNotification(application.applicant._id.toString(), notif);
            emitApplicationUpdate(application.applicant._id.toString(), {
                _id: application._id,
                status: formattedStatus,
                timeline: application.timeline,
                interviewDetails: application.interviewDetails,
                job: application.job
            });

            // 2. Send Status Update Email
            if (application.applicant.email) {
                sendStatusUpdateEmail(
                    application.applicant.email,
                    application.applicant.fullname,
                    application.job?.title || "Role",
                    application.job?.company?.name || "Company",
                    formattedStatus,
                    application.interviewDetails
                ).catch(e => console.error("Status email error:", e));
            }
        }

        return res.status(200).json({
            message: `Status updated to ${formattedStatus}.`,
            application,
            success: true
        });
    } catch (error) {
        console.error("Update Status Error:", error);
        return res.status(500).json({
            message: "Failed to update application status.",
            success: false
        });
    }
};

// Recruiter: Export Applicants to CSV
export const exportApplicantsCSV = async (req, res) => {
    try {
        const jobId = req.params.id;
        const job = await Job.findById(jobId)
            .populate({
                path: 'applications',
                populate: {
                    path: 'applicant',
                    select: 'fullname email phoneNumber profile'
                }
            })
            .populate('company');

        if (!job) {
            return res.status(404).json({ message: "Job not found", success: false });
        }

        let csv = "Applicant Name,Email,Phone Number,ATS Match Score,Skills,Status,Resume URL,Applied Date\n";

        const jobText = `${job.title || ""} ${job.description || ""} ${job.requirements || ""}`.toLowerCase();

        job.applications.forEach(app => {
            const user = app.applicant;
            if (user) {
                // Calculate backend ATS score
                let score = 35;
                const skills = user.profile?.skills || [];
                if (skills.length > 0) {
                    let matches = 0;
                    skills.forEach(s => {
                        if (s && jobText.includes(s.toLowerCase().trim())) matches++;
                    });
                    score += Math.min(Math.round((matches / Math.max(skills.length, 3)) * 45), 45);
                }
                if (user.profile?.resume) score += 10;
                score = Math.max(35, Math.min(score, 98));

                const name = `"${user.fullname || ''}"`;
                const email = `"${user.email || ''}"`;
                const phone = `"${user.phoneNumber || ''}"`;
                const atsScore = `"${score}%"`;
                const skillsStr = `"${skills.join(', ')}"`;
                const status = `"${app.status || 'pending'}"`;
                const resume = `"${user.profile?.resume || ''}"`;
                const date = `"${new Date(app.createdAt).toLocaleDateString()}"`;
                csv += `${name},${email},${phone},${atsScore},${skillsStr},${status},${resume},${date}\n`;
            }
        });

        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", `attachment; filename="applicants_${job.title.replace(/[^a-zA-Z0-9]/g, "_")}.csv"`);
        return res.status(200).send(csv);
    } catch (error) {
        console.error("Export CSV Error:", error);
        return res.status(500).json({ message: "Failed to export applicants", success: false });
    }
};