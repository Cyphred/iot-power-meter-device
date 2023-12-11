import axios from "axios";
import ConsumptionFrame, {
  IConsumptionFrameRecord,
} from "../models/consumptionFrame.js";
import dotenv from "dotenv";
import getRedisClient from "../util/getRedisClient.js";
import { Op } from "sequelize";

dotenv.config();

export default async () => {
  console.log("Checking for unsent reports...");

  let reports: IConsumptionFrameRecord[] = [];

  try {
    reports = await ConsumptionFrame.findAll({
      where: {
        sent: {
          [Op.not]: null,
        },
      },
    });

    console.log(`Found ${reports.length} unsent reports`);
  } catch (err) {
    console.log("No reports to send.");
    return;
  }

  // Do not proceed if there are no reports to be sent
  if (reports.length === 0) {
    console.log("No reports to send.");
    return;
  }

  // Send report data to the backend
  try {
    console.log("Sending reports to server...");
    await axios.post(
      `${process.env.REPORTS_URI}`,
      { reports },
      { headers: { Authorization: process.env.METER_SECRET } }
    );
  } catch (err) {
    const redisClient = await getRedisClient();
    await redisClient.set("SERVER_ONLINE", 0);
    await redisClient.quit();
    console.error("Could not send reports to the server");
    return;
  }

  // Update local report data
  const now = new Date();
  const reportIds: number[] = [];
  for (const r of reports) reportIds.push(r.id);

  try {
    // Loop through all the ids and update them with sent properties
    await Promise.all(
      reportIds.map(async (id) => {
        await ConsumptionFrame.update({ sent: now }, { where: { id } });
      })
    );
    console.error("Frames updated successfully");
  } catch (err) {
    console.error("Could not update the consumption frames");
    return;
  }
};
