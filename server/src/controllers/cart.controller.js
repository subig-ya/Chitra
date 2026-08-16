import { Artwork } from "../models/Artwork.js";
import { Cart } from "../models/Cart.js";
import { Order } from "../models/Order.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { env } from "../config/env.js";

function refId(ref) {
  return String(ref && ref._id ? ref._id : ref);
}

async function getOrCreateCart(userId) {
  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = await Cart.create({ userId, items: [] });
  }
  return cart;
}

const ITEM_POPULATE = {
  path: "items.artworkId",
  select: "title imageUrl price medium availability isVerified isActive artistId",
};

export const getCart = asyncHandler(async (req, res) => {
  const cart = await (await getOrCreateCart(req.userId)).populate(ITEM_POPULATE);
  res.json({ success: true, cart });
});

export const addCartItem = asyncHandler(async (req, res) => {
  const { artworkId } = req.body;

  const artwork = await Artwork.findById(artworkId);
  if (!artwork || !artwork.isActive || !artwork.isVerified) {
    throw new ApiError(404, "Artwork not found");
  }
  if (refId(artwork.artistId) === req.userId) {
    throw new ApiError(400, "You cannot add your own artwork to the cart");
  }
  if (artwork.availability !== "available") {
    throw new ApiError(409, "This artwork is no longer available");
  }

  const cart = await getOrCreateCart(req.userId);
  const existing = cart.items.find((i) => refId(i.artworkId) === artworkId);
  if (existing) {
    if (existing.quantity >= 5) {
      throw new ApiError(409, "Maximum quantity (5) reached for this item");
    }
    existing.quantity += 1;
  } else {
    cart.items.push({ artworkId, quantity: 1 });
  }
  await cart.save();
  await cart.populate(ITEM_POPULATE);

  res.json({ success: true, cart });
});

export const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const cart = await getOrCreateCart(req.userId);
  const item = cart.items.find((i) => refId(i.artworkId) === req.params.artworkId);
  if (!item) throw new ApiError(404, "Item not in cart");
  item.quantity = quantity;
  await cart.save();
  await cart.populate(ITEM_POPULATE);
  res.json({ success: true, cart });
});

export const removeCartItem = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.userId);
  cart.items = cart.items.filter(
    (i) => refId(i.artworkId) !== req.params.artworkId
  );
  await cart.save();
  await cart.populate(ITEM_POPULATE);
  res.json({ success: true, cart });
});

export const clearCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.userId);
  cart.items = [];
  await cart.save();
  res.json({ success: true, cart });
});

export const checkoutCart = asyncHandler(async (req, res) => {
  const { shippingAddress } = req.body;
  const cart = await getOrCreateCart(req.userId);
  await cart.populate(ITEM_POPULATE);

  if (cart.items.length === 0) {
    throw new ApiError(400, "Your cart is empty");
  }

  const invalid = cart.items.find((i) => {
    const a = i.artworkId;
    return (
      !a ||
      !a.isActive ||
      !a.isVerified ||
      a.availability !== "available" ||
      refId(a.artistId) === req.userId
    );
  });
  if (invalid) {
    throw new ApiError(
      409,
      `"${invalid.artworkId?.title || "An item"}" is no longer available. Please review your cart.`
    );
  }

  const fee = env.platformFeePercent;
  const orders = [];
  for (const item of cart.items) {
    const a = item.artworkId;
    const order = await Order.create({
      type: "artwork",
      artworkId: a._id,
      buyerId: req.userId,
      artistId: a.artistId,
      packageTitle: a.title,
      agreedPrice: a.price,
      platformFeePercent: fee,
      artistPayoutAmount: Math.round(a.price * (1 - fee / 100)),
      status: "awaiting_payment",
      revisionLimit: 0,
      shippingAddress,
    });
    orders.push(order);
    await Artwork.updateOne({ _id: a._id }, { availability: "reserved" });
  }

  cart.items = [];
  await cart.save();

  res.status(201).json({
    success: true,
    message: `${orders.length} order${orders.length > 1 ? "s" : ""} created. Pay to hold your artworks in escrow.`,
    orders: orders.map((o) => ({ _id: o._id, title: o.packageTitle, agreedPrice: o.agreedPrice })),
  });
});
