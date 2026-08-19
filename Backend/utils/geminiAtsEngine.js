import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const getGeminiModel = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;
    const genAI = new GoogleGenerativeAI(apiKey);
    return genAI.getGenerativeModel({ model: "gemini-3.5-flash-lite" });
};

/**
 * 100% Real Google Gemini AI ATS Evaluator
 * Reads the actual candidate PDF resume file and compares it deeply with the Job Description.
 */
export const evaluateResumeWithGemini = async (user, job) => {
    try {
        if (!user || !job) return null;

        const candidateSkills = user.profile?.skills || [];
        const candidateBio = user.profile?.bio || "";
        const resumeUrl = user.profile?.resume || "";
        const jobReqs = job.requirements || "";
        const jobTitle = job.title || "Job Position";
        const jobDesc = job.description || "";
        const companyName = job.company?.name || "Company";

        // Fetch candidate's uploaded resume PDF
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
        if (!model) {
            console.warn("Gemini API Key missing, unable to run AI ATS evaluation.");
            return null;
        }

        const prompt = `
You are an advanced Applicant Tracking System (ATS) and Senior Technical Recruiter.
Analyze this candidate's resume and qualifications against the target job posting.

TARGET JOB POSTING:
- Title: ${jobTitle}
- Company: ${companyName}
- Requirements: ${jobReqs}
- Description: ${jobDesc}

Perform a rigorous, fair ATS evaluation:
1. matchPercentage: Integer between 0 and 100 representing true technical, experience, and domain alignment.
2. summary: A 2-sentence executive summary highlighting the candidate's core strengths and any critical gaps.
3. matchingSkills: Array of specific skills/technologies explicitly verified in the candidate's resume that match job requirements.
4. missingSkills: Array of required skills/technologies from the job description missing from the candidate's resume.
5. recommendations: Array of 2-3 actionable points for the candidate.

Respond with ONLY valid JSON with no markdown code fences:
{
  "matchPercentage": 78,
  "summary": "...",
  "matchingSkills": ["..."],
  "missingSkills": ["..."],
  "recommendations": ["..."]
}
`;

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

        const finalScore = parsed.matchPercentage ?? parsed.atsScore ?? 70;

        return {
            matchPercentage: Math.max(10, Math.min(finalScore, 100)),
            summary: parsed.summary || `Candidate shows relevant match for ${jobTitle} role.`,
            matchingSkills: parsed.matchingSkills || parsed.matchedSkills || candidateSkills,
            missingSkills: parsed.missingSkills || [],
            recommendations: parsed.recommendations || [],
            isResumeScanned
        };
    } catch (error) {
        console.error("Gemini ATS Evaluation Error:", error.message);
        return null;
    }
};
