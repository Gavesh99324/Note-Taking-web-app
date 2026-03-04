import { Router } from "express";
import {
  register,
  login,
  refreshToken,
  logout,
  logoutAll,
} from "../controllers/authController";
import { authenticate } from "../middleware/auth";
import { registerValidation, loginValidation } from "../middleware/validation";

const router = Router();

router.post("/register", registerValidation, register);
router.post("/login", loginValidation, login);
router.post("/refresh", refreshToken);
router.post("/logout", logout);
router.post("/logout-all", authenticate, logoutAll);

export default router;
