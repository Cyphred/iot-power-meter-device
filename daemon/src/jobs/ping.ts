import axios from "axios";
import dotenv from "dotenv";
dotenv.config();
import getRedisClient from "../util/getRedisClient.js";

export default async () => {
  const redisClient = await getRedisClient();
  // Send report data to the backend
  try {
    const response = await axios.get(`${process.env.PING_URI}`);
    let connected = 0;
    if (response.status === 200) connected = 1;
    redisClient.set("SERVER_ONLINE", connected);
  } catch (err) {
    redisClient.set("SERVER_ONLINE", 0);
  } finally {
    await redisClient.quit();
  }
};
