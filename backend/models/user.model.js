import mongoose from "mongoose";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
    fullname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: Number, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["student", "recruiter"], required: true },
    refreshToken: { type: String }, // Store refresh token in DB

    // Email verification
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String },   // Only the HASH of the token is saved, never the real token
    emailVerificationExpires: { type: Date },   // The link stops working after this time

    profile: {
        bio: { type: String },
        skills: [{ type: String }],
        resume: { type: String }, // URL to resume file
        resumeOriginalName: { type: String },
        company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
        profilePhoto: { type: String, default: "" }
    },
}, { timestamps: true });

// Helper method: Generate Access Token
userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        { _id: this._id, role: this.role },
        process.env.ACCESS_TOKEN_SECRET || "access_secret",
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15m" }
    );
};

// Helper method: Generate Refresh Token
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        { _id: this._id },
        process.env.REFRESH_TOKEN_SECRET || "refresh_secret",
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d" }
    );
};

export const User = mongoose.model('User', userSchema);
