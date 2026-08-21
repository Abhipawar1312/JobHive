import axios from "axios";
import { USER_API_END_POINT } from "./constant";

// Create Centralized Axios Client
const apiClient = axios.create({
    withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Response Interceptor for Seamless Dual-Token Auto-Refresh
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If request failed with 401 and is not already retried or a refresh/login call
        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url?.includes("/login") &&
            !originalRequest.url?.includes("/refresh-token") &&
            !originalRequest.url?.includes("/register")
        ) {
            if (isRefreshing) {
                // Queue requests while token refresh is in flight
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(() => apiClient(originalRequest))
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshRes = await axios.post(
                    `${USER_API_END_POINT}/refresh-token`,
                    {},
                    { withCredentials: true }
                );

                if (refreshRes.data?.success) {
                    processQueue(null, refreshRes.data.accessToken);
                    return apiClient(originalRequest);
                }
            } catch (refreshErr) {
                processQueue(refreshErr, null);
                return Promise.reject(refreshErr);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;
