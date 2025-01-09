import { Application } from "../models/application.model.js";
import { Job } from "../models/job.model.js";

export const applyJob = async (req, res) => {
    try {
        const  jobId  = req.params.id;
        const  userId = req.user.id;
        if (!jobId) {
            return res.status(400).json({ message: "Job id is required" });
        }
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        if (!userId) {
            return res.status(400).json({ message: "User id is required" });
        }

        const applicationExists = await Application.findOne({ job: jobId, applicant: userId });
        if (applicationExists) {
            return res.status(400).json({ message: "You have already applied for this job" });
        }

        const application = new Application({
            job: jobId,
            applicant: userId
        });
        await application.save();
        job.applications.push(application._id);
        await job.save();
        return res.status(201).json({ message: "Application submitted successfully" });



    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const getAppliedJob = async (req, res) => {
    try {
        const  userId  = req.user.id;
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
            "message": "Applications retrieved successfully"
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}


export const getApplicants = async (req, res) => {
    try {
        const  jobId  = req.params.id;
        if (!jobId) {
            return res.status(400).json({ message: "Job id is required" });
        }
        const job = await Job.findById(jobId).populate({
            path: "applications",
            options: { sort: { createdAt: -1 } },
            populate: {
                path: "applicant",
                options: { sort: { createdAt: -1 } }
            }
        });
        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }
        return res.status(200).json({ job, success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

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
        application.status = status.toLowerCase();
        // application.status = status;
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


