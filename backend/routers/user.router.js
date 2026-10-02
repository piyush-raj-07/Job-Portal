import express from "express";
import { login, logoutuser, refreshAccessToken, register, updateProfile, verifyEmail, resendVerificationEmail } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { singleUpload } from "../middlewares/multer.js";
import { resendVerificationLimiter } from "../middlewares/rateLimiter.js";

const router = express.Router();

// Middleware to log POST requests to /register


// Define routes for user operations
router.route("/register").post(singleUpload,register); // Register user
router.route("/login").post(login);       // Login user
router.route("/logout").post(logoutuser); // Logout user
router.route("/refresh-token").post(refreshAccessToken); // Get new access token using refresh token cookie
router.route("/verify-email").post(verifyEmail); // Activate account with the token from the email link
router.route("/resend-verification").post(resendVerificationLimiter, resendVerificationEmail); // Send a new link (max 3 per 15 min)
router.route("/profile/update").post(verifyJWT,singleUpload, updateProfile); // Update user profile

export default router;
