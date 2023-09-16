const express = require("express");
const { requireSignIn } = require("../middlewares/authMiddleware");
const {
  createCommunityController,
  getAllCommunitiesController,
  getMyOwnedCommunityController,
  getMyJoinedCommunityController,
  getAllMembersController,
} = require("../controllers/communityControllers");

// router object
const router = express.Router();

// routes
router
  .route("/")
  .post(requireSignIn, createCommunityController)
  .get(getAllCommunitiesController);

router.get("/:id/members", getAllMembersController);
router.get("/me/owner", requireSignIn, getMyOwnedCommunityController);
router.get("/me/member", requireSignIn, getMyJoinedCommunityController);

module.exports = router;
