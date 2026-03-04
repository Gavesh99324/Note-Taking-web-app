import { body, param, query, ValidationChain } from "express-validator";

export const registerValidation: ValidationChain[] = [
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("username")
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters long")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username can only contain letters, numbers, and underscores"),
  body("firstName").trim().notEmpty().withMessage("First name is required"),
  body("lastName").trim().notEmpty().withMessage("Last name is required"),
];

export const loginValidation: ValidationChain[] = [
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

export const createNoteValidation: ValidationChain[] = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ max: 200 })
    .withMessage("Title must not exceed 200 characters"),
  body("content").optional().isString(),
  body("tags").optional().isArray().withMessage("Tags must be an array"),
];

export const updateNoteValidation: ValidationChain[] = [
  param("id").isMongoId().withMessage("Invalid note ID"),
  body("title")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Title cannot be empty")
    .isLength({ max: 200 })
    .withMessage("Title must not exceed 200 characters"),
  body("content").optional().isString(),
  body("tags").optional().isArray().withMessage("Tags must be an array"),
  body("isPinned").optional().isBoolean(),
  body("isArchived").optional().isBoolean(),
];

export const addCollaboratorValidation: ValidationChain[] = [
  param("id").isMongoId().withMessage("Invalid note ID"),
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
  body("permission")
    .isIn(["read", "write", "admin"])
    .withMessage("Permission must be read, write, or admin"),
];

export const searchNotesValidation: ValidationChain[] = [
  query("q")
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage("Search query must not be empty"),
  query("tags")
    .optional()
    .custom((value) => {
      if (typeof value === "string") return true;
      if (Array.isArray(value)) return true;
      throw new Error("Tags must be a string or array");
    }),
];
