import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { createRequire } from "module";
import { Job } from "../models/job.model.js";
import { User } from "../models/user.model.js";
import { Company } from "../models/company.model.js";
import { Application } from "../models/application.model.js";
import { emitApplicationUpdate } from "../utils/socket.js";

const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");

dotenv.config();

const getGeminiModel = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;
    const genAI = new GoogleGenerativeAI(apiKey);
    return genAI.getGenerativeModel({ model: "gemini-3.5-flash-lite" });
};

// 1. AI Resume & Job Matcher (ATS Score)
export const analyzeResumeMatch = async (req, res) => {
    try {
        const userId = req.id;
        const { jobId } = req.body;

        if (!jobId) {
            return res.status(400).json({ message: "Job ID is required", success: false });
        }

        const [user, job] = await Promise.all([
            User.findById(userId),
            Job.findById(jobId).populate("company")
        ]);

        if (!user || !job) {
            return res.status(404).json({ message: "User or Job not found", success: false });
        }

        const candidateSkills = user.profile?.skills || [];
        const candidateBio = user.profile?.bio || "";
        const resumeUrl = user.profile?.resume || "";
        const jobReqs = job.requirements || "";
        const jobTitle = job.title;
        const jobDesc = job.description;

        // 📄 Fetch candidate's uploaded resume PDF
        let base64Pdf = null;
        let isResumeScanned = false;

        if (resumeUrl) {
            try {
                const pdfRes = await fetch(resumeUrl);
                if (pdfRes.ok) {
                    const arrayBuffer = await pdfRes.arrayBuffer();
                    if (arrayBuffer.byteLength > 100) {
                        base64Pdf = Buffer.from(arrayBuffer).toString("base64");
                        isResumeScanned = true;
                    }
                }
            } catch (pdfErr) {
                console.error("Resume PDF Download Error:", pdfErr.message);
            }
        }

        const model = getGeminiModel();

        if (model) {
            const prompt = `
You are an advanced Applicant Tracking System (ATS) and Senior Technical Recruiter.
Carefully analyze this candidate's resume against the target job posting.

TARGET JOB POSTING:
- Title: ${jobTitle}
- Company: ${job.company?.name || "Tech Company"}
- Requirements: ${jobReqs}
- Description: ${jobDesc}

Perform a comprehensive ATS evaluation:
1. matchPercentage: Integer between 0 and 100 based on true match of experience, tech stack, and skills in the resume.
2. summary: A 2-sentence summary highlighting the candidate's core strengths and any specific gaps.
3. matchingSkills: Array of specific skills/technologies found in both the candidate's resume and job requirements.
4. missingSkills: Array of critical skills or technologies required by the job that are missing from the resume.
5. recommendations: Array of 2-3 actionable tips to improve match for this specific role.

Respond with ONLY valid JSON with no markdown formatting or commentary:
{
  "matchPercentage": 85,
  "summary": "...",
  "matchingSkills": ["..."],
  "missingSkills": ["..."],
  "recommendations": ["..."]
}
`;

            try {
                const contentParts = [];
                if (base64Pdf) {
                    contentParts.push({
                        inlineData: {
                            data: base64Pdf,
                            mimeType: "application/pdf"
                        }
                    });
                } else {
                    contentParts.push(`CANDIDATE PROFILE:\n- Skills: ${candidateSkills.join(", ") || "None listed"}\n- Bio: ${candidateBio || "None provided"}`);
                }
                contentParts.push(prompt);

                const result = await model.generateContent(contentParts);
                const responseText = result.response.text().trim();
                const cleanedJson = responseText.replace(/```json/gi, "").replace(/```/gi, "").trim();
                const parsed = JSON.parse(cleanedJson);

                const finalScore = parsed.matchPercentage ?? parsed.atsScore ?? 75;

                // Persist the Gemini AI score onto candidate's Application record in DB
                try {
                    const updatedApp = await Application.findOneAndUpdate(
                        { job: jobId, applicant: userId },
                        {
                            atsScore: finalScore,
                            atsFeedback: {
                                summary: parsed.summary,
                                matchingSkills: parsed.matchingSkills || parsed.matchedSkills || [],
                                missingSkills: parsed.missingSkills || [],
                                isResumeScanned
                            }
                        },
                        { new: true }
                    );

                    if (updatedApp && job.created_by) {
                        emitApplicationUpdate(job.created_by.toString(), updatedApp);
                    }
                } catch (dbErr) {
                    console.error("Failed to save ATS score to Application:", dbErr.message);
                }

                return res.status(200).json({
                    success: true,
                    data: {
                        matchPercentage: finalScore,
                        summary: parsed.summary || `Candidate shows relevant match for ${jobTitle} role.`,
                        matchingSkills: parsed.matchingSkills || parsed.matchedSkills || candidateSkills,
                        missingSkills: parsed.missingSkills || [],
                        recommendations: parsed.recommendations || [],
                        isResumeScanned
                    },
                    aiPowered: true
                });
            } catch (aiError) {
                console.error("Gemini AI API call failed, falling back to heuristic:", aiError.message);
            }
        }

        // Rule-Based Heuristic Fallback if no API key or AI error
        const jobReqWords = (jobReqs + " " + jobDesc + " " + (resumeText || "")).toLowerCase();
        const matched = [];
        const missing = [];

        candidateSkills.forEach(skill => {
            if (jobReqWords.includes(skill.toLowerCase())) {
                matched.push(skill);
            } else {
                missing.push(skill);
            }
        });

        const totalSkillsCount = candidateSkills.length || 1;
        const matchPercentage = Math.min(100, Math.round((matched.length / totalSkillsCount) * 85) + 15);

        const recommendations = [];
        if (missing.length > 0) {
            recommendations.push(`Consider adding relevant projects demonstrating ${missing.slice(0, 3).join(", ")}.`);
        }
        recommendations.push("Quantify your project outcomes with measurable business metrics (e.g. % performance increase).");
        recommendations.push(`Tailor your resume highlights specifically for ${jobTitle} roles.`);

        return res.status(200).json({
            success: true,
            data: {
                matchPercentage,
                summary: `You have ${matched.length} key skills matching the requirements for ${jobTitle}.`,
                matchingSkills: matched,
                missingSkills: missing,
                recommendations
            },
            aiPowered: false
        });
    } catch (error) {
        console.error("Analyze Resume Error:", error);
        return res.status(500).json({ message: "Failed to analyze resume match", success: false });
    }
};

// 2. AI Job Description Generator for Recruiters
export const generateJobDescription = async (req, res) => {
    try {
        const { title, skills, experience, companyName } = req.body;

        if (!title) {
            return res.status(400).json({ message: "Job title is required", success: false });
        }

        const model = getGeminiModel();

        if (model) {
            const prompt = `
You are an expert tech recruiter. Write a comprehensive, attractive, professional Job Description for:
Job Title: ${title}
Company: ${companyName || "Our Company"}
Required Skills: ${skills || "Relevant industry skills"}
Experience Level: ${experience || "1-3 years"}

Format the response in clean Markdown with sections:
### About the Role
### Key Responsibilities
### Requirements & Qualifications
### What We Offer
`;
            try {
                const result = await model.generateContent(prompt);
                return res.status(200).json({
                    success: true,
                    description: result.response.text().trim(),
                    aiPowered: true
                });
            } catch (err) {
                console.error("AI JD Gen Error:", err);
            }
        }

        // Fallback JD Template
        const fallbackDesc = `### About the Role\nWe are looking for a passionate **${title}** to join our team at **${companyName || "our company"}**. In this role, you will collaborate with cross-functional teams to build scalable, high-quality digital solutions.\n\n### Key Responsibilities\n- Design, develop, and maintain clean and efficient features.\n- Collaborate with product managers and engineers to architect high-performance solutions.\n- Participate in code reviews and advocate for engineering best practices.\n\n### Requirements & Qualifications\n- Experience: ${experience || "1-3 years"} in a similar role.\n- Strong proficiency in: ${skills || "modern tech stack"}.\n- Good problem-solving and communication skills.\n\n### What We Offer\n- Competitive salary package.\n- Flexible working environment.\n- Career growth and learning opportunities.`;

        return res.status(200).json({
            success: true,
            description: fallbackDesc,
            aiPowered: false
        });
    } catch (error) {
        return res.status(500).json({ message: "Failed to generate job description", success: false });
    }
};

// 3. AI Interview Prep Questions for Students
export const generateInterviewQuestions = async (req, res) => {
    try {
        const { jobId } = req.params;
        const job = await Job.findById(jobId).populate("company");

        if (!job) {
            return res.status(404).json({ message: "Job not found", success: false });
        }

        // Check if candidate is logged in to tailor questions to their actual resume
        let user = null;
        let base64Pdf = null;
        let isResumeScanned = false;

        const token = req.cookies?.token || req.headers?.authorization?.split(" ")[1];
        if (token) {
            try {
                const decode = jwt.verify(token, process.env.SECRET_KEY);
                if (decode && decode.userId) {
                    user = await User.findById(decode.userId);
                }
            } catch (e) {
                // Ignore guest token error
            }
        }

        const resumeUrl = user?.profile?.resume || "";
        if (resumeUrl) {
            try {
                const pdfRes = await fetch(resumeUrl);
                if (pdfRes.ok) {
                    const arrayBuffer = await pdfRes.arrayBuffer();
                    if (arrayBuffer.byteLength > 100) {
                        base64Pdf = Buffer.from(arrayBuffer).toString("base64");
                        isResumeScanned = true;
                    }
                }
            } catch (pdfErr) {
                console.error("Resume PDF Download Error for Interview Prep:", pdfErr.message);
            }
        }

        const model = getGeminiModel();

        if (model) {
            const prompt = `
You are an expert Senior Technical Hiring Manager and Elite Interview Coach.
Generate an in-depth, personalized interview preparation dossier for this candidate applying for:
Job Title: ${job.title}
Company: ${job.company?.name || "Tech Company"}
Requirements: ${job.requirements || "Standard software development"}
Description: ${job.description}

${isResumeScanned ? "The candidate's full resume PDF is attached. Please tailor questions specifically to both their resume background and this exact job." : (user ? `Candidate Profile: Skills - ${user.profile?.skills?.join(", ") || "General"}` : "Candidate Profile: General Applicant")}

Please perform two critical tasks:
1. FOCUS SUMMARY & SKILL IMPROVEMENT ROADMAP:
   - overview: 2-3 sentence strategic roadmap explaining what specific skills, architecture concepts, or gaps between their resume and the JD the candidate MUST focus on to ace this interview.
   - focusSkills: Array of 3-4 concrete skills/topics to brush up on, with concise reasons why.

2. TOP 10 INTERVIEW QUESTIONS & MODEL ANSWERS:
   - Generate AT LEAST 10 highly realistic, rigorous interview questions (spanning Technical Deep Dive, System Architecture, Code Design, Testing & Mocking, Performance Optimization, Scenario/Debugging, and Behavioral/Culture).
   - For every question, provide extensive "sampleAnswerGuidance" detailing the exact technical talking points, trade-offs, step-by-step reasoning, and frameworks (like STAR) to deliver a world-class answer.

Respond in ONLY valid JSON format with no markdown tags or commentary:
{
  "focusSummary": {
    "overview": "2-3 sentence strategic roadmap on where the candidate needs to focus...",
    "focusSkills": [
      "Key Skill/Topic 1: Specific reason to review this",
      "Key Skill/Topic 2: Specific reason to review this",
      "Key Skill/Topic 3: Specific reason to review this"
    ]
  },
  "questions": [
    {
      "question": "...",
      "type": "Technical / Architecture / Testing / Scenario / Behavioral",
      "sampleAnswerGuidance": "..."
    }
  ]
}
`;
            try {
                const contentParts = [];
                if (base64Pdf) {
                    contentParts.push({
                        inlineData: {
                            data: base64Pdf,
                            mimeType: "application/pdf"
                        }
                    });
                } else if (user) {
                    contentParts.push(`CANDIDATE PROFILE:\n- Skills: ${user.profile?.skills?.join(", ") || "None listed"}\n- Bio: ${user.profile?.bio || "None provided"}`);
                }
                contentParts.push(prompt);

                const result = await model.generateContent(contentParts);
                const text = result.response.text().trim().replace(/```json/gi, "").replace(/```/gi, "").trim();
                const parsed = JSON.parse(text);
                const questions = Array.isArray(parsed) ? parsed : (parsed.questions || parsed.interviewQuestions || []);
                const focusSummary = parsed.focusSummary || {
                    overview: `Focus on mastering the core competencies required for ${job.title}, including component architecture, state management, and end-to-end testing.`,
                    focusSkills: [
                        `Core Technologies: Deep dive into ${job.title} paradigms, lifecycles, and modern patterns.`,
                        `System Architecture & Performance: Prepare to discuss caching, bundle optimization, and latency reduction.`,
                        `Automated Testing: Review unit, integration, and mocking strategies.`
                    ]
                };

                if (questions.length > 0) {
                    return res.status(200).json({
                        success: true,
                        focusSummary,
                        questions,
                        isResumeScanned,
                        aiPowered: true
                    });
                }
            } catch (err) {
                console.error("AI Interview Questions Error:", err);
            }
        }

        // Fallback questions
        return res.status(200).json({
            success: true,
            focusSummary: {
                overview: `To excel in your interview for ${job.title} at ${job.company?.name || "this company"}, focus on demonstrating practical problem solving, robust architecture patterns, and structured communication.`,
                focusSkills: [
                    `Domain Expertise: Brush up on core ${job.title} principles, asynchronous data flow, and state handling.`,
                    `Testing & Quality: Prepare examples of automated testing and debugging complex edge cases.`,
                    `System Optimization: Review profiling tools, database indexing, and frontend rendering optimization.`
                ]
            },
            questions: [
                {
                    question: `Can you walk us through a challenging project you built related to ${job.title}?`,
                    type: "Experience & Architecture",
                    sampleAnswerGuidance: "Use the STAR method (Situation, Task, Action, Result) highlighting your specific architectural decisions and quantifiable outcomes."
                },
                {
                    question: "How do you optimize application performance and handle bottlenecks?",
                    type: "Technical Problem Solving",
                    sampleAnswerGuidance: "Discuss profiling tools, memoization, code-splitting, database indexing, and caching strategies."
                },
                {
                    question: "How do you manage complex application state and ensure predictable data flow?",
                    type: "State Architecture",
                    sampleAnswerGuidance: "Compare local component state vs global state (Redux/Zustand), immutability, selectors, and side-effect handling."
                },
                {
                    question: "Describe your approach to writing automated unit and integration tests.",
                    type: "Testing & Quality",
                    sampleAnswerGuidance: "Explain test pyramid principles, testing behavior over implementation details, and mocking network/API boundaries."
                },
                {
                    question: "Describe a situation where you had to learn a new technology or resolve a high-severity production bug quickly.",
                    type: "Behavioral / Adaptability",
                    sampleAnswerGuidance: "Focus on structured debugging, log inspection, documentation reading, and maintaining composure under tight deadlines."
                },
                {
                    question: "How do you ensure cross-browser compatibility and responsive UI performance across mobile and desktop devices?",
                    type: "Frontend Engineering",
                    sampleAnswerGuidance: "Explain mobile-first CSS, flexible grid/flexbox layouts, responsive image assets, and cross-browser automated testing."
                },
                {
                    question: "How do you secure API communication and authenticate users in a modern web application?",
                    type: "Security & Authentication",
                    sampleAnswerGuidance: "Discuss JWT tokens, HttpOnly secure cookies, CORS configuration, CSRF prevention, and role-based access control."
                },
                {
                    question: "Can you explain how you design and consume RESTful APIs effectively?",
                    type: "API Design & Integration",
                    sampleAnswerGuidance: "Discuss semantic HTTP methods, status codes, pagination, optimistic UI updates, and error handling."
                },
                {
                    question: "Tell me about a time you had a technical disagreement with a team member. How did you resolve it?",
                    type: "Collaboration & Conflict",
                    sampleAnswerGuidance: "Emphasize data-driven evaluation, prototyping both solutions to test performance, active listening, and putting project goals first."
                },
                {
                    question: `What makes you excited to work at ${job.company?.name || "this company"} in this position?`,
                    type: "Company Fit",
                    sampleAnswerGuidance: "Connect your career aspirations with the company's product domain, engineering culture, and growth trajectory."
                }
            ],
            isResumeScanned,
            aiPowered: false
        });
    } catch (error) {
        return res.status(500).json({ message: "Failed to generate interview questions", success: false });
    }
};

// 4. AI Resume Auto-Fill / Profile Parser
export const parseResumeForProfile = async (req, res) => {
    try {
        const userId = req.id;
        const user = await User.findById(userId);

        let base64Pdf = null;

        // Option A: If file is sent in multipart body
        if (req.file) {
            base64Pdf = req.file.buffer.toString("base64");
        } else if (user?.profile?.resume) {
            // Option B: Use candidate's existing resume URL in Cloudinary
            try {
                const pdfRes = await fetch(user.profile.resume);
                if (pdfRes.ok) {
                    const arrayBuffer = await pdfRes.arrayBuffer();
                    if (arrayBuffer.byteLength > 100) {
                        base64Pdf = Buffer.from(arrayBuffer).toString("base64");
                    }
                }
            } catch (e) {
                console.error("Resume fetch error:", e.message);
            }
        }

        if (!base64Pdf) {
            return res.status(400).json({
                message: "No resume PDF provided to parse.",
                success: false
            });
        }

        const model = getGeminiModel();
        if (!model) {
            return res.status(500).json({ message: "AI Model not configured", success: false });
        }

        const prompt = `
You are an expert AI Resume Parser.
Analyze the candidate's resume PDF and extract their key profile details:
1. fullname: Full name of candidate.
2. phoneNumber: Contact mobile number.
3. bio: A concise, impactful professional summary or headline (1-2 sentences) highlighting their primary role, years of experience, and key strengths (e.g. "Full Stack Developer with 2+ years of experience specializing in React.js, Node.js, and high-performance web applications.").
4. skills: A clean, comprehensive array of all technical skills, programming languages, libraries, tools, frameworks, and databases mentioned on the resume.

Respond in ONLY valid JSON format:
{
  "fullname": "...",
  "phoneNumber": "...",
  "bio": "...",
  "skills": ["React.js", "Node.js", "JavaScript", "TypeScript", "Redux", "Webpack", "Jest", "MongoDB"]
}
`;

        const result = await model.generateContent([
            {
                inlineData: {
                    data: base64Pdf,
                    mimeType: "application/pdf"
                }
            },
            prompt
        ]);

        const text = result.response.text().trim().replace(/```json/gi, "").replace(/```/gi, "").trim();
        const parsed = JSON.parse(text);

        return res.status(200).json({
            success: true,
            message: "Resume parsed successfully.",
            data: {
                fullname: parsed.fullname || user?.fullname || "",
                phoneNumber: parsed.phoneNumber || user?.phoneNumber || "",
                bio: parsed.bio || "",
                skills: Array.isArray(parsed.skills) ? parsed.skills.join(", ") : (parsed.skills || "")
            }
        });
    } catch (error) {
        console.error("Parse Resume AI Error:", error);
        return res.status(500).json({
            message: "Failed to parse resume with AI.",
            success: false
        });
    }
};

// 5. AI Mock Interview Practice Evaluator
export const evaluateMockInterviewAnswer = async (req, res) => {
    try {
        const { question, userAnswer, jobTitle, jobRequirements } = req.body;

        if (!question || !userAnswer) {
            return res.status(400).json({ message: "Question and answer are required", success: false });
        }

        const model = getGeminiModel();
        if (!model) {
            return res.status(500).json({ message: "AI Model not configured", success: false });
        }

        const prompt = `
You are a Principal Technical Hiring Bar Raiser and Elite Engineering Interview Coach evaluating a candidate's answer for:
Role: ${jobTitle || "Software Engineer"}
Requirements: ${jobRequirements || "Standard software development"}

INTERVIEW QUESTION:
"${question}"

CANDIDATE'S ANSWER:
"${userAnswer}"

Evaluate the candidate's answer with high precision and provide constructive, encouraging feedback in ONLY valid JSON format with no extra markdown:
{
  "score": 8.5,
  "verdict": "Strong Hire / Hire / Needs Work",
  "summary": "1-2 sentence overall impression of the answer.",
  "strengths": [
    "Specific technical point or structure the candidate got right",
    "Another positive aspect"
  ],
  "areasForImprovement": [
    "Specific concept, keyword, edge case, or trade-off the candidate omitted",
    "How to structure the answer better"
  ],
  "modelAnswer": "A concise, masterfully structured 2-3 paragraph answer demonstrating how a Senior/Staff Engineer would answer this question, mentioning key trade-offs, architecture, and best practices."
}
`;

        const result = await model.generateContent(prompt);
        const text = result.response.text().trim().replace(/```json/gi, "").replace(/```/gi, "").trim();
        const parsed = JSON.parse(text);

        return res.status(200).json({
            success: true,
            feedback: parsed,
            aiPowered: true
        });
    } catch (error) {
        console.error("AI Mock Evaluation Error:", error);
        return res.status(500).json({ message: "Failed to evaluate mock interview answer", success: false });
    }
};

// 6. AI Tailored Resume Generator for Specific Job
export const tailorResumeForJob = async (req, res) => {
    try {
        const userId = req.id;
        const { jobId } = req.body;

        const [user, job] = await Promise.all([
            User.findById(userId),
            Job.findById(jobId).populate("company")
        ]);

        if (!job) {
            return res.status(404).json({ message: "Job not found", success: false });
        }

        const model = getGeminiModel();
        const candidateName = user?.fullname || "Candidate";
        const candidateBio = user?.profile?.bio || "Experienced software engineer";
        const candidateSkills = (user?.profile?.skills || ["JavaScript", "React", "Node.js"]).join(", ");

        const prompt = `
You are an executive resume writer and ATS optimization specialist.
Generate a tailored, ATS-optimized resume profile and strategic bullet points for the following candidate applying for this specific position:

TARGET JOB:
- Position: ${job.title}
- Company: ${job.company?.name || "Target Company"}
- Requirements: ${job.requirements}
- Description: ${job.description}

CANDIDATE BACKGROUND:
- Name: ${candidateName}
- Current Bio: ${candidateBio}
- Existing Skills: ${candidateSkills}

Generate the response in ONLY valid JSON with no markdown wrapping:
{
  "tailoredSummary": "A powerful 3-sentence professional executive summary directly aligning candidate skills with the role's primary goals.",
  "topMatchingSkills": ["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5", "Skill 6"],
  "tailoredBulletPoints": [
    "Architected and deployed...",
    "Spearheaded the development of...",
    "Optimized latency and throughput by...",
    "Collaborated with cross-functional teams to deliver..."
  ],
  "coverLetterDraft": "Dear Hiring Team at ${job.company?.name || 'the company'}, I am excited to apply for the ${job.title} role...",
  "atsScoreProjection": 94
}
`;

        let tailoredData;
        if (model) {
            const result = await model.generateContent(prompt);
            const text = result.response.text().trim().replace(/```json/gi, "").replace(/```/gi, "").trim();
            tailoredData = JSON.parse(text);
        } else {
            // Fallback simulation
            tailoredData = {
                tailoredSummary: `Dedicated and results-oriented professional with deep expertise in ${candidateSkills}, eager to drive impact as a ${job.title} at ${job.company?.name || "your organization"}. Proven track record of delivering high-quality, scalable solutions and collaborating across teams.`,
                topMatchingSkills: user?.profile?.skills || ["Full Stack Development", "Problem Solving", "System Design"],
                tailoredBulletPoints: [
                    `Developed and deployed robust features directly aligning with ${job.title} requirements.`,
                    `Utilized modern engineering practices including CI/CD, testing, and clean architecture.`,
                    `Optimized system performance, improving responsiveness and user engagement.`
                ],
                coverLetterDraft: `Dear Hiring Manager at ${job.company?.name || "your company"},\n\nI am thrilled to submit my application for the ${job.title} position. With my background in ${candidateSkills}, I am confident in my ability to make an immediate impact on your team.`,
                atsScoreProjection: 88
            };
        }

        return res.status(200).json({
            success: true,
            tailoredData,
            jobTitle: job.title,
            companyName: job.company?.name
        });
    } catch (error) {
        console.error("Tailor Resume Error:", error);
        return res.status(500).json({ message: "Failed to generate tailored resume", success: false });
    }
};
