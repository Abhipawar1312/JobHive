// store.js
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import authSlice from "./authSlice";
import jobSlice from "./jobSlice";
import companySlice from "./CompanySlice";
import applicationSlice from "./applicationSlice";
import savedJobSlice from "./savedJobSlice";
import {
    persistStore,
    persistReducer,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";

// Bump the version number to force Redux Persist to discard old state
const persistConfig = {
    key: "root",
    version: 2, // Changed from 1 to 2 to invalidate the persisted state
    storage,
    blacklist: ["savedJob"], // Do not persist savedJob state
};

const rootReducer = combineReducers({
    auth: authSlice,
    job: jobSlice,
    company: companySlice,
    application: applicationSlice,
    savedJobs: savedJobSlice,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // These actions are safe to ignore for serializability
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
});

// Create a persistor linked to the store
export const persistor = persistStore(store);

export default store;
