import { Router } from "express";
import {
  submitContactForm,
  getContactSubmissions,
} from "../controller/contactUs.controller";
import { adminAccess } from "../../../shared/middleware/admin";
import { authenticateJWT } from "../../../shared/middleware/auth";

const router = Router();

router.post("/", submitContactForm);
router.get("/", authenticateJWT, adminAccess, getContactSubmissions);

export default router;
