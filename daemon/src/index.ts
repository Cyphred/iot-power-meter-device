import dotenv from "dotenv";
import sendDataToServer from "./jobs/sendDataToServer.js";
import aggregateDataFromRedis from "./jobs/aggregateDataFromRedis.js";
import { scheduleJob } from "node-schedule";
import ping from "./jobs/ping.js";

// Loads .env data
dotenv.config();

// Check if secret is present in env
const secret = process.env.METER_SECRET;
if (!secret) throw new Error("Meter secret not defined in .env");

const startScheduledJobs = () => {
  const aggregateJob = scheduleJob("*/5 * * * * *", (fireDate) => {
    aggregateDataFromRedis();
  });

  const sendJob = scheduleJob("*/30 * * * * *", (fireDate) => {
    sendDataToServer();
  });

  const pingJob = scheduleJob("*/60 * * * * *", (fireDate) => ping());

  aggregateJob.invoke();
  sendJob.invoke();
  pingJob.invoke();
};

startScheduledJobs();
