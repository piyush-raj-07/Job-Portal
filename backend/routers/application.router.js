import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";


import { applyJob, getApplicants, getAppliedJob, updateApplicationStatus, } from "../controllers/application.controller.js";

// give middleware to the routes for /apply/:id and console log the this route is hitted


 
const router = express.Router();
router.route("/apply/:id").post((req, res, next) => {
    console.log("POST request to /apply/:id");
    next();
});

router.route("/apply/:id").post(verifyJWT, applyJob);
router.route("/get").get(verifyJWT, getAppliedJob);
router.route("/applicants/:id").get(verifyJWT, getApplicants);
router.route("/status/:id/update").post(verifyJWT, updateApplicationStatus);
 

export default router;
