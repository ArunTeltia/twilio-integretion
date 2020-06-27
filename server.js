'use strict';
const cors = require('cors');
const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const scraper = require('./utils/scrapingUtils');
const { User } = require('./models/user');
const { Message } = require('./models/message');
const { TWILIO_INC_NUM_LIST, TWILIO_FE_URL } = require('./config/config');

const app = express();
const port = process.env.PORT || 5000;
app.locals.parsedQuotes = [];
app.locals.whatsAppMsg = {};
let corsOptions = {
  credentials: true,
  origin: true
};

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors(corsOptions));

require('./startup/routes')(app);
require('./startup/db')();

const httpServer = app.listen(port, async function() {
  console.log(`Server listening on port ${port}`);
  app.locals.parsedQuotes = await scraper.parseQuotes();
});

const io = require('socket.io')(httpServer);

io.on('connection', socket => {
  console.log('user connected');
  socket.on('chat message', msg => {
    console.log('recieved msg', msg);
    io.emit('chat message', msg);
  });
});

app.get('/user/:id', async (req, res) => {
  const message = await Message.findOne({ uid: req.params.id });
  const user = await User.findOne({ _id: req.params.id });
  const knownUser = TWILIO_INC_NUM_LIST.filter(
    el => el.resource === user.resource
  );
  const response =
    user && message
      ? {
          advice: scraper.getRandomAdvice(app.locals.parsedQuotes),
          user: knownUser ? knownUser[0].userName : user.name,
          resource: user.resource,
          message: message.messages
        }
      : {};

  res.send(JSON.stringify(response));
  res.end();
});

app.post('/', async (req, res) => {
  console.log('Recieved POST Request - : ', req);
  //---------DB-----------------//
  let dbUser;
  let dbMessage;

  try {
    dbUser = await User.findOne({ resource: req.body.From });
  } catch (error) {
    console.log(error);
  }
  if (!dbUser) {
    dbUser = new User({ name: req.body.From, resource: req.body.From });
    console.log(dbUser);
    await dbUser.save();
  }

  try {
    console.log(dbUser._id);
    dbMessage = await Message.findOne({ uid: dbUser._id });
  } catch (error) {
    console.log(error);
  }
  if (!dbMessage) {
    dbMessage = new Message({
      uid: dbUser._id,
      messages: [...[], req.body.Body]
    });

    console.log(dbMessage);
    await dbMessage.save();
  } else {
    dbMessage = await Message.findOneAndUpdate(
      { uid: dbUser._id },
      {
        messages: [...dbMessage.messages, req.body.Body]
      },
      { new: true }
    );
    console.log(dbMessage);
  }

  //--------TWIML---------------//

  const twiml = new MessagingResponse();
  let response = '';
  const message = req.body.Body;
  const knownUser = TWILIO_INC_NUM_LIST.filter(
    el => el.resource === req.body.From
  );
  const userName = knownUser ? knownUser[0].userName : req.body.From;

  if (message) {
    response = `Hi ${userName}!
    Thanks for your message, you can find your messages history under:
    ${TWILIO_FE_URL}/user/${dbUser._id}
    In addition here's a random advice for free:
    ${scraper.getRandomAdvice(app.locals.parsedQuotes)}`;
    app.locals.whatsAppMsg.resource = knownUser[0].resource;
  }

  app.locals.whatsAppMsg = {
    ...app.locals.whatsAppMsg,
    ...{ user: userName, message: message }
  };
  console.log(response);
  twiml.message(response);
  res.writeHead(200, { 'Content-Type': 'text/xml' });
  res.end(twiml.toString());
});
