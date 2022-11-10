import mongoose from "mongoose";
import KirtanConfigs from './mongo-schema.js'
global.dutyConfigs = [];
mongoose.connect('mongodb+srv://dbuser:Waheguru747477%40@cluster0.pkxnk.mongodb.net/livekirtan?retryWrites=true&w=majority').then(() => {
          console.log('connectedto mongodb')
          const dutyConfigsEventEmitter = KirtanConfigs.watch()
          KirtanConfigs.findOne({}).then((config) => {
                    global.dutyConfigs = config.configs;
          }).catch((err) => {
                    console.log(err)
          })
          dutyConfigsEventEmitter.on('change', async () => {
                    KirtanConfigs.findOne({}).then((config) => {
                              global.dutyConfigs = config.configs;
                    }).catch((err) => {
                              console.log(err)
                    })
          })
}).catch((err) => console.log(err));
