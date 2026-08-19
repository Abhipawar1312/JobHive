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
    }
});
export const { setAllJobs, setSingleJob, setAllAdminJobs, setSearchJobByText, setAllAppliedJobs, setSearchedQuery, updateAppliedJobStatus } = jobSlice.actions;
export default jobSlice.reducer;