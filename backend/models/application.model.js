import mongoose from "mongoose";

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
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    },
    // --- New fields added for application form ---
    phoneNumber: {
        type: String,
        required: true
    },
    yearsOfExperience: {
        type: Number,
        required: true
    },
    resumeUrl: {
        type: String,   // Cloudinary URL
        required: true
    },
    resumeOriginalName: {
        type: String,
        required: true
    }
}, { timestamps: true });

export const Application = mongoose.model("Application", applicationSchema);