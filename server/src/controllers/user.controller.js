import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/User.js";

export const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user });
});

export const updateMe = asyncHandler(async (req, res) => {
  const updates = req.body;

  const user = await User.findById(req.userId);
  if (!user) throw new ApiError(404, "User not found");

  if (updates.name !== undefined) user.name = updates.name;
  if (updates.bio !== undefined) user.bio = updates.bio;
  if (updates.avatar !== undefined) user.avatar = updates.avatar;

  if (updates.artistProfile) {
    if (!user.artistProfile) user.artistProfile = { isVerified: false };
    if (updates.artistProfile.bio !== undefined) {
      user.artistProfile.bio = updates.artistProfile.bio;
    }
    if (updates.artistProfile.portfolioImages !== undefined) {
      user.artistProfile.portfolioImages = updates.artistProfile.portfolioImages;
    }
  }

  await user.save();
  res.json({ success: true, user });
});

export const getPublicProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) throw new ApiError(404, "User not found");

  if (user.role === "artist") {
    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        avatar: user.avatar,
        bio: user.bio,
        role: user.role,
        artistProfile: user.artistProfile,
        createdAt: user.createdAt,
      },
    });
    return;
  }

  res.json({
    success: true,
    user: {
      _id: user._id,
      name: user.name,
      avatar: user.avatar,
      role: user.role,
      createdAt: user.createdAt,
    },
  });
});
