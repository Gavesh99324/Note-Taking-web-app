import { Router } from "express";
import {
  createNote,
  getNotes,
  getNote,
  updateNote,
  deleteNote,
  searchNotes,
  addCollaborator,
  removeCollaborator,
  updateCollaboratorPermission,
} from "../controllers/noteController";
import { authenticate } from "../middleware/auth";
import {
  createNoteValidation,
  updateNoteValidation,
  addCollaboratorValidation,
  searchNotesValidation,
} from "../middleware/validation";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Note CRUD
router.post("/", createNoteValidation, createNote);
router.get("/", getNotes);
router.get("/search", searchNotesValidation, searchNotes);
router.get("/:id", getNote);
router.patch("/:id", updateNoteValidation, updateNote);
router.delete("/:id", deleteNote);

// Collaborator management
router.post("/:id/collaborators", addCollaboratorValidation, addCollaborator);
router.delete("/:id/collaborators/:collaboratorId", removeCollaborator);
router.patch(
  "/:id/collaborators/:collaboratorId",
  updateCollaboratorPermission,
);

export default router;
