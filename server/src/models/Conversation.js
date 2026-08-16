import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    artistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    lastMessageAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

conversationSchema.index({ buyerId: 1, artistId: 1 }, { unique: true });
conversationSchema.set("toJSON", { versionKey: false });

const conversationMessageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: { type: String, required: true, trim: true, minlength: 1, maxlength: 3000 },
    readAt: { type: Date },
  },
  { timestamps: true }
);

conversationMessageSchema.set("toJSON", { versionKey: false });

export const Conversation = mongoose.model("Conversation", conversationSchema);
export const ConversationMessage = mongoose.model(
  "ConversationMessage",
  conversationMessageSchema
);
