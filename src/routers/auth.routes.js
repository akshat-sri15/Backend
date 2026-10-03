import {Router} from "express";
import {
  loginUser,
  registerUser,
  logoutUser,
  verifyEmail,
  forgotPassword,
  resetPassword
} from "../controllers/auth.controllers.js";
import {validate} from "../middlewares/validator.middleware.js";
import {userRegisterValidator} from "../validators/index.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router=Router();
router.route("/register").post(userRegisterValidator(), validate, registerUser);
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT(), logoutUser);
router.route("/verify-email/:token").get(verifyEmail);
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password/:token").post(resetPassword);
export default router;
