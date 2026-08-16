import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { createReportSchema } from "../validators/report.validators.js";
import { createReport, listMyReports } from "../controllers/report.controller.js";

const router = Router();

router.get("/mine", authenticate, listMyReports);
router.post("/", authenticate, validate(createReportSchema), createReport);

export default router;
