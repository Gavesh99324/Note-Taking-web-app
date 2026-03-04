import jwt from "jsonwebtoken";
import { config } from "../config";
import { RefreshToken } from "../models/RefreshToken";
import mongoose from "mongoose";

interface TokenPayload {
  userId: string;
}

export const generateAccessToken = (
  userId: mongoose.Types.ObjectId,
): string => {
  return jwt.sign({ userId: userId.toString() }, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpire,
  } as jwt.SignOptions);
};

export const generateRefreshToken = async (
  userId: mongoose.Types.ObjectId,
): Promise<string> => {
  const token = jwt.sign(
    { userId: userId.toString() },
    config.jwt.refreshSecret,
    {
      expiresIn: config.jwt.refreshExpire,
    } as jwt.SignOptions,
  );

  // Calculate expiration date
  const decoded = jwt.decode(token) as { exp: number };
  const expiresAt = new Date(decoded.exp * 1000);

  // Store refresh token in database
  await RefreshToken.create({
    token,
    user: userId,
    expiresAt,
  });

  return token;
};

export const verifyRefreshToken = async (
  token: string,
): Promise<mongoose.Types.ObjectId | null> => {
  try {
    const decoded = jwt.verify(token, config.jwt.refreshSecret) as TokenPayload;

    // Check if token exists in database
    const refreshToken = await RefreshToken.findOne({ token });
    if (!refreshToken) {
      return null;
    }

    return new mongoose.Types.ObjectId(decoded.userId);
  } catch (error) {
    return null;
  }
};

export const revokeRefreshToken = async (token: string): Promise<void> => {
  await RefreshToken.deleteOne({ token });
};

export const revokeAllUserTokens = async (
  userId: mongoose.Types.ObjectId,
): Promise<void> => {
  await RefreshToken.deleteMany({ user: userId });
};
