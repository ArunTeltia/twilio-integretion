const mongoose = require('mongoose');
// const User = require('./user');
// const UserScheme = mongoose.model('User').schema;

const chatScheme = new mongoose.Schema({
  timestamp: {
    type: String,
    unique: true,
    required: true
  },
  messages: {
    type: Array,
    required: false
  }
});

const Chat = mongoose.model('Chat', chatScheme, 'Twilio_chat');

exports.Chat = Chat;
