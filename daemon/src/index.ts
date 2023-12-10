import dotenv from "dotenv";
import mongoose from "mongoose";
import setupRabbitMQ from "./rabbitmq/setup.js";

// Loads .env data
dotenv.config();

// Check if secret is present in env
const secret = process.env.METER_SECRET;
if (!secret) throw new Error("Meter secret not defined in .env");

// Connect to db
console.log("Attempting to connect to mongodb...");
const mongoUri = process.env.MONGO_URI
  ? process.env.MONGO_URI
  : "mongodb://mongodb:mongodb@127.0.0.1:27017";
await mongoose.connect(mongoUri);
console.log(`Connected to mongodb at ${mongoUri}`);

await setupRabbitMQ();
