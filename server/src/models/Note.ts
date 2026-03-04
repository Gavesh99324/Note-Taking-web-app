import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICollaborator {
  user: mongoose.Types.ObjectId;
  permission: "read" | "write" | "admin";
  addedAt: Date;
}

export interface INote extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  content: string;
  owner: mongoose.Types.ObjectId;
  collaborators: ICollaborator[];
  tags: string[];
  isPinned: boolean;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastEditedBy?: mongoose.Types.ObjectId;
}

const collaboratorSchema = new Schema<ICollaborator>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    permission: {
      type: String,
      enum: ["read", "write", "admin"],
      default: "read",
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

const noteSchema = new Schema<INote>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    content: {
      type: String,
      default: "",
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    collaborators: [collaboratorSchema],
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    lastEditedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

// Text index for full-text search
noteSchema.index({ title: "text", content: "text", tags: "text" });

// Compound index for efficient queries
noteSchema.index({ owner: 1, isArchived: 1, isPinned: -1, updatedAt: -1 });

export const Note: Model<INote> = mongoose.model<INote>("Note", noteSchema);
