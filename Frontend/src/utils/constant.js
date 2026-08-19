export const BASE_URL = import.meta.env.VITE_API_URL || (window.location.hostname === "localhost" ? "http://localhost:8000" : "https://jobhive-m79b.onrender.com");

export const USER_API_END_POINT = `${BASE_URL}/api/v1/user`;
export const JOB_API_END_POINT = `${BASE_URL}/api/v1/job`;
export const APPLICATION_API_END_POINT = `${BASE_URL}/api/v1/application`;
export const COMPANY_API_END_POINT = `${BASE_URL}/api/v1/company`;
export const SAVEDJOB_API_END_POINT = `${BASE_URL}/api/v1/savedjobs`;
export const AI_API_END_POINT = `${BASE_URL}/api/v1/ai`;
export const NOTIFICATION_API_END_POINT = `${BASE_URL}/api/v1/notifications`;
export const MESSAGE_API_END_POINT = `${BASE_URL}/api/v1/messages`;