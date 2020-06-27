const mongoose = require('mongoose');

const messageScheme = new mongoose.Schema({
  uid: {
    type: String,
    minlength: 5,
    maxlength: 50,
    required: true,
    unique: true
  },
  messages: {
    type: Array,
    required: false
  }
});

const Message = mongoose.model('Message', messageScheme, 'Twilio_messages');

exports.Message = Message;
