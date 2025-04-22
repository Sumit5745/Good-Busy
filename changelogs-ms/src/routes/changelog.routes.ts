import { Router } from "express";
import { getActivityLogs, getActivityLogById } from "../controller/changelog.controller";
import { 
  activityLogIdParamValidator, 
  activityLogQueryValidator 
} from "../validator/changelog.validator";

const router = Router();

// Get activity logs with pagination and filtering
router.get("/", activityLogQueryValidator, getActivityLogs);

// Get a specific activity log by ID
router.get("/:id", activityLogIdParamValidator, getActivityLogById);

export default router; 