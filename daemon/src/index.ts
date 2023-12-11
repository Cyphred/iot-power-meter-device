import dotenv from "dotenv";
import mongoose from "mongoose";
import setupRabbitMQ from "./rabbitmq/setup.js";
import sendDataToServer from "./jobs/sendDataToServer.js";
import aggregateDataFromRedis from "./jobs/aggregateDataFromRedis.js";
import { scheduleJob } from "node-schedule";

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

// Setup rabbitmq
await setupRabbitMQ();

const startScheduledJobs = () => {
  const aggregateJob = scheduleJob("*/5 * * * * *", (fireDate) => {
    aggregateDataFromRedis();
  });

  const sendJob = scheduleJob("*/30 * * * * *", (fireDate) => {
    sendDataToServer();
  });

  aggregateJob.invoke();
  sendJob.invoke();
};

startScheduledJobs();
