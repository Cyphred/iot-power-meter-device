import axios from "axios";
import dotenv from "dotenv";
dotenv.config();
import getRedisClient from "../util/getRedisClient.js";

export default async () => {
  const redisClient = await getRedisClient();

  const sensorError = await redisClient.get("SENSOR_ERROR");
  const loadConnected = await redisClient.get("LOAD_CONNECTED");

  // Send report data to the backend
  try {
    const response = await axios.post(
      `${process.env.PING_URI}`,
      {
        sensorError: sensorError === "1" ? true : undefined,
        loadConnected: loadConnected === "1" ? true : false,
      },
      { headers: { Authorization: process.env.METER_SECRET } }
    );

    let connected = 0;
    if (response.status === 200) connected = 1;
    redisClient.set("SERVER_ONLINE", connected);
  } catch (err) {
    redisClient.set("SERVER_ONLINE", 0);
  } finally {
    await redisClient.quit();
  }
};
