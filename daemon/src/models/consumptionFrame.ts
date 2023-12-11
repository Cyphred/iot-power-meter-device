import { DataTypes, Model } from "sequelize";
import sequelize from "../sequelize.js";

export interface IConsumptionFrame {
  start: Date;
  end: Date;
  consumption: number;
  sent?: Date;
}

export interface IConsumptionFrameRecord extends IConsumptionFrame {
  id: number;
  createdAt: Date;
  updatedAt: Date;
}

class ConsumptionFrame
  extends Model<IConsumptionFrameRecord>
  implements IConsumptionFrameRecord
{
  public id!: number;
  public start!: Date;
  public end!: Date;
  public consumption!: number;
  public sent!: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ConsumptionFrame.init(
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
    modelName: "ConsumptionFrame",
    tableName: "ConsumptionFrames",
    timestamps: true,
  }
);

export default ConsumptionFrame;
