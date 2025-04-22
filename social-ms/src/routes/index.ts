import { Router } from "express";
import {
  sendFollowRequest,
  respondToFollowRequest,
  unfollowUser,
  getFollowers,
  getFollowing,
  getPendingRequests,
  getUserSocialStats,
} from "../controller";
import followValidator from "../validator/follow.validator";

const router = Router();

// Send a follow request
router.post("/follow", followValidator.validateFollowRequest, sendFollowRequest);

// Respond to a follow request
router.put(
  "/request/:id",
  followValidator.validateFollowAction,
  respondToFollowRequest
);

// Unfollow a user
router.delete("/follow/:id", followValidator.validateFollowParam, unfollowUser);

// Get user's followers
router.get("/followers", getFollowers);

// Get users the current user is following
router.get("/following", getFollowing);

// Get pending follow requests
router.get("/requests", getPendingRequests);

// Get social stats for a user
router.get(
  "/stats/:userId",
  followValidator.validateUserParam,
  getUserSocialStats
);

export default router; 