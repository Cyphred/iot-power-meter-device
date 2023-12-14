import axios from "axios";
import dotenv from "dotenv";
dotenv.config();
import getRedisClient from "../util/getRedisClient.js";
import IApiResponse from "../types/apiResponse.js";

export default async () => {
  const redisClient = await getRedisClient();

  const sensorError = await redisClient.get("SENSOR_ERROR");

  let ampsNow = parseInt(await redisClient.get("AMPS_NOW"));
  if (isNaN(ampsNow)) ampsNow = 0;

  // Send report data to the backend
  try {
    const response = await axios.post(
      `${process.env.PING_URI}`,
      {
        sensorError: sensorError === "1" ? true : false,
        currentNow: ampsNow,
      },
      {
        headers: {
          Authorization: `${process.env.METER_ID}:${process.env.METER_SECRET}`,
        },
      }
    );

    const responseData = response.data as IApiResponse;

    let serverOnline = 0;
    if (!responseData.errorCode && responseData.status === 200)
      serverOnline = 1;

    // If the load is supposed to be disconnected or connected
    if (responseData.body) {
      if (responseData.body.subscriberDisconnect === true)
        await redisClient.set("LOAD_CONNECTED", 0);
      else await redisClient.set("LOAD_CONNECTED", 1);
    }

    await redisClient.set("SERVER_ONLINE", serverOnline);
  } catch (err) {
    await redisClient.set("SERVER_ONLINE", 0);
  } finally {
    await redisClient.quit();
  }
};
