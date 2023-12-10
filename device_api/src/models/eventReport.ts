import mongoose, { Schema, Document, Model } from "mongoose";

const eventTypes = {
  METER_POWER_ON: "METER_POWER_ON",
  METER_POWER_OFF: "METER_POWER_OFF",
  LOAD_CONNECT: "LOAD_CONNECT",
  LOAD_DISCONNECT: "LOAD_DISCONNECT",
  SENSOR_ERROR_DETECTED: "SENSOR_ERROR_DETECTED",
  SERVER_CONNECTED: "SERVER_CONNECTED",
  SERVER_DISCONNECTED: "SERVER_DISCONNECTED",
} as const;

type EventType = (typeof eventTypes)[keyof typeof eventTypes];

export interface IEventReport {
  timestamp: Date;
  event: EventType;
  remarks?: string;
}

export interface IEventReportDocument extends IEventReport, Document {}

const eventReportSchema: Schema<IEventReportDocument> =
  new Schema<IEventReportDocument>({
    timestamp: {
      type: Date,
      required: true,
    },
    event: {
      type: String,
      required: true,
      enum: Object.values(eventTypes),
    },
    remarks: String,
  });

const EventReportModel: Model<IEventReportDocument> =
  mongoose.model<IEventReportDocument>("EventReport", eventReportSchema);

export default EventReportModel;
