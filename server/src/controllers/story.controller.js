import { Story } from "../models/Story.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listStories = asyncHandler(async (req, res) => {
  const stories = await Story.find({ isPublished: true }).sort({ createdAt: -1 });
  res.json({ success: true, data: stories });
});

export const getStory = asyncHandler(async (req, res) => {
  const story = await Story.findOne({
    $or: [{ _id: req.params.id }, { slug: req.params.id }],
    isPublished: true,
  });
  if (!story) throw new ApiError(404, "Story not found");
  res.json({ success: true, story });
});
