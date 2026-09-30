import express from "express";
import { AdminFindJob, findJobById, getAllJobs, postJob,deleteJob } from "../controllers/job.controller.js";
import { verifyJWT, isRecruiter } from "../middlewares/auth.middleware.js";
import { getJobsByIds } from "../controllers/job.controller.js";

const router = express.Router();

// Middleware to log POST requests to /getAllJobs
// router.route("/getAllJobs").post((req, res, next) => {
//     console.log("POST request to /getAllJobs");
//     next();
// });


// Define routes for user operations
router.route("/postJob").post(verifyJWT, isRecruiter, postJob); // Corrected path
router.get("/getAllJobs", getAllJobs);       // Corrected path
router.route("/findJobById/:id").get(verifyJWT,findJobById); // Corrected path
router.route("/AdminFindJob").get(verifyJWT, isRecruiter, AdminFindJob); // Corrected path with middleware
router.route("/deleteJob/:id").delete(verifyJWT, isRecruiter, deleteJob);

router.post("/get-by-ids", getJobsByIds);
// Corrected path with middleware

export default router;
