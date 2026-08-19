/**
 * Industry-Grade Algorithmic ATS Scorer
 * Performs weighted two-way matching:
 * 1. Primary Title & Core Tech Stack Match (e.g., React for "React js Developer")
 * 2. Requirements Depth & Skill Diversity
 * 3. Experience & Bio Relevance
 * 4. Resume Document Presence
 */

export const calculateAtsMatchScore = (job, applicant) => {
    if (!job || !applicant) {
        return {
            score: 50,
            label: "Medium Match",
            badgeClass: "text-amber-700 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800",
            dotColor: "bg-amber-500",
        };
    }

    const jobTitle = (job.title || "").toLowerCase();
    const jobReqs = (job.requirements || "").toLowerCase();
    const jobDesc = (job.description || "").toLowerCase();
    const jobFullText = `${jobTitle} ${jobReqs} ${jobDesc}`;

    const candidateSkills = applicant.profile?.skills || [];
    const candidateBio = (applicant.profile?.bio || "").toLowerCase();

    // 1. Identify Core Must-Have Tech Stack from Job Title
    const CORE_TECH_KEYWORDS = [
        "react", "angular", "vue", "node", "python", "java", "golang", "c#", ".net",
        "flutter", "react native", "devops", "aws", "data engineer", "ui/ux", "full stack"
    ];

    const targetCoreSkill = CORE_TECH_KEYWORDS.find(tech => jobTitle.includes(tech));

    let hasPrimaryRoleSkill = false;
    let matchedSkillsCount = 0;

    // Normalize candidate skills
    const normalizedCandidateSkills = candidateSkills.map(s => {
        if (!s) return "";
        const clean = s.toLowerCase().trim();
        return clean.replace(/\(.*?\)/g, "").replace(/\.js/g, "").trim();
    }).filter(Boolean);

    // Check if candidate matches primary role skill
    if (targetCoreSkill) {
        hasPrimaryRoleSkill = normalizedCandidateSkills.some(skill =>
            skill.includes(targetCoreSkill) || (targetCoreSkill === "react" && skill === "react")
        );
    } else {
        hasPrimaryRoleSkill = true; // No single specific framework required
    }

    // 2. Count Matching Candidate Skills
    normalizedCandidateSkills.forEach(skill => {
        let isMatch = jobFullText.includes(skill);
        if (!isMatch) {
            if (skill.includes("javascript") && (jobFullText.includes("javascript") || jobFullText.includes("js"))) isMatch = true;
            else if (skill.includes("typescript") && (jobFullText.includes("typescript") || jobFullText.includes("ts"))) isMatch = true;
            else if (skill.includes("node") && jobFullText.includes("node")) isMatch = true;
            else if (skill.includes("react") && jobFullText.includes("react")) isMatch = true;
            else if (skill.includes("html") && jobFullText.includes("html")) isMatch = true;
            else if (skill.includes("css") && jobFullText.includes("css")) isMatch = true;
        }

        if (isMatch) matchedSkillsCount++;
    });

    // 3. Compute Weighted Score Components
    let score = 25; // Base application points

    // (A) Primary Must-Have Framework Match (25 Points)
    if (hasPrimaryRoleSkill) {
        score += 25;
    } else {
        // Penalty if applying for specialized role (e.g., React job) without React listed
        score += 5;
    }

    // (B) Breadth & Requirements Coverage (Up to 30 Points)
    // Evaluated against an expected role breadth of at least 4 core skills
    const expectedSkillBreadth = Math.max(candidateSkills.length, 4);
    const breadthRatio = Math.min(matchedSkillsCount / expectedSkillBreadth, 1);
    score += Math.round(breadthRatio * 30);

    // (C) Bio & Experience Relevance (Up to 10 Points)
    if (candidateBio) {
        const titleKeywords = jobTitle.split(" ").filter(w => w.length > 2);
        let bioMatches = 0;
        titleKeywords.forEach(kw => {
            if (candidateBio.includes(kw)) bioMatches++;
        });
        if (bioMatches > 0) score += 10;
    }

    // (D) Resume Document Present (10 Points)
    if (applicant.profile?.resume) {
        score += 10;
    }

    // (E) Hard Cap if candidate lacks the primary job title technology
    if (targetCoreSkill && !hasPrimaryRoleSkill) {
        score = Math.min(score, 62); // Max 62% for non-matching primary stack
    }

    // Final Clamping
    score = Math.max(35, Math.min(score, 98));

    if (score >= 80) {
        return {
            score,
            label: "Top Match",
            badgeClass: "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800",
            dotColor: "bg-emerald-500",
        };
    } else if (score >= 60) {
        return {
            score,
            label: "Good Match",
            badgeClass: "text-amber-700 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800",
            dotColor: "bg-amber-500",
        };
    } else {
        return {
            score,
            label: "Low Match",
            badgeClass: "text-rose-700 bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800",
            dotColor: "bg-rose-500",
        };
    }
};
