import { Company } from "../models/company.model.js";
import cloudinary from "../utils/cloudinary.js";
import getDataUri from "../utils/datauri.js";


export const registercompany = async (req, res) => {
    try {
        const { companyname } = req.body;

        // Validate company name
        if (!companyname) {
            return res.status(400).json({
                message: "Company name is required",
                success: false,
            });
        }

        // Get user ID from the authenticated user
        const userId = req.user?.id; // Assuming middleware attaches `user` to `req`
        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized access. User ID not found.",
                success: false,
            });
        }

        // Check if the company already exists
        let company = await Company.findOne({ companyname });
        if (company) {
            return res.status(400).json({
                message: "This company name already exists",
                success: false,
            });
        }

        // Create a new company
        company = await Company.create({
            name: companyname,
            userId, // Use authenticated user ID
        });

        return res.status(201).json({
            message: "Company registered successfully.",
            company,
            success: true,
        });
    } catch (error) {
        console.error("Error in registerCompany:", error); // Enhanced logging
        return res.status(500).json({
            message: "Server error",
            success: false,
        });
    }
};


export const getcompany = async (req, res) => {
    try {
        // Extract userId from the authenticated user
        const userId = req.user?.id;
        if (!userId) {
            return res.status(400).json({
                message: "User ID not found. Please authenticate first.",
                success: false,
            });
        }

        // Fetch companies where the userId matches
        const companies = await Company.find({ userId });
        if (!companies || companies.length === 0) {
            return res.status(404).json({
                message: "No companies found for the user.",
                success: false,
            });
        }

        // Return the list of companies
        return res.status(200).json({
            message: "Companies fetched successfully.",
            companies,
            success: true,
        });
    } catch (error) {
        console.error("Error in getCompany:", error); // Enhanced error logging
        return res.status(500).json({
            message: "Server error occurred.",
            success: false,
        });
    }
};

import mongoose from "mongoose";

export const getcompanybyId = async (req, res) => {
    try {
        const companyId = req.params.id;

        // Validate companyId
        if (!mongoose.Types.ObjectId.isValid(companyId)) {
            return res.status(400).json({
                message: "Invalid company ID format.",
                success: false,
            });
        }

        // Fetch the company by ID
        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({
                message: "Company not found.",
                success: false,
            });
        }

        return res.status(200).json({
            message: "Company fetched successfully.",
            company,
            success: true,
        });
    } catch (error) {
        console.error("Error in getCompanyById:", error);
        return res.status(500).json({
            message: "Server error occurred.",
            success: false,
        });
    }
};


export const updateCompany = async (req, res) => {
    try {
        const { name, description, website, location } = req.body;

        // Initialize the update data
        const updateData = {};
        if (name) updateData.name = name;
        if (description) updateData.description = description;
        if (website) updateData.website = website;
        if (location) updateData.location = location;

        // Handle optional file upload
        if (req.file) {
            const fileUri = getDataUri(req.file);
            const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
            const logo = cloudResponse.secure_url;
            if (logo) updateData.logo = logo;
        }

        // Validate the company ID
        if (!req.params.id || !mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid or missing company ID.",
                success: false,
            });
        }

        // Find and update the company
        const company = await Company.findByIdAndUpdate(req.params.id, updateData, { new: true });

        if (!company) {
            return res.status(404).json({
                message: "Company not found.",
                success: false,
            });
        }

        return res.status(200).json({
            message: "Company information updated successfully.",
            company,
            success: true,
        });
    } catch (error) {
        console.error("Error in updateCompany:", error.message, error.stack);
        return res.status(500).json({
            message: "Server error. Unable to update company.",
            success: false,
        });
    }
};
