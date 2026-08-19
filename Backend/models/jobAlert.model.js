import mongoose from "mongoose";

const jobAlertSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    keywords: {
        type: [String],
        default: []
    },
    location: {
        type: String,
        default: ""
    },
    frequency: {
        type: String,
        enum: ["daily", "weekly"],
        default: "weekly"
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

export const JobAlert = mongoose.model("JobAlert", jobAlertSchema);
