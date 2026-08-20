import { createSlice } from "@reduxjs/toolkit";

const jobSlice = createSlice({
    name: "job",
    initialState: {
        allJobs: [],
        allAdminJobs: [],
        singleJob: {},
        searchJobByText: "",
        allAppliedJobs: [],
        searchedQuery: "",
    },
    reducers: {
        setAllJobs: (state, action) => {
            state.allJobs = action.payload;
        },
        setSingleJob: (state, action) => {
            state.singleJob = action.payload;
        },
        setAllAdminJobs: (state, action) => {
            state.allAdminJobs = action.payload;
        },
        setSearchJobByText: (state, action) => {
            state.searchJobByText = action.payload;
        },
        setAllAppliedJobs: (state, action) => {
            state.allAppliedJobs = action.payload;
        },
        setSearchedQuery: (state, action) => {
            state.searchedQuery = action.payload;
        },
        updateAppliedJobStatus: (state, action) => {
            const { applicationId, status, timeline, interviewDetails } = action.payload;
            state.allAppliedJobs = state.allAppliedJobs.map((app) => {
                if (app._id === applicationId) {
                    return {
                        ...app,
                        status: status || app.status,
                        timeline: timeline || app.timeline,
                        interviewDetails: interviewDetails !== undefined ? interviewDetails : app.interviewDetails,
                    };
                }
                return app;
            });
        },
        // Real-time: Add new job broadcast
        addJobRealtime: (state, action) => {
            const newJob = action.payload;
            if (!newJob || !newJob._id) return;

            // Add to allJobs if open and not already in list
            if (newJob.status !== "closed") {
                const existsInAll = state.allJobs.some((j) => j._id === newJob._id);
                if (!existsInAll) {
                    state.allJobs = [newJob, ...state.allJobs];
                }
            }

            // Add to allAdminJobs if not present
            const existsInAdmin = state.allAdminJobs.some((j) => j._id === newJob._id);
            if (!existsInAdmin) {
                state.allAdminJobs = [newJob, ...state.allAdminJobs];
            }
        },
        // Real-time: Update existing job broadcast
        updateJobRealtime: (state, action) => {
            const updatedJob = action.payload;
            if (!updatedJob || !updatedJob._id) return;

            // Handle candidate allJobs list
            if (updatedJob.status === "closed") {
                // Remove closed job from candidate view
                state.allJobs = state.allJobs.filter((j) => j._id !== updatedJob._id);
            } else {
                const index = state.allJobs.findIndex((j) => j._id === updatedJob._id);
                if (index !== -1) {
                    state.allJobs[index] = { ...state.allJobs[index], ...updatedJob };
                } else {
                    state.allJobs = [updatedJob, ...state.allJobs];
                }
            }

            // Handle recruiter allAdminJobs list
            state.allAdminJobs = state.allAdminJobs.map((j) =>
                j._id === updatedJob._id ? { ...j, ...updatedJob } : j
            );

            // Handle singleJob if currently viewing this job
            if (state.singleJob?._id === updatedJob._id) {
                state.singleJob = { ...state.singleJob, ...updatedJob };
            }
        },
        // Real-time: Delete job broadcast
        deleteJobRealtime: (state, action) => {
            const { jobId } = action.payload;
            if (!jobId) return;

            state.allJobs = state.allJobs.filter((j) => j._id !== jobId);
            state.allAdminJobs = state.allAdminJobs.filter((j) => j._id !== jobId);
            if (state.singleJob?._id === jobId) {
                state.singleJob = null;
            }
        },
    }
});

export const {
    setAllJobs,
    setSingleJob,
    setAllAdminJobs,
    setSearchJobByText,
    setAllAppliedJobs,
    setSearchedQuery,
    updateAppliedJobStatus,
    addJobRealtime,
    updateJobRealtime,
    deleteJobRealtime,
} = jobSlice.actions;

export default jobSlice.reducer;