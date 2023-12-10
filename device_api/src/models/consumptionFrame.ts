import mongoose, { Schema, Types, Document, Model } from "mongoose";

interface IConsumptionFrame {
  start: Date;
  end: Date;
  consumption: Number;
  sent?: Date;
}

interface IConsumptionFrameDocument extends IConsumptionFrame, Document {}

const consumptionFrameSchema: Schema<IConsumptionFrameDocument> =
  new Schema<IConsumptionFrameDocument>({
    start: {
      type: Date,
      required: true,
    },
    end: {
      type: Date,
      required: true,
    },
    consumption: {
      type: Number,
      required: true,
      validate: {
        validator: (consumption: number) => consumption >= 0,
        message: "Consumption cannot be a negative number",
      },
    },
    sent: {
      type: Date,
    },
  });

consumptionFrameSchema.pre("validate", function (next) {
  if (this.start > this.end)
    next(new Error("Start time must be earlier than the end time"));

  next();
});

const ConsumptionFrameModel: Model<IConsumptionFrameDocument> =
  mongoose.model<IConsumptionFrameDocument>(
    "ConsumptionFrame",
    consumptionFrameSchema
  );

export default ConsumptionFrameModel;
