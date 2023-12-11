import { DataTypes } from "sequelize";
import sequelize from "../sequelize.js";

export interface IConsumptionFrame {
  start: Date;
  end: Date;
  consumption: Number;
  sent?: Date;
}

export interface IConsumptionFrameRecord extends IConsumptionFrame {
  id: number;
  createdAt: Date;
  updatedAt: Date;
}

const ConsumptionFrame = sequelize.define(
  "ConsumptionFrame",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    start: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    end: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    consumption: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    sent: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  { tableName: "ConsumptionFrames", timestamps: true }
);

export default ConsumptionFrame;
