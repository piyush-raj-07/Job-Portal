import express from "express";
import { verifyJWT, isRecruiter } from "../middlewares/auth.middleware.js";
import multer from "multer";
import {
    applyJob,
    getApplicants,
    getAppliedJob,
    updateApplicationStatus,
} from "../controllers/application.controller.js";

// Use memory storage so we can stream the buffer directly to Cloudinary
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype === "application/pdf") {
            cb(null, true);
        } else {
            cb(new Error("Only PDF files are allowed"), false);
        }
    },
});

/*
 * multer reports a rejected file (wrong type, over 5 MB) by calling next(err).
 * With no error handler that reaches Express's default one, which answers a
 * 500 HTML page with a stack trace — unreadable to the client and a leak.
 * This turns it into the 400 JSON the rest of the API speaks.
 */
const uploadResume = (req, res, next) =>
    upload.single("resume")(req, res, (error) => {
        if (!error) return next();

        const message =
            error.code === "LIMIT_FILE_SIZE"
                ? "Resume must be smaller than 5 MB."
                : error.message || "Could not read the uploaded file.";

        return res.status(400).json({ success: false, message });
    });

const router = express.Router();

router.route("/apply/:id").post(
    (req, res, next) => {
        console.log("POST request to /apply/:id");
        next();
    },
    verifyJWT,
    uploadResume,   // <-- multer handles the file field named "resume"
    applyJob
);

router.route("/get").get(verifyJWT, getAppliedJob);
router.route("/applicants/:id").get(verifyJWT, isRecruiter, getApplicants);
router.route("/status/:id/update").post(verifyJWT, isRecruiter, updateApplicationStatus);

export default router;