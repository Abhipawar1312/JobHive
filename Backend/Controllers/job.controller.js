import mongoose from "mongoose";
import { Job } from "../models/job.model.js"

//admin
export const postJob = async (req, res) => {
    try {
        const { title, description, requirements, salary, location, jobType, experience, position, companyId } = req.body;
        // console.log(title, description, requirements, salary, location, jobType, experience, position, companyId)
        const userId = req.id;
        if (!title || !description || !requirements || !salary || !location || !jobType || !experience || !position || !companyId) {
            return res.status(400).json({
                message: "Something is Missing.",
                success: false
            });
        }
        const job = await Job.create({
            title,
            description,
            requirements: requirements.split(","),
            salary: Number(salary),
            location,
            jobType,
            experienceLevel: experience,
            position,
            company: companyId,
            created_by: userId
        });
        return res.status(201).json({
            message: "New Job Created Successfully",
            success: true,
            job
        })
    } catch (error) {
        console.log(error);
    }
}
//student
export const getAllJobs = async (req, res) => {
    try {
        const keyword = req.query.keyword || "";
        const query = {
            $or: [
                { title: { $regex: keyword, $options: "i" } },
                { description: { $regex: keyword, $options: "i" } },
            ]
        };
        const jobs = await Job.find(query).populate({
            path: "company"
        }).sort({ createdAt: -1 });
        // console.log(jobs);
        if (!jobs) {
            return res.status(404).json({
                message: "Jobs Not Found",
                success: false
            });
        };
        return res.status(200).json({
            jobs,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}

//student
export const getJobById = async (req, res) => {
    try {
        const jobId = req.params.id;
        const job = await Job.findById(jobId).populate({
            path: "applications"
        });
        if (!job) {
            return res.status(404).json({
                message: "Jobs Not Found",
                success: false
            })
        };
        return res.status(200).json({
            job,
            success: true
        })

    } catch (error) {
        console.log(error);
    }
}

export const getAdminJobById = async (req, res) => {
    try {
        const adminId = req.id; // Extract admin's ID from the request (e.g., via authentication middleware)
        const jobId = req.params.id;

        // Find the job by ID and ensure it was created by the admin
        const job = await Job.findOne({ _id: jobId, created_by: adminId }).populate({
            path: "company",
        });

        if (!job) {
            return res.status(404).json({
                message: "Job Not Found or Unauthorized Access.",
                success: false,
            });
        }

        return res.status(200).json({
            job,
            success: true,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal Server Error.",
            success: false,
        });
    }
};


//admin
export const getAdminJobs = async (req, res) => {
    try {
        const adminId = req.id;
        const jobs = await Job.find({ created_by: adminId }).populate({
            path: 'company',
            createdAt: -1
        });
        if (!jobs) {
            return res.status(404).json({
                message: "Jobs Not Found",
                success: false
            })
        }
        return res.status(200).json({
            jobs,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}

export const updateJob = async (req, res) => {
    try {
        const { title, description, requirements, salary, location, jobType, experience, position, companyId } = req.body;

        // Transform companyId to ObjectId
        const updateData = {
            title,
            description,
            requirements,
            salary,
            location,
            jobType,
            experienceLevel: experience,
            position,
            company: companyId ? new mongoose.Types.ObjectId(companyId) : undefined
        };

        // console.log(updateData);

        const job = await Job.findByIdAndUpdate(req.params.id, updateData, { new: true });

        if (!job) {
            return res.status(404).json({
                message: "Job Not Found.",
                success: false,
            });
        }

        return res.status(200).json({
            message: "Job Information Updated.",
            success: true,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error.",
            success: false,
        });
    }
};
