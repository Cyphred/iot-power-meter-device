import axios from "axios";
import ConsumptionFrameModel from "../models/consumptionFrame.js";
import dotenv from "dotenv";
import { Types } from "mongoose";
import schedule from "node-schedule";

dotenv.config();

const sendUnsentReportsToServer = async () => {
  console.log("Checking for unsent reports...");

  const reports = await ConsumptionFrameModel.find({ sent: false });

  // Do not proceed if there are no reports to be sent
  if (reports.length === 0) {
    console.log("No reports to send.");
    return;
  }

  console.log(`Found ${reports.length} unsent reports.`);

  // Send report data to the backend
  try {
    await axios.post(
      `${process.env.REPORTS_URI}`,
      { reports },
      { headers: { Authorization: process.env.METER_SECRET } }
    );
  } catch (err) {
    console.error("Could not send reports to the server");
  }

  // Update local report data
  const now = new Date();
  const reportIds: Types.ObjectId[] = [];
  for (const r of reports) reportIds.push(r._id);

  try {
    await ConsumptionFrameModel.updateMany(
      { _id: { $in: reportIds } },
      { sent: now }
    );
  } catch (err) {
    console.error("Could not update the consumption frames");
  }
};

export default schedule.scheduleJob("*/30 * * * * *", (fireDate) => {
  sendUnsentReportsToServer();
});
