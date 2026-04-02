import { Router } from "express";

import {
  loginUser,
  loginWithGoogle,
  registerUser,
} from "../controllers/authController.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google", loginWithGoogle);

export default router;
