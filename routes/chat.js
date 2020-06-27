const _ = require('lodash');
const { Chat } = require('../models/chat');
const express = require('express');
const router = express.Router();
const cors = require('cors');
const bodyParser = require('body-parser');
const dateFormat = require('dateformat');
const { TWILIO_FE_URL } = require('../config/config');

let corsOptions = {
  credentials: true,
  origin: `${TWILIO_FE_URL}`
};

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
router.use(cors(corsOptions));

router.get('/', async (req, res) => {
  const timestamp = dateFormat(Date.now(), 'isoDate');
  const dbChat = await Chat.findOne({ timestamp }, (err, doc) => {
    if (err) console.log(err);
    console.log('Chat - Get History - findOne : ', doc);
  });
  res.send(dbChat.messages);
});

router.post('/', async (req, res) => {
  const { resource, user, message } = req.body;
  let { timestamp } = req.body;
  timestamp = dateFormat(timestamp, 'isoDate');
  let dbChat = await Chat.findOne({ timestamp }, (err, doc) => {
    if (err) console.log(err);
    console.log('Chat - findOne : ', doc);
  });
  if (dbChat) {
    const currMessages = dbChat.messages;
    dbChat = await Chat.findOneAndUpdate(
      { timestamp },
      { $set: { messages: [...currMessages, { resource, user, message }] } },
      { new: true },
      (err, doc) => {
        if (err) console.log(err);
        console.log('Chat - findOneAndUpdate : ', doc);
      }
    );
  } else {
    dbChat = new Chat({ timestamp, messages: [{ resource, user, message }] });
    console.log('Chat - findOneAndUpdate - New DB CHAT: ', dbChat);
    await dbChat.save();
  }
  console.log('----received request', req.body);
  res.send(dbChat);

  //---------twiml push notification--------//

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWIsLIO_AUTH_TOKEN;
  const client = require('twilio')(accountSid, authToken);

  client.messages
    .create({
      body: `${user} just posted a new chat message: ${message}`,
      from: 'whatsapp:+14155238886',
      to: 'whatsapp:+972523689045'
    })
    .then(message => console.log('push message : ', message))
    .done();
});

module.exports = router;
