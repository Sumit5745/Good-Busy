import { Router } from "express";
import {
  forgotPasswordSendOTP,
  login,
  register,
  resetPassword,
  verifyAccount,
  resendOTP,
} from "../controller";
import authValidator from "../validator/auth.validator";
import { uploadUserAvatar } from "../../../shared/middleware/fileUpload.middleware";

const routes = Router();

routes.post(
  "/register",
  uploadUserAvatar("avatar"),
  authValidator.validateRegister,
  register
);
routes.post("/login", authValidator.validateLogin, login);
routes.post(
  "/forgot-password",
  authValidator.validateForgetPassword,
  forgotPasswordSendOTP
);
routes.post(
  "/reset-password",
  authValidator.validateResetPassword,
  resetPassword
);
routes.post(
  "/verify-account",
  authValidator.validateVerifyAccount,
  verifyAccount
);
routes.post("/resend-otp", authValidator.validateResendOTP, resendOTP);

export default routes;
