import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js"; // Ensure the User model is correctly imported
import dotenv from "dotenv";

dotenv.config(); // Load environment variables from .env file

export const verifyJWT = async (req, res, next) => {
    try {
        // Extract token from cookies
        const token = req.cookies?.token;

        if (!token) {
            return res.status(401).json({
                message: "User not authorized. Token missing.",
                success: false,
            });
        }

        // Verify the token using the secret key
        const decodedToken = jwt.verify(token, "123@123");

        // Find the user by ID, excluding the password field
        const user = await User.findById(decodedToken?._id).select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found.",
                success: false,
            });
        }

        // Attach the user to the request object for downstream use
        req.user = user;
        next();
    } catch (error) {
        console.error("Error verifying token:", error);

        // Differentiate between invalid token and other errors
        const errorMessage = 
            error.name === "JsonWebTokenError" ? "Invalid token." : 
            error.name === "TokenExpiredError" ? "Token expired." : 
            "Authorization error.";

        return res.status(401).json({
            message: errorMessage,
            success: false,
        });
    }
};
