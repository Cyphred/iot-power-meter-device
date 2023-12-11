import axios from "axios";
import ConsumptionFrameModel, {
  IConsumptionFrameDocument,
} from "../models/consumptionFrame.js";
import dotenv from "dotenv";
import { Types } from "mongoose";

dotenv.config();

export default async () => {
  console.log("Checking for unsent reports...");

  let reports: IConsumptionFrameDocument[] = [];

  try {
    reports = await ConsumptionFrameModel.find({
      $or: [{ sent: { $exists: false } }, { sent: { $eq: null } }],
    });

    console.log(`Found ${reports.length} unsent reports`);
    console.log(reports);
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
    await axios.post(
      `${process.env.REPORTS_URI}`,
      { reports },
      { headers: { Authorization: process.env.METER_SECRET } }
    );
  } catch (err) {
    console.error("Could not send reports to the server");
    return;
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
    return;
  }
};
