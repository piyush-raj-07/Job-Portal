import express from "express";
import { getcompany, getcompanybyId, registercompany } from "../controllers/company.controller.js";
import { verifyJWT, isRecruiter } from "../middlewares/auth.middleware.js";
import { updateCompany } from "../controllers/company.controller.js";
import { singleUpload } from "../middlewares/multer.js";

const router = express.Router();

// Define routes for user operations
router.route("/registercompany").post(verifyJWT, isRecruiter, registercompany); // Corrected path
router.route("/getcompany").get(verifyJWT, isRecruiter, getcompany);       // Corrected path
router.route("/getcompanybyid/:id").get(verifyJWT, isRecruiter, getcompanybyId); // Corrected path
router.route("/update/:id").post(verifyJWT, isRecruiter, singleUpload, updateCompany); // Corrected path with middleware

export default router;
