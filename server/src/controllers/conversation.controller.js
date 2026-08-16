import {
  Conversation,
  ConversationMessage,
} from "../models/Conversation.js";
import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

function refId(ref) {
  return String(ref && ref._id ? ref._id : ref);
}

export const listConversations = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({
    $or: [{ buyerId: req.userId }, { artistId: req.userId }],
  })
    .sort({ lastMessageAt: -1 })
    .populate("buyerId", "name avatar role")
    .populate("artistId", "name avatar role");

  const data = await Promise.all(
    conversations.map(async (c) => {
      const last = await ConversationMessage.findOne({
        conversationId: c._id,
      }).sort({ createdAt: -1 });
      const unread = await ConversationMessage.countDocuments({
        conversationId: c._id,
        senderId: { $ne: req.userId },
        readAt: null,
      });
      return {
        _id: c._id,
        buyer: c.buyerId,
        artist: c.artistId,
        lastMessage: last?.content || "",
        lastMessageAt: c.lastMessageAt,
        unread,
        other: refId(c.buyerId) === req.userId ? c.artistId : c.buyerId,
      };
    })
  );

  res.json({ success: true, data });
});

export const startConversation = asyncHandler(async (req, res) => {
  const { artistId } = req.body;

  const artist = await User.findById(artistId);
  if (!artist || artist.role !== "artist") {
    throw new ApiError(400, "Artist not found");
  }
  if (refId(artist._id) === req.userId) {
    throw new ApiError(400, "You cannot message yourself");
  }

  const existing = await Conversation.findOne({ buyerId: req.userId, artistId });
  if (existing) {
    return res.json({ success: true, conversation: existing });
  }

  const conversation = await Conversation.create({
    buyerId: req.userId,
    artistId,
  });
  res.status(201).json({ success: true, conversation });
});

async function assertParticipant(conversation, req) {
  const isAdmin = req.userRole === "admin";
  const isBuyer = refId(conversation.buyerId) === req.userId;
  const isArtist = refId(conversation.artistId) === req.userId;
  if (!isAdmin && !isBuyer && !isArtist) {
    throw new ApiError(403, "You are not a participant in this conversation");
  }
}

export const getConversationMessages = asyncHandler(async (req, res) => {
  const conversation = await Conversation.findById(req.params.id);
  if (!conversation) throw new ApiError(404, "Conversation not found");
  await assertParticipant(conversation, req);

  const messages = await ConversationMessage.find({
    conversationId: conversation._id,
  }).sort({ createdAt: 1 });

  await ConversationMessage.updateMany(
    {
      conversationId: conversation._id,
      senderId: { $ne: req.userId },
      readAt: null,
    },
    { $set: { readAt: new Date() } }
  );

  res.json({ success: true, messages });
});

export const sendConversationMessage = asyncHandler(async (req, res) => {
  const conversation = await Conversation.findById(req.params.id);
  if (!conversation) throw new ApiError(404, "Conversation not found");
  await assertParticipant(conversation, req);

  const message = await ConversationMessage.create({
    conversationId: conversation._id,
    senderId: req.userId,
    content: req.body.content,
  });

  conversation.lastMessageAt = new Date();
  await conversation.save();

  res.status(201).json({ success: true, message });
});
