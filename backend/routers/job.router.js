import express from "express";
import { AdminFindJob, findJobById, getAllJobs, postJob } from "../controllers/job.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Middleware to log POST requests to /getAllJobs
// router.route("/getAllJobs").post((req, res, next) => {
//     console.log("POST request to /getAllJobs");
//     next();
// });


// Define routes for user operations
router.route("/postJob").post(verifyJWT,postJob); // Corrected path
router.route("/getAllJobs").get(verifyJWT,getAllJobs);       // Corrected path
router.route("/findJobById/:id").get(verifyJWT,findJobById); // Corrected path
router.route("/AdminFindJob").get(verifyJWT, AdminFindJob); // Corrected path with middleware

export default router;
