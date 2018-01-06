const mongoose = require('mongoose');


var Sensor = mongoose.model('sensor', {
  sensor_hash: {
    type: String,
    unique: true,
    minlength: 64,
    maxlength: 64,
    trim: true
  },
  alias: {
    type: String,
    unique: true,
    minlength: 1,
    trim: true
  },

  readings: {
    timestamp: {
      type: Number,
    },
    temp: {
      type: Number,
    },
    hum: {
      type: Number
    }
  }
});

module.exports = {Sensor};
