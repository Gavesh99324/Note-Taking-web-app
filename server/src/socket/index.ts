import { Server as HTTPServer } from "http";
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { Note } from "../models/Note";
import mongoose from "mongoose";

interface AuthenticatedSocket extends Socket {
  userId?: mongoose.Types.ObjectId;
}

interface NoteUpdateData {
  content?: string;
  title?: string;
  cursorPosition?: number;
}

export const setupSocketIO = (httpServer: HTTPServer): Server => {
  const io = new Server(httpServer, {
    cors: {
      origin: config.clientUrl,
      credentials: true,
    },
  });

  // Authentication middleware
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error("Authentication error"));
      }

      const decoded = jwt.verify(token, config.jwt.accessSecret) as {
        userId: string;
      };

      socket.userId = new mongoose.Types.ObjectId(decoded.userId);
      next();
    } catch (error) {
      next(new Error("Authentication error"));
    }
  });

  // Active users per note
  const activeUsers = new Map<string, Set<string>>();

  io.on("connection", (socket: AuthenticatedSocket) => {
    console.log("✅ Client connected:", socket.id);

    // Join note room
    socket.on("join-note", async (noteId: string) => {
      try {
        const userId = socket.userId!;

        // Verify user has access to the note
        const note = await Note.findById(noteId);
        if (!note) {
          socket.emit("error", { message: "Note not found" });
          return;
        }

        const hasAccess =
          note.owner.toString() === userId.toString() ||
          note.collaborators.some(
            (c) => c.user.toString() === userId.toString(),
          );

        if (!hasAccess) {
          socket.emit("error", { message: "Access denied" });
          return;
        }

        // Join the room
        socket.join(noteId);

        // Track active users
        if (!activeUsers.has(noteId)) {
          activeUsers.set(noteId, new Set());
        }
        activeUsers.get(noteId)!.add(userId.toString());

        // Notify others
        socket.to(noteId).emit("user-joined", {
          userId: userId.toString(),
          activeUsers: Array.from(activeUsers.get(noteId)!),
        });

        // Send current active users to the joining user
        socket.emit("active-users", {
          activeUsers: Array.from(activeUsers.get(noteId)!),
        });

        console.log(`User ${userId} joined note ${noteId}`);
      } catch (error) {
        console.error("Error joining note:", error);
        socket.emit("error", { message: "Failed to join note" });
      }
    });

    // Leave note room
    socket.on("leave-note", (noteId: string) => {
      const userId = socket.userId!.toString();
      socket.leave(noteId);

      if (activeUsers.has(noteId)) {
        activeUsers.get(noteId)!.delete(userId);

        if (activeUsers.get(noteId)!.size === 0) {
          activeUsers.delete(noteId);
        } else {
          socket.to(noteId).emit("user-left", {
            userId,
            activeUsers: Array.from(activeUsers.get(noteId)!),
          });
        }
      }

      console.log(`User ${userId} left note ${noteId}`);
    });

    // Note content update
    socket.on(
      "note-update",
      async (data: { noteId: string; updates: NoteUpdateData }) => {
        try {
          const { noteId, updates } = data;
          const userId = socket.userId!;

          // Verify write access
          const note = await Note.findById(noteId);
          if (!note) {
            socket.emit("error", { message: "Note not found" });
            return;
          }

          const isOwner = note.owner.toString() === userId.toString();
          const collaborator = note.collaborators.find(
            (c) => c.user.toString() === userId.toString(),
          );

          const hasWriteAccess =
            isOwner ||
            (collaborator &&
              (collaborator.permission === "write" ||
                collaborator.permission === "admin"));

          if (!hasWriteAccess) {
            socket.emit("error", { message: "Insufficient permissions" });
            return;
          }

          // Update note in database
          const updateData: any = { lastEditedBy: userId };
          if (updates.content !== undefined)
            updateData.content = updates.content;
          if (updates.title !== undefined) updateData.title = updates.title;

          await Note.findByIdAndUpdate(noteId, updateData);

          // Broadcast to other users in the room
          socket.to(noteId).emit("note-updated", {
            updates,
            userId: userId.toString(),
          });
        } catch (error) {
          console.error("Error updating note:", error);
          socket.emit("error", { message: "Failed to update note" });
        }
      },
    );

    // Cursor position update
    socket.on(
      "cursor-position",
      (data: { noteId: string; position: number }) => {
        const userId = socket.userId!.toString();
        socket.to(data.noteId).emit("cursor-update", {
          userId,
          position: data.position,
        });
      },
    );

    // Disconnect
    socket.on("disconnect", () => {
      const userId = socket.userId?.toString();
      console.log("❌ Client disconnected:", socket.id);

      // Remove user from all active note rooms
      activeUsers.forEach((users, noteId) => {
        if (userId && users.has(userId)) {
          users.delete(userId);

          if (users.size === 0) {
            activeUsers.delete(noteId);
          } else {
            socket.to(noteId).emit("user-left", {
              userId,
              activeUsers: Array.from(users),
            });
          }
        }
      });
    });
  });

  return io;
};
