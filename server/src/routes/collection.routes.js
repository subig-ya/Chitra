import { Router } from "express";
import { validate } from "../middleware/validate.js";
import { listCollectionsQuerySchema } from "../validators/collection.validators.js";
import { listCollections, getCollection } from "../controllers/collection.controller.js";

const router = Router();

router.get("/", validate(listCollectionsQuerySchema, "query"), listCollections);
router.get("/:id", getCollection);

export default router;
