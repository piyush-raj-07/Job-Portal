import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = async (req, res, next) => {
    try {
        // Get access token from Authorization header or cookie
        const authHeader = req.headers.authorization;
        const token = authHeader?.startsWith("Bearer ")
            ? authHeader.split(" ")[1]
            : req.cookies?.accessToken;

        if (!token) {
            return res.status(401).json({
                message: "Unauthorized request. Token missing.",
                success: false,
            });
        }

        // Verify Access Token
        const decodedToken = jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET || "access_secret"
        );

        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

        if (!user) {
            return res.status(401).json({
                message: "Invalid access token.",
                success: false,
            });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("Error verifying token:", error);

        const errorMessage =
            error.name === "TokenExpiredError" ? "Access token expired." : "Invalid access token.";

        return res.status(401).json({
            message: errorMessage,
            success: false,
        });
    }
};

// Use after verifyJWT. Only recruiters can go past this point.
export const isRecruiter = (req, res, next) => {
    if (req.user?.role !== "recruiter") {
        return res.status(403).json({
            message: "Only recruiters can do this.",
            success: false,
        });
    }
    next();
};
