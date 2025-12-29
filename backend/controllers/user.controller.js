import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cloudinary from "../utils/cloudinary.js";
import getDataUri from "../utils/datauri.js";

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

        const newUser = await User.create({
            fullname,
            email,
            phoneNumber,
            password: hashedPassword,
            role,
            profile: {
                profilePhoto: profilePhotoUrl,
            }
        });

        return res.status(201).json({
            message: "Account created successfully.",
            success: true,
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

        let user = await User.findOne({ email });
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

        const tokenData = { _id: user._id };
        const token = jwt.sign(tokenData, "123@123", { expiresIn: "2d" });

        user = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            profile: user.profile,
        };

        return res
            .status(200)
            .cookie("token", token, { maxAge: 24 * 60 * 60 * 1000, httpOnly: true,secure : true , sameSite: "none" })
            .json({
                message: `Welcome back, ${user.fullname}.`,
                user,
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



export const logoutuser = async (req, res) => {
    try {
        return res.status(200).cookie("token", "", { maxAge: 0, httpOnly: true }).json({
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