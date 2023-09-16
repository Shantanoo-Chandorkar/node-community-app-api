// imports
const mongoose = require("mongoose");
const dotenv = require("dotenv");

// dotenv config
dotenv.config();

const uri = process.env.MONGO_CONNECTION_URI;
const connectDb = async () => {
  try {
    const conn = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = connectDb;
