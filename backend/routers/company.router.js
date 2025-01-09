import express from "express";
import { getcompany, getcompanybyId, registercompany } from "../controllers/company.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { updateCompany } from "../controllers/company.controller.js";
import { singleUpload } from "../middlewares/multer.js";

const router = express.Router();

// Define routes for user operations
router.route("/registercompany").post(verifyJWT,registercompany); // Corrected path
router.route("/getcompany").get(verifyJWT,getcompany);       // Corrected path
router.route("/getcompanybyid/:id").get(verifyJWT,getcompanybyId); // Corrected path
router.route("/update/:id").post(verifyJWT, singleUpload, updateCompany); // Corrected path with middleware

export default router;
