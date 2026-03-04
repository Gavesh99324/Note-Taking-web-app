import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";
import mongoose from "mongoose";

export interface AuthRequest extends Request {
  userId?: mongoose.Types.ObjectId;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ message: "No token provided" });
      return;
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, config.jwt.accessSecret) as {
        userId: string;
      };

      req.userId = new mongoose.Types.ObjectId(decoded.userId);
      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        res.status(401).json({ message: "Token expired" });
        return;
      }
      res.status(401).json({ message: "Invalid token" });
      return;
    }
  } catch (error) {
    next(error);
  }
};
