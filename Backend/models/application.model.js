import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    applicant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "reviewing", "shortlisted", "interview", "accepted", "rejected"],
        default: "pending"
    },
    atsScore: {
        type: Number,
        default: null
    },
    atsFeedback: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    },
    interviewDetails: {
        date: { type: Date },
        meetingUrl: { type: String },
        notes: { type: String }
    },
    recruiterNotes: { type: String },
    timeline: [
        {
            status: { type: String },
            updatedAt: { type: Date, default: Date.now },
            comment: { type: String }
        }
    ]
}, { timestamps: true });

export const Application = mongoose.model("Application", applicationSchema);