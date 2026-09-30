import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    createResume,
    getResumes,
    getResumeById,
    updateResume,
    deleteResume,
    generateSummary,
    improveProjectDescription,
    reviewResume,
    atsMatch,
    duplicateResume,
    setMasterResume,
} from "../controllers/resume.controller.js";

const router = express.Router();

// AI routes are declared before "/:id" so the literal path always wins.
router.route("/ai/summary").post(verifyJWT, generateSummary);
router.route("/ai/project-description").post(verifyJWT, improveProjectDescription);
router.route("/ai/review").post(verifyJWT, reviewResume);
router.route("/ai/ats").post(verifyJWT, atsMatch);

// Versioning
router.route("/:id/duplicate").post(verifyJWT, duplicateResume);
router.route("/:id/master").patch(verifyJWT, setMasterResume);

// Every resume route requires a logged-in user — there is no public resume data.
router.route("/").post(verifyJWT, createResume);
router.route("/").get(verifyJWT, getResumes);
router.route("/:id").get(verifyJWT, getResumeById);
router.route("/:id").put(verifyJWT, updateResume);
router.route("/:id").delete(verifyJWT, deleteResume);

export default router;
