require('./config/config.js');

const express = require('express');
const bodyParser = require('body-parser');
const moment = require('moment');
const hbs = require('hbs');
const path = require('path');
// const tz = require('moment-timezone');

const {mongoose} = require('./db/mongoose');
const {Sensor} = require('./models/sensor');

const app = express();

const port = process.env.PORT || 3000;

app.set('view engine', 'hbs');

app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));

app.post('/new_sensor', (req,res) => {
  var sensor = new Sensor({
    sensor_hash: req.body.sensor_hash,
    alias: req.body.alias
  });

  sensor.save().then((doc)=>{
    res.send(doc);
  }, (err) => {
    res.status(400).send(err);
  });

});

app.post('/delete_sensor', (req,res) => {

  Sensor.findOne({"sensor_hash": req.body.sensor_hash}).then((doc) => {
    if (!doc.sensor_hash) {
      return res.status(404).send(`Sensor not found in database.`);
    }
    doc.remove();
    res.send(doc.sensor_hash);
  }).catch((e) => {
    res.status(400).send();
  })

});

app.post('/reading', (req, res) => {

  var reading = req.body.reading;

  var now = moment();
  console.log(now);

  reading.timestamp = now;

  Sensor.findOneAndUpdate({"sensor_hash": req.body.sensor_hash}, {$push: {readings: reading}}).then((sensor_hash) => {
    if (!sensor_hash) {
      return res.status(404).send(`Sensor not found in database.`);
    }
    res.send(reading);
  }).catch((e) => {
    res.status(400).send();
  })

});

app.get('/chart/:alias', (req, res) => {
    var alias = req.params.alias;

    Sensor.findOne({alias: alias}).then((doc) => {
      if (!doc.alias) {
        return res.status(404).send(`Sensor with that alias not found in database.`);
      }
      res.render('chart.hbs', {
        pageTitle: 'Fermentor Temperature Chart',
        sensor_hash: doc.sensor_hash
      });

    })



});

app.get('/sensor_hist/:sensor_hash', (req,res) => {
  var sensor_hash = req.params.sensor_hash;

  Sensor.findOne({sensor_hash: sensor_hash}).then((sensor) => {
    return res.send(JSON.stringify(sensor.readings))
  }).catch((e) => {
    res.status(400).send();
  })

});

app.get('/lasttemp/:alias', (req,res) => {
  var alias = req.params.alias;

  Sensor.findOne({alias: alias}).then((sensor) => {

    readingsObject = JSON.parse(JSON.stringify(sensor.readings));
    lastTemp = readingsObject[readingsObject.length-1].temp;

    epochtime = JSON.stringify(readingsObject[readingsObject.length-1].timestamp);
    // time = new Date(epochtime*1);
    time = moment(epochtime*1).format("ddd DD-MM-YYYY // HH:mm:SS");

    return res.send(time + ": " + JSON.stringify(lastTemp) + " °C")

  }).catch((e) => {
    res.status(400).send();
  })

});

app.listen(port, () => {
  console.log(`Started on port: ${port}`);
});

module.exports = {app};
