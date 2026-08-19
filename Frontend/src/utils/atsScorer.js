/**
 * Gemini AI ATS Score Formatter Utility
 * Formats score numbers and styling for table and badge rendering.
 */

export const formatAtsScore = (score) => {
    const numScore = typeof score === "number" ? Math.round(score) : 0;

    if (numScore >= 80) {
        return {
            score: numScore,
            label: "Top Match",
            badgeClass: "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800",
            dotColor: "bg-emerald-500",
            isGeminiAi: true,
        };
    } else if (numScore >= 60) {
        return {
            score: numScore,
            label: "Good Match",
            badgeClass: "text-amber-700 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800",
            dotColor: "bg-amber-500",
            isGeminiAi: true,
        };
    } else if (numScore > 0) {
        return {
            score: numScore,
            label: "Low Match",
            badgeClass: "text-rose-700 bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800",
            dotColor: "bg-rose-500",
            isGeminiAi: true,
        };
    } else {
        return {
            score: null,
            label: "Unscanned",
            badgeClass: "text-gray-500 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700",
            dotColor: "bg-gray-400",
            isGeminiAi: false,
        };
    }
};

export const calculateAtsMatchScore = (job, applicant) => {
    // Return unscanned state to encourage running Gemini AI scan
    return formatAtsScore(null);
};
