import { Report } from "../models/Report.js";
import { Order } from "../models/Order.js";
import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { notify, notifyAdmins } from "../services/notify.js";

function refId(ref) {
  return String(ref && ref._id ? ref._id : ref);
}

export const createReport = asyncHandler(async (req, res) => {
  const { reportedUserId, orderId, category, description } = req.body;

  if (reportedUserId === req.userId) {
    throw new ApiError(400, "You cannot report yourself");
  }

  const reported = await User.findById(reportedUserId);
  if (!reported) throw new ApiError(404, "Reported user not found");

  if (orderId) {
    const order = await Order.findById(orderId);
    if (!order) throw new ApiError(404, "Order not found");
    const isRelated =
      refId(order.buyerId) === req.userId || refId(order.artistId) === req.userId;
    if (!isRelated) {
      throw new ApiError(403, "You are not a participant on this order");
    }
    if (
      refId(order.buyerId) !== reportedUserId &&
      refId(order.artistId) !== reportedUserId
    ) {
      throw new ApiError(400, "The reported user is not on this order");
    }
  }

  const report = await Report.create({
    reporterId: req.userId,
    reportedUserId,
    orderId,
    category,
    description,
    status: "new",
  });

  const reportedName = reported.name || "a user";
  await notifyAdmins({
    type: "report",
    title: `New report about ${reportedName}`,
    message: `${reportedName} was reported for "${category}". Review it in the admin panel.`,
    refId: report._id,
    refModel: "Report",
  });

  res.status(201).json({ success: true, report });
});

export const listMyReports = asyncHandler(async (req, res) => {
  const reports = await Report.find({ reporterId: req.userId })
    .sort({ createdAt: -1 })
    .populate("reportedUserId", "name email")
    .populate("orderId", "packageTitle agreedPrice");
  res.json({ success: true, data: reports });
});

/* ---------- admin ---------- */

export const listAllReports = asyncHandler(async (req, res) => {
  const { status, page, limit } = req.validatedQuery;
  const filter = status ? { status } : {};

  const [data, total] = await Promise.all([
    Report.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("reporterId", "name email role")
      .populate("reportedUserId", "name email role")
      .populate("orderId", "packageTitle agreedPrice status")
      .lean(),
    Report.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

export const updateReportStatus = asyncHandler(async (req, res) => {
  const { status, resolutionNote } = req.body;
  const report = await Report.findById(req.params.id);
  if (!report) throw new ApiError(404, "Report not found");

  report.status = status;
  if (resolutionNote !== undefined) report.resolutionNote = resolutionNote;
  if (status === "resolved") {
    report.resolvedBy = req.userId;
    report.resolvedAt = new Date();
  }
  await report.save();

  const reporter = await User.findById(report.reporterId).select("name");
  await notify(report.reporterId, {
    type: "report",
    title: "Your report was reviewed",
    message: `Report about your customer was marked "${status}" by the Chitra team.`,
    refId: report._id,
    refModel: "Report",
  });

  res.json({ success: true, report });
});
