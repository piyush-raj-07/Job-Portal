import { Application } from "../models/application.model.js";
import { Job } from "../models/job.model.js";
import { User } from "../models/user.model.js";
// The configured instance — utils/cloudinary.js is what calls
// cloudinary.config(). Importing "cloudinary" directly only worked here
// because user.controller.js happened to load the util first; that is an
// import-order accident, not a guarantee.
import cloudinary from "../utils/cloudinary.js";

export const applyJob = async (req, res) => {
    try {
        const jobId = req.params.id;
        const userId = req.user?.id;

        // ── Auth check ──────────────────────────────────────────────────────────
        if (!req.user || !userId) {
            return res.status(401).json({
                success: false,
                message: "Please login to apply for jobs"
            });
        }

        if (!jobId) {
            return res.status(400).json({
                success: false,
                message: "Job id is required"
            });
        }

        // ── Job check ───────────────────────────────────────────────────────────
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found"
            });
        }

        // ── Duplicate application check ─────────────────────────────────────────
        const applicationExists = await Application.findOne({ job: jobId, applicant: userId });
        if (applicationExists) {
            return res.status(400).json({
                success: false,
                message: "You have already applied for this job"
            });
        }

        // ── Extract form fields ─────────────────────────────────────────────────
        const { phoneNumber, yearsOfExperience, useExistingResume } = req.body;

        if (!phoneNumber || !yearsOfExperience) {
            return res.status(400).json({
                success: false,
                message: "Phone number and years of experience are required"
            });
        }

        // ── Resume handling ─────────────────────────────────────────────────────
        let resumeUrl = "";
        let resumeOriginalName = "";

        if (useExistingResume === "true") {
            // Use the resume already saved in the user's profile
            const user = await User.findById(userId);
            if (!user?.profile?.resume) {
                return res.status(400).json({
                    success: false,
                    message: "No existing resume found on your profile. Please upload one."
                });
            }
            resumeUrl = user.profile.resume;
            resumeOriginalName = user.profile.resumeOriginalName || "Resume";
        } else {
            // Upload the new file to Cloudinary
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: "Please upload a resume"
                });
            }

            const uploadResult = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        resource_type: "raw",   // raw = non-image files (PDF)
                        folder: "resumes",
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                stream.end(req.file.buffer);
            });

            resumeUrl = uploadResult.secure_url;
            resumeOriginalName = req.file.originalname;
        }

        // ── Create application ──────────────────────────────────────────────────
        const application = new Application({
            job: jobId,
            applicant: userId,
            phoneNumber,
            yearsOfExperience: Number(yearsOfExperience),
            resumeUrl,
            resumeOriginalName,
        });

        await application.save();

        /*
         * Link the application onto the job with a targeted $addToSet rather
         * than job.applications.push() + job.save().
         *
         * job.save() re-validates the ENTIRE job document, so any posting
         * stored before a field became required — or with a value that is no
         * longer in an enum — throws here. The application row is already
         * written at that point, so the request 500s while the applicant is
         * left orphaned: "already applied" on the next attempt, but "Not
         * Applied" on refresh, because the job's applications array never
         * received the id.
         *
         * $addToSet touches only this one field, skips whole-document
         * validation, and is idempotent.
         */
        await Job.updateOne(
            { _id: jobId },
            { $addToSet: { applications: application._id } }
        );

        return res.status(201).json({
            success: true,
            message: "Application submitted successfully"
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export const getAppliedJob = async (req, res) => {
    try {
        const userId = req.user.id;
        if (!userId) {
            return res.status(400).json({ message: "User id is required" });
        }
        const applications = await Application.find({ applicant: userId }).populate({
            path: "job",
            options: { sort: { createdAt: -1 } },
            populate: {
                path: "company",
                options: { sort: { createdAt: -1 } }
            }
        });
        if (!applications) {
            return res.status(404).json({ message: "No applications found" });
        }
        return res.status(200).json({
            applications,
            success: true,
            message: "Applications retrieved successfully"
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getApplicants = async (req, res) => {
    try {
        const jobId = req.params.id;
        if (!jobId) {
            return res.status(400).json({ message: "Job id is required" });
        }
        const job = await Job.findById(jobId).populate({
            path: "applications",
            options: { sort: { createdAt: -1 } },
            populate: {
                path: "applicant",
                select: "-password -refreshToken", // never send these to the client
                options: { sort: { createdAt: -1 } }
            }
        });
        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        // Only the recruiter who posted this job can see its applicants
        if (job.created_by.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "You can only view applicants of your own jobs", success: false });
        }

        return res.status(200).json({ job, success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const updateApplicationStatus = async (req, res) => {
    try {
        const applicationId = req.params.id;
        const { status } = req.body;

        if (!applicationId) {
            return res.status(400).json({ message: "Application id is required" });
        }
        if (!status) {
            return res.status(400).json({ message: "Status is required" });
        }

        const application = await Application.findById(applicationId);
        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }

        // Only the recruiter who posted the job can accept/reject its applications
        const job = await Job.findById(application.job);
        if (!job || job.created_by.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "You can only update applications for your own jobs", success: false });
        }

        application.status = status.toLowerCase();
        await application.save();

        return res.status(200).json({
            message: "Application status updated successfully",
            success: true,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};