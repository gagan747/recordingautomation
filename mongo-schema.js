import mongoose  from "mongoose";

const kirtanConfigs = new mongoose.Schema({
  configs: [{
    startTime:String,
    endTime:String
  }]
});

const KirtanConfigs = mongoose.model('KIRTANCONFIG', kirtanConfigs);
export default KirtanConfigs;