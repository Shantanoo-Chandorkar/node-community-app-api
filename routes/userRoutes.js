const express = require("express");
const { requireSignIn } = require("../middlewares/authMiddleware");
const {
  signUpController,
  signInController,
  getMeController,
} = require("../controllers/userControllers");

// router object
const router = express.Router();

// routes
// POST Sign Up | v1/auth/signup
router.post("/signup", signUpController);

// POST Sign In | v1/auth/signin
router.post("/signin", signInController);

// GET Sign Up | v1/auth/me
router.get("/me", requireSignIn, getMeController);

module.exports = router;
