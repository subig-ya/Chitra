import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
  refreshTokenExpiry,
} from "../utils/jwt.js";
import { env } from "../config/env.js";

const REFRESH_COOKIE = "chitra_refresh";

function setRefreshCookie(res, token) {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.isProd,
    maxAge: refreshTokenExpiry().getTime() - Date.now(),
    path: "/api/auth",
  });
}

async function issueTokens(res, user) {
  const accessToken = signAccessToken(user._id.toString(), user.role);
  const refreshToken = signRefreshToken(user._id.toString());

  user.refreshTokens ??= [];
  user.refreshTokens = user.refreshTokens.filter(
    (t) => t.expiresAt > new Date()
  );
  user.refreshTokens.push({
    tokenHash: hashToken(refreshToken),
    expiresAt: refreshTokenExpiry(),
  });
  await user.save();

  setRefreshCookie(res, refreshToken);
  return { accessToken, refreshToken };
}

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    throw new ApiError(409, "An account with this email already exists");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email,
    passwordHash,
    role: role ?? "buyer",
    ...(role === "artist" ? { artistProfile: { isVerified: false } } : {}),
  });

  const { accessToken, refreshToken } = await issueTokens(res, user);
  res.status(201).json({
    success: true,
    message: "Account created",
    user,
    tokens: { accessToken, refreshToken },
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+passwordHash +refreshTokens");
  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new ApiError(401, "Invalid email or password");
  }

  const { accessToken, refreshToken } = await issueTokens(res, user);
  res.json({
    success: true,
    message: "Logged in",
    user,
    tokens: { accessToken, refreshToken },
  });
});

export const refresh = asyncHandler(async (req, res) => {
  const supplied =
    req.body.refreshToken || req.cookies?.[REFRESH_COOKIE] || null;

  if (!supplied) {
    throw new ApiError(401, "Refresh token missing");
  }

  let payload;
  try {
    payload = verifyRefreshToken(supplied);
  } catch {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const user = await User.findById(payload.sub).select("+refreshTokens");
  if (!user) {
    throw new ApiError(401, "Account no longer exists");
  }

  const stored = user.refreshTokens.find(
    (t) => t.tokenHash === hashToken(supplied)
  );
  if (!stored || stored.expiresAt < new Date()) {
    throw new ApiError(401, "Refresh token revoked or expired");
  }

  user.refreshTokens = user.refreshTokens.filter((t) => t !== stored);
  const { accessToken, refreshToken } = await issueTokens(res, user);

  res.json({
    success: true,
    tokens: { accessToken, refreshToken },
  });
});

export const logout = asyncHandler(async (req, res) => {
  const supplied =
    req.body.refreshToken || req.cookies?.[REFRESH_COOKIE] || null;

  if (supplied) {
    await User.updateOne(
      { "refreshTokens.tokenHash": hashToken(supplied) },
      { $pull: { refreshTokens: { tokenHash: hashToken(supplied) } } }
    );
  }

  res.clearCookie(REFRESH_COOKIE, { path: "/api/auth" });
  res.json({ success: true, message: "Logged out" });
});
