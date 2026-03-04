import { Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { Note } from "../models/Note";
import { User } from "../models/User";
import { AppError } from "../middleware/errorHandler";
import { AuthRequest } from "../middleware/auth";
import mongoose from "mongoose";

// Helper function to check note access
const checkNoteAccess = async (
  noteId: mongoose.Types.ObjectId,
  userId: mongoose.Types.ObjectId,
  requiredPermission: "read" | "write" | "admin" = "read",
): Promise<any> => {
  const note = await Note.findById(noteId).populate(
    "owner",
    "email username firstName lastName",
  );

  if (!note) {
    throw new AppError("Note not found", 404);
  }

  const isOwner = note.owner._id.toString() === userId.toString();
  const collaborator = note.collaborators.find(
    (c) => c.user.toString() === userId.toString(),
  );

  const hasAccess = isOwner || collaborator;

  if (!hasAccess) {
    throw new AppError("Access denied", 403);
  }

  // Check permission level
  if (requiredPermission === "write" || requiredPermission === "admin") {
    const hasWriteAccess =
      isOwner ||
      (collaborator &&
        (collaborator.permission === "write" ||
          collaborator.permission === "admin"));

    if (!hasWriteAccess) {
      throw new AppError("Insufficient permissions", 403);
    }
  }

  if (requiredPermission === "admin" && !isOwner) {
    const hasAdminAccess = collaborator && collaborator.permission === "admin";
    if (!hasAdminAccess) {
      throw new AppError("Admin permissions required", 403);
    }
  }

  return note;
};

export const createNote = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { title, content, tags } = req.body;
    const userId = req.userId!;

    const note = await Note.create({
      title,
      content: content || "",
      owner: userId,
      tags: tags || [],
      lastEditedBy: userId,
    });

    await note.populate("owner", "email username firstName lastName");

    res.status(201).json({
      message: "Note created successfully",
      note,
    });
  } catch (error) {
    next(error);
  }
};

export const getNotes = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.userId!;
    const { archived, pinned } = req.query;

    const query: any = {
      $or: [{ owner: userId }, { "collaborators.user": userId }],
    };

    if (archived !== undefined) {
      query.isArchived = archived === "true";
    }

    if (pinned !== undefined) {
      query.isPinned = pinned === "true";
    }

    const notes = await Note.find(query)
      .populate("owner", "email username firstName lastName")
      .populate("collaborators.user", "email username firstName lastName")
      .populate("lastEditedBy", "username")
      .sort({ isPinned: -1, updatedAt: -1 });

    res.json({ notes });
  } catch (error) {
    next(error);
  }
};

export const getNote = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const noteId = new mongoose.Types.ObjectId(req.params.id);
    const userId = req.userId!;

    const note = await checkNoteAccess(noteId, userId);
    await note.populate(
      "collaborators.user",
      "email username firstName lastName",
    );
    await note.populate("lastEditedBy", "username");

    res.json({ note });
  } catch (error) {
    next(error);
  }
};

export const updateNote = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const noteId = new mongoose.Types.ObjectId(req.params.id);
    const userId = req.userId!;

    await checkNoteAccess(noteId, userId, "write");

    const { title, content, tags, isPinned, isArchived } = req.body;

    const updateData: any = { lastEditedBy: userId };
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (tags !== undefined) updateData.tags = tags;
    if (isPinned !== undefined) updateData.isPinned = isPinned;
    if (isArchived !== undefined) updateData.isArchived = isArchived;

    const note = await Note.findByIdAndUpdate(noteId, updateData, { new: true })
      .populate("owner", "email username firstName lastName")
      .populate("collaborators.user", "email username firstName lastName")
      .populate("lastEditedBy", "username");

    res.json({
      message: "Note updated successfully",
      note,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteNote = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const noteId = new mongoose.Types.ObjectId(req.params.id);
    const userId = req.userId!;

    const note = await checkNoteAccess(noteId, userId, "admin");

    // Only owner can delete
    if (note.owner._id.toString() !== userId.toString()) {
      throw new AppError("Only the owner can delete this note", 403);
    }

    await Note.findByIdAndDelete(noteId);

    res.json({ message: "Note deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const searchNotes = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const userId = req.userId!;
    const { q, tags } = req.query;

    const query: any = {
      $or: [{ owner: userId }, { "collaborators.user": userId }],
    };

    // Full-text search
    if (q) {
      query.$text = { $search: q as string };
    }

    // Tag filtering
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      query.tags = { $in: tagArray };
    }

    const notes = await Note.find(query)
      .populate("owner", "email username firstName lastName")
      .populate("collaborators.user", "email username firstName lastName")
      .populate("lastEditedBy", "username")
      .sort(q ? { score: { $meta: "textScore" } } : { updatedAt: -1 });

    res.json({ notes });
  } catch (error) {
    next(error);
  }
};

export const addCollaborator = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const noteId = new mongoose.Types.ObjectId(req.params.id);
    const userId = req.userId!;
    const { email, permission } = req.body;

    await checkNoteAccess(noteId, userId, "admin");

    // Find user to add
    const userToAdd = await User.findOne({ email });
    if (!userToAdd) {
      throw new AppError("User not found", 404);
    }

    const note = await Note.findById(noteId);
    if (!note) {
      throw new AppError("Note not found", 404);
    }

    // Check if already a collaborator
    const existingCollaborator = note.collaborators.find(
      (c) => c.user.toString() === userToAdd._id.toString(),
    );

    if (existingCollaborator) {
      throw new AppError("User is already a collaborator", 400);
    }

    // Check if user is the owner
    if (note.owner.toString() === userToAdd._id.toString()) {
      throw new AppError("Cannot add owner as collaborator", 400);
    }

    note.collaborators.push({
      user: userToAdd._id,
      permission,
      addedAt: new Date(),
    });

    await note.save();
    await note.populate(
      "collaborators.user",
      "email username firstName lastName",
    );

    res.json({
      message: "Collaborator added successfully",
      note,
    });
  } catch (error) {
    next(error);
  }
};

export const removeCollaborator = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const noteId = new mongoose.Types.ObjectId(req.params.id);
    const collaboratorId = new mongoose.Types.ObjectId(
      req.params.collaboratorId,
    );
    const userId = req.userId!;

    await checkNoteAccess(noteId, userId, "admin");

    const note = await Note.findById(noteId);
    if (!note) {
      throw new AppError("Note not found", 404);
    }

    note.collaborators = note.collaborators.filter(
      (c) => c.user.toString() !== collaboratorId.toString(),
    );

    await note.save();

    res.json({ message: "Collaborator removed successfully" });
  } catch (error) {
    next(error);
  }
};

export const updateCollaboratorPermission = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const noteId = new mongoose.Types.ObjectId(req.params.id);
    const collaboratorId = new mongoose.Types.ObjectId(
      req.params.collaboratorId,
    );
    const userId = req.userId!;
    const { permission } = req.body;

    if (!["read", "write", "admin"].includes(permission)) {
      throw new AppError("Invalid permission level", 400);
    }

    await checkNoteAccess(noteId, userId, "admin");

    const note = await Note.findById(noteId);
    if (!note) {
      throw new AppError("Note not found", 404);
    }

    const collaborator = note.collaborators.find(
      (c) => c.user.toString() === collaboratorId.toString(),
    );

    if (!collaborator) {
      throw new AppError("Collaborator not found", 404);
    }

    collaborator.permission = permission;
    await note.save();
    await note.populate(
      "collaborators.user",
      "email username firstName lastName",
    );

    res.json({
      message: "Permission updated successfully",
      note,
    });
  } catch (error) {
    next(error);
  }
};
