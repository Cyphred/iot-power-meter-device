import { DataTypes, Model } from "sequelize";
import sequelize from "../sequelize.js";

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
  event: EventType;
  remarks?: string;
}

export interface IEventReportRecord extends IEventReport {
  id: number;
  createdAt: Date;
  updatedAt: Date;
}

class EventReport
  extends Model<IEventReportRecord>
  implements IEventReportRecord
{
  public id!: number;
  public event!: EventType;
  public remarks?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

EventReport.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    event: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    remarks: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
    },
  },
  {
    sequelize,
    modelName: "EventReport",
    tableName: "EventReports",
    timestamps: true,
  }
);

export default EventReport;
