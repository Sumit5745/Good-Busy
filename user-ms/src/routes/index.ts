const { Router } = require("express");
import {
  changePassword,
  changeUserRole,
  deleteAccount,
  getAllUsers,
  getProfile,
  registerFcmToken,
  updateDeviceId,
  updateProfile,
} from "../controller";
import {
  changePasswordValidator,
  switchRoleValidator,
} from "../validator/user.validator";
import {
  uploadUserAvatar,
  handleFileUploadErrors,
} from "../../../shared/middleware/fileUpload.middleware";
import { adminAccess } from "../../../shared/middleware/admin";
import { deleteAccountValidator } from "../validator/user.validator";

const routes = Router();

routes.get("/profile", getProfile);
routes.put("/profile", uploadUserAvatar("avatar"), updateProfile);
routes.post("/change-password", changePasswordValidator, changePassword);
routes.put("/switch-role", switchRoleValidator, changeUserRole);
routes.get("/list", adminAccess, getAllUsers);
routes.delete("/delete", deleteAccountValidator, deleteAccount);
routes.put("/update-device-id", updateDeviceId);
routes.post("/register-fcm-token", registerFcmToken);

export default routes;
