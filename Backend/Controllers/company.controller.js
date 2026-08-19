import { Company } from "../models/company.model.js";
import cloudinary from "../utils/cloudinary.js";
import getDataUri from "../utils/datauri.js";

export const registerCompany = async (req, res) => {
    try {
        const { companyName } = req.body;
        if (!companyName) {
            return res.status(400).json({
                message: "Company name is required.",
                success: false
            });
        }
        
        let company = await Company.findOne({ name: companyName });
        if (company) {
            return res.status(400).json({
                message: "A company with this name already exists.",
                success: false
            });
        }

        company = await Company.create({
            name: companyName,
            userId: req.id
        });

        return res.status(201).json({
            message: "Company registered successfully.",
            company,
            success: true
        });
    } catch (error) {
        console.error("Register Company Error:", error);
        return res.status(500).json({
            message: error.message || "Failed to register company",
            success: false
        });
    }
};

export const getCompany = async (req, res) => {
    try {
        const userId = req.id;
        const companies = await Company.find({ userId });
        return res.status(200).json({
            companies: companies || [],
            success: true
        });
    } catch (error) {
        console.error("Get Companies Error:", error);
        return res.status(500).json({
            message: "Failed to fetch companies",
            success: false
        });
    }
};

export const getCompanyById = async (req, res) => {
    try {
        const companyId = req.params.id;
        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({
                message: "Company Not Found.",
                success: false
            });
        }
        return res.status(200).json({
            company,
            success: true
        });
    } catch (error) {
        console.error("Get Company By ID Error:", error);
        return res.status(500).json({
            message: "Failed to fetch company",
            success: false
        });
    }
};

export const updateCompany = async (req, res) => {
    try {
        const { name, description, website, location } = req.body;
        const file = req.file;

        let logo;
        if (file) {
            try {
                const fileuri = getDataUri(file);
                const cloudResponse = await cloudinary.uploader.upload(fileuri.content);
                logo = cloudResponse.secure_url;
            } catch (err) {
                console.error("Company logo upload failed:", err);
            }
        }

        const updateData = {};
        if (name) updateData.name = name;
        if (description) updateData.description = description;
        if (website) updateData.website = website;
        if (location) updateData.location = location;
        if (logo) updateData.logo = logo;

        const company = await Company.findOneAndUpdate(
            { _id: req.params.id, userId: req.id },
            updateData,
            { new: true }
        );

        if (!company) {
            return res.status(404).json({
                message: "Company Not Found or Unauthorized.",
                success: false
            });
        }

        return res.status(200).json({
            message: "Company Information Updated.",
            company,
            success: true
        });
    } catch (error) {
        console.error("Update Company Error:", error);
        return res.status(500).json({
            message: error.message || "Internal Server Error.",
            success: false
        });
    }
};