const { Router } = require("express");
import {
  createAboutUs,
  getActiveAboutUs,
  getAboutUsByVersion,
  getAllAboutUs,
  updateAboutUs,
  deleteAboutUs,
} from "../controller/aboutUs.controller";
import {
  validateAboutUs,
  validateAboutUsUpdate,
  validateIdParam,
  validateVersionParam,
} from "../validator/aboutUs.validator";
import { authenticateJWT } from "../../../shared/middleware/auth";
import { adminAccess } from "../../../shared/middleware/admin";
const router = Router();

// Public routes
router.get("/", getActiveAboutUs);
router.get("/version/:version", validateVersionParam, getAboutUsByVersion);

// Admin routes
router.post("/", authenticateJWT, adminAccess, validateAboutUs, createAboutUs);
router.get("/all", authenticateJWT, adminAccess, getAllAboutUs);
router.put(
  "/:id",
  authenticateJWT,
  adminAccess,
  validateIdParam,
  validateAboutUsUpdate,
  updateAboutUs
);
router.delete(
  "/:id",
  authenticateJWT,
  adminAccess,
  validateIdParam,
  deleteAboutUs
);

export default router;
