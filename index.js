import got from 'got';                  //if mail of google drive has reached out of storage then simply delete token.json and run npm start and select different mail id which has google drive storage and then token.json will automatically get created
import express from 'express';
import { authorize } from './googledrive--auth.js';
import { uploadFile } from './googledrive--auth.js';
const app = express();
import fs from 'fs';
import './getConfigs.js'
import https from 'https'
setInterval(function () {//for preventing heroku to become unidle
  https.get("https://recordingautomation.onrender.com/");
}, 500000); // every 5 minutes (300000)
function promisify(calbak) {   //my promisify
  return (...c) => {
    return new Promise((res, rej) => {
      calbak(...c, (err, data) => {
        if (err)
          rej(err)
        else
          res(data)

      });
    })

  }
}
const readFile = promisify(fs.readFile)
const recordStream = (endMilliseconds) => {
  console.log('recordinds ends after ', endMilliseconds, 'milliseconds')
  const mp4Url = 'https://live.sgpc.net:8443/;nocache=889869';
  var currentdate = new Date(new Date().toLocaleString(undefined, { timeZone: 'Asia/Kolkata' }));
  var datetime = currentdate.getDate() + "-"//for creating unique filename
    + (currentdate.getMonth() + 1) + "-"
    + currentdate.getFullYear() + "@"
    + currentdate.getHours() + ":"
    + currentdate.getMinutes() + ":"
    + currentdate.getSeconds();
  console.log('recording started at', datetime)
  const fileName = `recording-${datetime}.mp3`;
  const kirtan = fs.createWriteStream(`./${fileName}`)
  kirtan.on("finish", () => {//after recording saved to directory then upload to googledrive
    console.log(`${fileName} saved successfully`);
    authorize().then((auth) => {
      uploadFile(auth, fileName);
    }).catch(console.error);
  })
  got.stream(mp4Url).pipe(kirtan);
  setTimeout(() => {
    kirtan.emit('finish')
  }, endMilliseconds)
}
setInterval(() => {
  const currentIndianTime = new Date(new Date().toLocaleString(undefined, { timeZone: 'Asia/Kolkata' }));
  global.dutyConfigs.map((config) => {
    if (config['startTime'] === `${currentIndianTime.getHours()}:${currentIndianTime.getMinutes()}`) {
      recordStream(((+config['endTime'].split(':')[0] * 60 + +config['endTime'].split(':')[1]) - (+config['startTime'].split(':')[0] * 60 + +config['startTime'].split(':')[1])) * 60 * 1000);
    }
  });

}, 60000)

app.get('/', (req, res) => { //its just for testing promisify
  //   console.log('/ GET')
  //       readFile(`${process.cwd()}/package.json`, 'utf-8').then((data) => res.send(data)).catch((err) => res.send(err))
  res.download(`${process.cwd()}/meow.mp3`);
});



app.get('/test', (req, res) => { //its just for testing promisify
  res.sendFile(path.join(__dirname, 'index1.html'));
});
app.get('/api', (req, res) => {
  res.send('hello')
})
app.listen(process.env.PORT || 5000, () => {
  console.log(`server listening on port 5000`);
});
//=> {"hello": "world"}
process.on('uncaughtException', (err) => {
  console.log(err)
});
process.on('unhandledRejection', (err) => {
  console.log(err)
})
