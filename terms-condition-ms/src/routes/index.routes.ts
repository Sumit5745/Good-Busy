const express = require("express");
import * as termsConditionController from "../controller/termsCondition.controller";
import {
  validateTermsCondition,
  validateTermsConditionUpdate,
  validateIdParam,
  validateVersionParam,
} from "../validator/termsCondition.validator";
import { authenticateJWT } from "../../../shared/middleware/auth";
import { adminAccess } from "../../../shared/middleware/admin";

const router = express.Router();

// Public routes
router.get("/", termsConditionController.getActiveTermsCondition);
router.get(
  "/version/:version",
  validateVersionParam,
  termsConditionController.getTermsConditionByVersion
);

// Admin routes - protected
router.post(
  "/",
  authenticateJWT,
  adminAccess,
  validateTermsCondition,
  termsConditionController.createTermsCondition
);

router.get(
  "/all",
  authenticateJWT,
  adminAccess,
  termsConditionController.getAllTermsConditions
);

router.put(
  "/:id",
  authenticateJWT,
  adminAccess,
  validateIdParam,
  validateTermsConditionUpdate,
  termsConditionController.updateTermsCondition
);

router.delete(
  "/:id",
  authenticateJWT,
  adminAccess,
  validateIdParam,
  termsConditionController.deleteTermsCondition
);

export default router;
