`use strict`;
const User = require("../models/userModel");
const { hashPassword, comparePasswords } = require("../utils/authHelper");
const jwt = require("jsonwebtoken");
const passwordSchema = require("../utils/authValidation");
const emailValidator = require("email-validator");

// jwt token generation
const generateAccessToken = (user) => {
  return jwt.sign({ id: user.id }, process.env.JWT_SECRET_TOKEN, {
    expiresIn: "1d",
  });
};

// @desc Sign Up route
// POST /v1/auth/signup
const signUpController = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    let errors = [];

    // input validations
    if (!name) {
      return res.status(400).json({
        status: false,
        errors: [
          {
            param: "name",
            message: "Name should be at least 2 characters.",
            code: "INVALID_INPUT",
          },
        ],
      });
    }
    if (!email) {
      return res.status(400).json({
        status: false,
        errors: [
          {
            param: "email",
            message: "Email is required",
            code: "INVALID_INPUT",
          },
        ],
      });
    }
    if (!password) {
      return res.status(400).json({
        status: false,
        errors: [
          {
            param: "password",
            message: "Password should be at least 6 characters.",
            code: "INVALID_INPUT",
          },
        ],
      });
    }

    // email validation
    if (!emailValidator.validate(email)) {
      return res.status(400).json({
        status: false,
        errors: [
          {
            param: "email",
            message: "Please provide a valid email address.",
            code: "INVALID_INPUT",
          },
        ],
      });
    }

    // password validation
    const passDetails = passwordSchema.validate(password, { details: true });
    // console.log(passDetails);
    if (passDetails.length > 0) {
      return res.status(400).json({
        status: false,
        errors: [
          {
            param: "password",
            message: passDetails,
            code: "INVALID_INPUT",
          },
        ],
      });
    }

    // check user
    const existingUser = await User.findOne({ email });

    // existing user found
    if (existingUser) {
      return res.status(400).send({
        status: false,
        errors: [
          {
            param: "email",
            message: "User with this email address already exists.",
            code: "RESOURCE_EXISTS",
          },
        ],
      });
    }

    // hash password
    const hashedPassword = await hashPassword(password);

    // save
    const user = await new User({
      name,
      email,
      password: hashedPassword,
    }).save();

    // set cookie
    const accessToken = generateAccessToken(user);
    res.cookie("access_token", accessToken, { httpOnly: true }); // Set the accessToken in a cookie

    // response
    res.status(201).send({
      status: true,
      content: {
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          created_at: user.createdAt,
        },
      },
      meta: {
        access_token: accessToken,
      },
    });
  } catch (error) {
    console.log(error);
    req.status(500).send({
      status: false,
      errors: [{ message: "Error signing up", code: "SERVER_ERROR" }],
    });
  }
};

// @desc Sign In route
// POST /v1/auth/signin

const signInController = async (req, res) => {
  try {
    const { email, password } = req.body;

    // input validation
    if (!email) {
      return res.status(400).json({
        status: false,
        errors: errors.push({
          param: "email",
          message: "Email is required",
          code: "INVALID_INPUT",
        }),
      });
    }
    if (!password) {
      return res.status(400).json({
        status: false,
        errors: errors.push({
          param: "password",
          message: "Password should be at least 6 characters.",
          code: "INVALID_INPUT",
        }),
      });
    }

    // check user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send({
        status: false,
        errors: [
          {
            param: "email",
            message: "Please provide a valid email address.",
            code: "INVALID_INPUT",
          },
        ],
      });
    }

    // compare password
    const matchPassword = await comparePasswords(password, user.password);
    if (!matchPassword) {
      return res.status(200).send({
        status: false,
        errors: [
          {
            param: "password",
            message: "The credentials you provided are invalid.",
            code: "INVALID_CREDENTIALS",
          },
        ],
      });
    }

    // set cookie
    const accessToken = generateAccessToken(user);
    res.cookie("access_token", accessToken, { httpOnly: true }); // Set the accessToken in a cookie

    res.status(200).json({
      status: true,
      content: {
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          created_at: user.createdAt,
        },
      },
      meta: {
        access_token: accessToken,
      },
    });
  } catch (error) {
    console.log(error);
    req.status(500).send({
      status: false,
      errors: [{ message: "Error signing in", code: "SERVER_ERROR" }],
    });
  }
};

// @desc get me route
// GET /v1/auth/me
const getMeController = async (req, res) => {
  try {
    const userId = req.user.id;
    // console.log(userId);

    const user = await User.findById({ _id: userId });

    if (user) {
      res.status(200).json({
        status: true,
        content: {
          data: {
            id: user._id,
            name: user.name,
            email: user.email,
            created_at: user.createdAt,
          },
        },
      });
    } else {
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
  } catch (error) {
    console.log(error);
    res.status(500).send({
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

module.exports = { signUpController, signInController, getMeController };
