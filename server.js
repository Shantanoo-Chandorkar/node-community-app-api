`use strict`;
// dotenv config
require("dotenv").config();

// imports
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const morgan = require("morgan");
const connectDb = require("./db");
const corsOptions = require("./config/corsOptions");
const mongoose = require("mongoose");

// routes import
const userRoutes = require("./routes/userRoutes");
const roleRoutes = require("./routes/roleRoutes");
const communityRoutes = require("./routes/communityRoutes");
const memberRoutes = require("./routes/memberRoutes");

const port = process.env.PORT || 3000;

// express object
const app = express();

// database config
connectDb();

// global middlewares
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(morgan("common"));

// routes
app.get("/", (req, res) => {
  res.send("<h1>Community Application</h1>");
});

// route middlewares
app.use("/v1/auth", userRoutes);
app.use("/v1/role", roleRoutes);
app.use("/v1/community", communityRoutes);
app.use("/v1/member", memberRoutes);

// create server and listen
mongoose.connection.once("open", () => {
  console.log(`Connected to MongoDB Database`);
  app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
  });
});
