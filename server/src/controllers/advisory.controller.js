import { AdvisoryRequest } from "../models/AdvisoryRequest.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createAdvisoryRequest = asyncHandler(async (req, res) => {
  const request = await AdvisoryRequest.create({
    ...req.body,
    userId: req.userId,
  });
  res.status(201).json({ success: true, request });
});

export const listAdvisoryRequests = asyncHandler(async (req, res) => {
  const requests = await AdvisoryRequest.find()
    .sort({ createdAt: -1 })
    .populate("userId", "name email role");
  res.json({ success: true, data: requests });
});

export const updateAdvisoryStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  const request = await AdvisoryRequest.findById(req.params.id);
  if (!request) {
    throw new ApiError(404, "Advisory request not found");
  }
  request.status = status;
  if (note !== undefined) request.note = note;
  await request.save();
  res.json({ success: true, request });
});
