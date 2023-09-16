const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");
const Member = require("../models/memberModel");

// protected route based on token
const requireSignIn = async (req, res, next) => {
  try {
    const token = req.cookies.access_token;
    // console.log(token);
    const decode = jwt.verify(token, process.env.JWT_SECRET_TOKEN);
    // console.log(decode);
    req.user = decode;
    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({
      status: false,
      errors: [
        {
          message: "You need to sign in to proceed.",
          code: "NOT_SIGNEDIN",
        },
      ],
    });
  }
};

// admin access
const isAdminOrModerator = async (req, res, next) => {
  try {
    const { id } = req.user;
    const user = await Member.findOne({ user: id }).populate("role");
    // console.log(user);
    console.log("from authMiddleware");
    console.log(user.role.name);
    const role = user.role.name;
    if (role === "Community Admin" || role === "Community Moderator") {
      next();
    } else {
      return res.status(401).send({
        status: false,
        errors: [
          {
            message: "You are not authorized to perform this action.",
            code: "NOT_ALLOWED_ACCESS",
          },
        ],
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in admin middleware",
      error,
    });
  }
};

module.exports = { requireSignIn, isAdminOrModerator };
