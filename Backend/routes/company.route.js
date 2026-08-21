import express from "express";
import { isAuthenticated, isRecruiter } from "../middlewares/isAuthenticated.js";
import validate from "../middlewares/validate.js";
import { getCompany, getCompanyById, registerCompany, updateCompany } from "../Controllers/company.controller.js";
import { singleUpload } from "../middlewares/multer.js";
import { registerCompanySchema, updateCompanySchema } from "../validators/company.validator.js";

const router = express.Router();

router.route("/register").post(isAuthenticated, isRecruiter, validate(registerCompanySchema), registerCompany);
router.route("/get").get(isAuthenticated, isRecruiter, getCompany);
router.route("/get/:id").get(isAuthenticated, getCompanyById);
router.route("/update/:id").put(isAuthenticated, isRecruiter, singleUpload, validate(updateCompanySchema), updateCompany);

export default router;