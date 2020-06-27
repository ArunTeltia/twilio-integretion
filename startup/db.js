const mongoose = require('mongoose');
const { TWILIO_DB_STR } = require('../config/config');

module.exports = function() {
  mongoose
    .connect(TWILIO_DB_STR)
    .then(() => console.log(`Connected to Twilio DB`));
};
