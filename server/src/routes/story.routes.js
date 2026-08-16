import { Router } from "express";
import { listStories, getStory } from "../controllers/story.controller.js";

const router = Router();

router.get("/", listStories);
router.get("/:id", getStory);

export default router;
