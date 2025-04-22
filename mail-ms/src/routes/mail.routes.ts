import { Router } from "express";
import { getMails, getMailById } from "../controller/mail.controller";
import { 
  mailIdParamValidator, 
  mailQueryValidator 
} from "../validator/mail.validator";

const router = Router();

// Get emails with pagination and filtering
router.get("/", mailQueryValidator, getMails);

// Get a specific email by ID
router.get("/:id", mailIdParamValidator, getMailById);

export default router; 