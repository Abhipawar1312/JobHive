import { createSlice } from "@reduxjs/toolkit";

const savedJobSlice = createSlice({
    name: "savedJobs",
    initialState: {
        allSavedJobs: []
    },
    reducers: {
        setAllSavedJobs: (state, action) => {
            state.allSavedJobs = action.payload;
        },
        addSavedJob: (state, action) => {
            // action.payload should be an object like { job: { ... } }
            state.allSavedJobs.push(action.payload);
        },
        removeSavedJob: (state, action) => {
            // action.payload is the job ID
            state.allSavedJobs = state.allSavedJobs.filter(
                (savedJob) => savedJob.job._id !== action.payload
            );
        },
        clearSavedJobs: (state) => {
            state.allSavedJobs = [];
        },
    }
});
export const { setAllSavedJobs, addSavedJob, removeSavedJob, clearSavedJobs } = savedJobSlice.actions;
export default savedJobSlice.reducer;