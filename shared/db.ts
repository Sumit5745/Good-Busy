import mongoose from "mongoose";
import * as config from "../shared/config.json";

// Load environment variables from .env file
require("dotenv").config();

const environment = process.env.NODE_ENV! || "dev";

const envConfig = JSON.parse(JSON.stringify(config))[environment];

// Set the MongoDB connection URL
const URL = envConfig.db;

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(URL);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
};

export default connectDB;
