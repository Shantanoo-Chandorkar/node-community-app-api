const express = require("express");
const {
  requireSignIn,
  isAdminOrModerator,
} = require("../middlewares/authMiddleware");
const {
  addMemberController,
  deleteMemberController,
} = require("../controllers/memberControllers");

// router object
const router = express.Router();

// routes
router.post("/", requireSignIn, isAdminOrModerator, addMemberController);
router.delete(
  "/:id",
  requireSignIn,
  isAdminOrModerator,
  deleteMemberController
);

module.exports = router;
