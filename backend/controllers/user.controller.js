import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cloudinary from "../utils/cloudinary.js";
import getDataUri from "../utils/datauri.js";
import { generateEmailVerificationToken, hashToken } from "../utils/emailToken.js";
import { sendVerificationEmail } from "../utils/sendEmail.js";

// Cookie options for Refresh Token
// In production the frontend (Vercel) and backend are on different domains,
// so the cookie must be sameSite "none" + secure or the browser won't send it.
const isProduction = process.env.NODE_ENV === "production";
const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

export const register = async (req, res) => {
    try {
        const { fullname, email, phoneNumber, password, role } = req.body;
         
        if (!fullname || !email || !phoneNumber || !password || !role) {
            return res.status(400).json({
                message: "All fields are required",
                success: false
            });
        }

        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({
                message: 'User already exists with this email.',
                success: false,
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        let profilePhotoUrl = null;

        if (req.file) {
            const fileUri = getDataUri(req.file);
            const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
            profilePhotoUrl = cloudResponse.secure_url;
        }

        // Create a verification token. The real token goes in the email,
        // only its hash is saved in the database.
        const { token, hashedToken, expiresAt } = generateEmailVerificationToken();

        const newUser = await User.create({
            fullname,
            email,
            phoneNumber,
            password: hashedPassword,
            role,
            profile: {
                profilePhoto: profilePhotoUrl,
            },
            isEmailVerified: false, // can't log in until the email link is clicked
            emailVerificationToken: hashedToken,
            emailVerificationExpires: expiresAt,
        });

        // If the email fails, the account still exists and the user can ask
        // for a new link from the verify-email page, so don't fail signup.
        let emailSent = true;
        try {
            await sendVerificationEmail(newUser, token);
        } catch (emailError) {
            console.error("Error sending verification email:", emailError);
            emailSent = false;
        }

        return res.status(201).json({
            message: emailSent
                ? "Account created! Please check your email to verify your account."
                : "Account created, but we couldn't send the verification email. Please use 'Resend verification email'.",
            success: true,
            emailSent,
            user: {
                id: newUser._id,
                fullname: newUser.fullname,
                email: newUser.email,
                role: newUser.role,
            }
        });
    } catch (error) {
        console.error('Error in register function:', error);
        return res.status(500).json({
            message: "An error occurred while creating the account.",
            success: false,
            error: error.message
        });
    }
}
export const login = async (req, res) => {
    try {
        const { email, role, password } = req.body;

        if (!email || !role || !password) {
            return res.status(400).json({
                message: "Email, role, and password are required.",
                success: false,
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                message: "User not found.",
                success: false,
            });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(400).json({
                message: "Incorrect password.",
                success: false,
            });
        }

        if (role !== user.role) {
            return res.status(400).json({
                message: "Account doesn't exist with the provided role.",
                success: false,
            });
        }

        // Unverified users get no tokens at all. This check comes after the
        // password check so strangers can't learn whether an email is verified.
        if (!user.isEmailVerified) {
            return res.status(403).json({
                message: "Please verify your email before logging in. Check your inbox for the verification link.",
                success: false,
                emailNotVerified: true, // tells the frontend to open the verify-email page
            });
        }

        // Generate Access & Refresh Tokens
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        // Save Refresh Token in Database
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        const userResponse = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            profile: user.profile,
            createdAt: user.createdAt,
        };

        return res
            .status(200)
            .cookie("refreshToken", refreshToken, cookieOptions) // Send Refresh Token as HttpOnly Cookie
            .json({
                message: `Welcome back, ${user.fullname}.`,
                accessToken, // Send Access Token in JSON response body
                user: userResponse,
                success: true,
            });
    } catch (error) {
        console.error("Error during login:", error);
        return res.status(500).json({
            message: "An internal server error occurred.",
            success: false,
        });
    }
};

// Silent Refresh Endpoint
export const refreshAccessToken = async (req, res) => {
    try {
        const incomingRefreshToken = req.cookies?.refreshToken;

        if (!incomingRefreshToken) {
            return res.status(401).json({
                message: "Refresh token missing.",
                success: false
            });
        }

        // Verify Refresh Token
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET || "refresh_secret"
        );

        const user = await User.findById(decodedToken?._id);

        if (!user || user.refreshToken !== incomingRefreshToken) {
            return res.status(401).json({
                message: "Invalid or expired refresh token.",
                success: false
            });
        }

        // Same rule as login: no new tokens for an unverified account.
        // (Only matters for sessions that started before verification existed.)
        if (!user.isEmailVerified) {
            return res
                .status(403)
                .clearCookie("refreshToken", cookieOptions)
                .json({
                    message: "Please verify your email before logging in.",
                    success: false,
                    emailNotVerified: true,
                });
        }

        // Issue new tokens (Token Rotation)
        const newAccessToken = user.generateAccessToken();
        const newRefreshToken = user.generateRefreshToken();

        user.refreshToken = newRefreshToken;
        await user.save({ validateBeforeSave: false });

        // Also send the user, so the frontend can restore the session on page
        // load without keeping the user in localStorage
        const userResponse = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            profile: user.profile,
            createdAt: user.createdAt,
        };

        return res
            .status(200)
            .cookie("refreshToken", newRefreshToken, cookieOptions)
            .json({
                message: "Token refreshed successfully.",
                accessToken: newAccessToken,
                user: userResponse,
                success: true
            });
    } catch (error) {
        console.error("Error refreshing token:", error);
        return res.status(401).json({
            message: "Invalid or expired refresh token.",
            success: false
        });
    }
};

export const logoutuser = async (req, res) => {
    try {
        // The logout route has no verifyJWT (the access token may already be
        // expired), so find the user by their refresh token cookie instead.
        const refreshToken = req.cookies?.refreshToken;
        if (refreshToken) {
            await User.findOneAndUpdate(
                { refreshToken },
                { $unset: { refreshToken: 1 } }
            );
        }

        return res
            .status(200)
            .clearCookie("refreshToken", cookieOptions)
            .json({
                message: "Logged out successfully.",
                success: true,
            });
    } catch (error) {
        console.error("Error during logout:", error);
        return res.status(500).json({
            message: "An internal server error occurred.",
            success: false,
        });
    }
};

// POST /api/v1/user/verify-email    body: { token }
export const verifyEmail = async (req, res) => {
    try {
        const { token } = req.body;

        // The typeof check stops someone sending an object like {"$ne": null}
        if (!token || typeof token !== "string") {
            return res.status(400).json({
                message: "Verification token is missing.",
                success: false,
            });
        }

        // The database only has the hash, so hash the token from the link
        // and look for a user with that hash.
        const user = await User.findOne({ emailVerificationToken: hashToken(token) });

        if (!user) {
            return res.status(400).json({
                message: "This verification link is invalid or has already been used.",
                success: false,
            });
        }

        if (!user.emailVerificationExpires || user.emailVerificationExpires < Date.now()) {
            return res.status(400).json({
                message: "This verification link has expired. Please request a new one.",
                success: false,
            });
        }

        // Activate the account and delete the token so the link can't be used again
        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
        await user.save({ validateBeforeSave: false });

        return res.status(200).json({
            message: "Email verified successfully! You can now log in.",
            success: true,
        });
    } catch (error) {
        console.error("Error verifying email:", error);
        return res.status(500).json({
            message: "An internal server error occurred.",
            success: false,
        });
    }
};

// POST /api/v1/user/resend-verification    body: { email }
export const resendVerificationEmail = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email || typeof email !== "string") {
            return res.status(400).json({
                message: "Email is required.",
                success: false,
            });
        }

        // Same answer whether or not the email is registered, so this route
        // can't be used to find out who has an account.
        const sameReply = {
            message: "If an unverified account exists for this email, a new verification link has been sent.",
            success: true,
        };

        const user = await User.findOne({ email });
        if (!user || user.isEmailVerified) {
            return res.status(200).json(sameReply);
        }

        // A new token replaces the old one, so older links stop working
        const { token, hashedToken, expiresAt } = generateEmailVerificationToken();
        user.emailVerificationToken = hashedToken;
        user.emailVerificationExpires = expiresAt;
        await user.save({ validateBeforeSave: false });

        await sendVerificationEmail(user, token);

        return res.status(200).json(sameReply);
    } catch (error) {
        console.error("Error resending verification email:", error);
        return res.status(500).json({
            message: "Could not send the verification email. Please try again later.",
            success: false,
        });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { fullname, email, phoneNumber, bio, skills } = req.body;

        // Validate required fields
        if (!fullname || !email || !phoneNumber) {
            return res.status(400).json({
                message: "Full name, email, and phone number are required.",
                success: false,
            });
        }

        // Parse skills into an array
        let skillsArray = [];
        if (skills && typeof skills === "string") {
            skillsArray = skills.split(",").map((skill) => skill.trim());
        }

        // Prepare the update object
        const updateObject = {
            fullname,
            email,
            phoneNumber,
            'profile.bio': bio,
            'profile.skills': skillsArray,
        };

        // Handle file upload if a file is present
        if (req.file) {
            try {
                const fileUri = getDataUri(req.file);
                
                // Fixed Cloudinary upload configuration for PDFs
                const cloudResponse = await cloudinary.uploader.upload(fileUri.content, {
                    resource_type: "raw",
                    public_id: `resumes/${req.user._id}_${Date.now()}`,
                    use_filename: true,
                    unique_filename: false,
                });

                updateObject['profile.resume'] = cloudResponse.secure_url;
                updateObject['profile.resumeOriginalName'] = req.file.originalname;
            } catch (uploadError) {
                console.error("File upload error:", uploadError);
                return res.status(500).json({
                    message: "Error uploading file. Please try again.",
                    success: false,
                });
            }
        }

        // Update the user's profile in the database
        const user = await User.findByIdAndUpdate(
            req.user?._id,
            { $set: updateObject },
            { new: true, runValidators: true }
        ).select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found.",
                success: false,
            });
        }

        return res.status(200).json({
            message: "Account updated successfully.",
            success: true,
            user,
        });
    } catch (error) {
        console.error("Error updating profile:", error);

        if (error.name === 'ValidationError') {
            return res.status(400).json({
                message: "Invalid input data. Please check your inputs.",
                success: false,
                errors: error.errors
            });
        }

        if (error.code === 11000) {
            return res.status(409).json({
                message: "This email is already in use.",
                success: false
            });
        }

        return res.status(500).json({
            message: "An internal server error occurred. Please try again later.",
            success: false,
        });
    }
};