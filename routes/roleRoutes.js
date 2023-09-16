const express = require("express");
const { requireSignIn } = require("../middlewares/authMiddleware");
const {
  getRolesController,
  createRoleController,
} = require("../controllers/roleControllers");

// router object
const router = express.Router();

// routes
router
  .route("/")
  .get(requireSignIn, getRolesController)
  .post(requireSignIn, createRoleController);

module.exports = router;
