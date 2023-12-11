import dotenv from "dotenv";
import sendDataToServer from "./jobs/sendDataToServer.js";
import aggregateDataFromRedis from "./jobs/aggregateDataFromRedis.js";
import { scheduleJob } from "node-schedule";
import ping from "./jobs/ping.js";
import getRedisClient from "./util/getRedisClient.js";

// Loads .env data
dotenv.config();

// Check if secret is present in env
const secret = process.env.METER_SECRET;
if (!secret) throw new Error("Meter secret not defined in .env");

try {
  console.log("Testing connection to redis...");
  const redisClient = await getRedisClient();
  console.log("Redis connection OK");
  await redisClient.quit();
} catch (err) {
  console.error("Could not connect to redis");
  throw err;
}

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
