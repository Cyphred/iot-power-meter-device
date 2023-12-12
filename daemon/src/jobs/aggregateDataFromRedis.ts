import dotenv from "dotenv";
import ConsumptionFrame, {
  IConsumptionFrame,
} from "../models/consumptionFrame.js";
import getRedisClient from "../util/getRedisClient.js";
import sequelize from "../sequelize.js";

dotenv.config();

interface IRawData {
  timestamp: number;
  wattage: number;
}

interface IParsedData {
  timestamp: Date;
  wattage: number;
}

export default async () => {
  const redisClient = await getRedisClient();

  // Store the keys of the data
  const keys = await redisClient.keys("consumption:*");

  // Do not proceed if there is no data to store
  if (!keys.length) return;

  // Fetch the values of the data
  const rawData = await redisClient.mGet(keys);

  // Parse the raw data as json objects
  const parsedData: IParsedData[] = [];
  for (const value of rawData) {
    const parsed = JSON.parse(value) as IRawData;

    parsedData.push({
      timestamp: new Date(parsed.timestamp),
      wattage: parsed.wattage,
    });
  }

  const frames: IConsumptionFrame[] = await convertToConsumptionFrames(
    parsedData
  );

  // Saves the frame records to the database
  console.log(`Saving ${frames.length} frames to the database`);
  sequelize
    .sync()
    .then(() => {
      return ConsumptionFrame.bulkCreate(frames as any);
    })
    .then((createdFrames) => {
      console.log(
        `Created ${createdFrames.length} frames out of ${frames.length}.`
      );
    })
    .catch((error) => {
      console.error("Error ");
    })
    .finally(async () => {
      // Delete the saved data from redis
      await redisClient.del(keys);
    });

  // Close the redis connection
  await redisClient.quit();
};

const convertToConsumptionFrames = async (parsedData: IParsedData[]) => {
  // Sort the data
  parsedData.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  // Get report resolution from env for set a default of 1000
  // The report resolution is the number of milliseconds a
  // consumption frame should encompass.
  let resolution = parseInt(process.env.REPORT_RESOLUTION);
  if (isNaN(resolution)) resolution = 1000;

  let queue = [...parsedData];
  const frames: IConsumptionFrame[] = [];

  while (queue.length) {
    const start = queue[0].timestamp;
    const startTime = start.getTime();

    let lastIndex = 0;
    const withinResolution: IParsedData[] = [];

    // Filter out the data points that are not within the resolution
    const resolutionEnd = startTime + resolution;
    for (let i = 0; i < queue.length; i++) {
      if (
        queue[i].timestamp.getTime() >= startTime &&
        queue[i].timestamp.getTime() <= resolutionEnd
      ) {
        lastIndex = i;
        withinResolution.push(queue[i]);
      }
    }

    // Remove the filtered items from the queue
    queue = queue.slice(0, lastIndex);

    // Determine the ending timestamp
    const end = withinResolution.slice(-1)[0].timestamp;

    // Compute the consumption by averaging the data points
    let consumption: number = 0;
    for (const data of withinResolution) {
      consumption += data.wattage;
    }
    consumption /= withinResolution.length;

    frames.push({
      start,
      end,
      consumption,
    });
  }

  return frames;
};
