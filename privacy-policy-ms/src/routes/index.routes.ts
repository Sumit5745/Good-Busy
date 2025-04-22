const { Router } = require("express");
import {
  createPrivacyPolicy,
  getActivePrivacyPolicy,
  getPrivacyPolicyByVersion,
  getAllPrivacyPolicies,
  updatePrivacyPolicy,
  deletePrivacyPolicy,
} from "../controller/privacyPolicy.controller";
import {
  validatePrivacyPolicy,
  validatePrivacyPolicyUpdate,
  validateIdParam,
  validateVersionParam,
} from "../validator/privacyPolicy.validator";
import { authenticateJWT } from "../../../shared/middleware/auth";
import { adminAccess } from "../../../shared/middleware/admin";
const router = Router();

// Public routes
router.get("/", getActivePrivacyPolicy);
router.get(
  "/version/:version",
  validateVersionParam,
  getPrivacyPolicyByVersion
);

// Admin routes
router.post(
  "/",
  authenticateJWT,
  adminAccess,
  validatePrivacyPolicy,
  createPrivacyPolicy
);
router.get("/all", authenticateJWT, adminAccess, getAllPrivacyPolicies);
router.put(
  "/:id",
  authenticateJWT,
  adminAccess,
  validateIdParam,
  validatePrivacyPolicyUpdate,
  updatePrivacyPolicy
);
router.delete(
  "/:id",
  authenticateJWT,
  adminAccess,
  validateIdParam,
  deletePrivacyPolicy
);

export default router;
