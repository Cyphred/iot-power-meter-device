import ConsumptionFrameModel from "../models/consumptionFrame.js";
import IRawConsumption from "../types/rawConsumption.js";

const handleNewRawConsumptionData = async (data: IRawConsumption) => {
  try {
    await ConsumptionFrameModel.create(data);
  } catch (err) {
    console.error(err);
  }
};

export default handleNewRawConsumptionData;
