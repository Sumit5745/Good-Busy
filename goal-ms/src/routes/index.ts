const { Router } = require("express");
import {
  createGoal,
  getGoals,
  getGoalById,
  updateGoal,
  deleteGoal,
  likeGoal,
  thumbsDownGoal,
  completeGoal,
  getGoalStats,
} from "../controller";
import goalValidator from "../validator/goal.validator";

const router = Router();

// Create a new goal
router.post("/", goalValidator.validateCreateGoal, createGoal);

// Get all goals with pagination and filtering
router.get("/", getGoals);

// Get goal statistics
router.get("/stats", getGoalStats);

// Get a specific goal by ID
router.get("/:id", goalValidator.validateGoalAction, getGoalById);

// Update a goal
router.put("/:id", goalValidator.validateUpdateGoal, updateGoal);

// Delete a goal (soft delete)
router.delete("/:id", goalValidator.validateGoalAction, deleteGoal);

// Like a goal
router.post("/:id/like", goalValidator.validateGoalLike, likeGoal);

// Thumbs down a goal
router.post(
  "/:id/thumbs-down",
  goalValidator.validateGoalThumbsDown,
  thumbsDownGoal
);

// Mark goal as complete for today
router.post("/:id/complete", goalValidator.validateGoalAction, completeGoal);

export default router;
