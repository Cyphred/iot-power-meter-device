import dotenv from "dotenv";
import mongoose from "mongoose";

// Loads .env data
dotenv.config();

console.log("Attempting to connect to mongodb...");

const mongoUri = process.env.MONGO_URI
  ? process.env.MONGO_URI
  : "mongodb://mongodb:mongodb@127.0.0.1:27017";

// Connect to db
await mongoose.connect(mongoUri);

console.log(`Connected to mongodb at ${mongoUri}`);
