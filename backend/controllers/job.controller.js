import { Job } from "../models/job.model.js";

export const postJob = async(req,res)=>{
    try {

        const { title, description, requirements, salary, location, jobType, experience, position, companyId} = req.body;

        const userId = req.user?.id;

        if (!userId) {
            return res.status(400).json({ message: 'User ID (created_by) is required.' });
        }

        if (!title || !description || !requirements || !salary || !location || !jobType || !experience || !position || !companyId) {
            return res.status(400).json({
                message: "Something is missing.",
                success: false
            })
        };

        const job = await Job.create({
            title,
            description,
            requirements: Array.isArray(requirements) 
                ? requirements 
                : requirements.split(",").map((req) => req.trim()),
            salary: Number(salary),
            location,
            jobType,
            experienceLevel: Number(experience),
            position: Number(position),
            company: companyId,
            created_by: userId
        });
        
        return res.status(201).json({
            message: "New job created successfully.",
            job,
            success: true
        });



        
    } catch (error) {
        console.log(error);
        return res.status(500).json({

            "Error": "server error occured",
             success: false
        })
    }
}



export const getAllJobs = async (req, res) => {
    try {
        const keyword = (req.query.keyword || "").trim(); // Trim keyword to handle extra spaces
        const query = {
            $or: [
                { title: { $regex: keyword, $options: "i" } }, // Case-insensitive title search
                { description: { $regex: keyword, $options: "i" } } // Case-insensitive description search
            ],
        };

        // Find jobs matching the query and populate company data
        const jobs = await Job.find(query)
            .populate("company")
            .sort({ createdAt: -1 });

        // Check if jobs array is empty
        if (jobs.length === 0) {
            return res.status(404).json({
                message: "No jobs found matching the criteria.",
                success: false,
            });
        }

        return res.status(200).json({
            message: "Jobs fetched successfully.",
            jobs,
            count: jobs.length, // Number of jobs found
            success: true,
        });
    } catch (error) {
        console.error("Error in getAllJobs:", error);
        return res.status(500).json({
            message: "Server error occurred while fetching jobs.",
            success: false,
        });
    }
};

export const findJobById = async (req, res) => {
    try {
        const jobId = req.params.id;
        const job = await Job.findById(jobId).populate({
            path:"applications"
        });
        if (!job) {
            return res.status(404).json({
                message: "Job not found.",
                success: false,
            });
        }
        return res.status(200).json({
            message: "Job found successfully.",
            job,
            success: true,
        });
    } catch (error) {
        console.error("Error in findJobById:", error);
        return res.status(500).json({
            message: "Server error occurred while fetching the job.",
            success: false,
        });
    }
};

export const AdminFindJob = async (req, res) => {
    try {
        const adminId = req.user?.id;
        const jobs = await Job.find({ created_by: adminId }).populate({
            path: 'company',
            createdAt: -1
        });
        if (!jobs || jobs.length === 0) {
            return res.status(404).json({
                message: "Jobs not found.",
                success: false,
            });
        }
        return res.status(200).json({
            message: "Jobs found successfully.",
            jobs,
            success: true,
        });
    } catch (error) {
        console.error("Error in AdminFindJob:", error);
        return res.status(500).json({
            message: "Server error occurred while fetching jobs.",
            success: false,
        });
    }
};

