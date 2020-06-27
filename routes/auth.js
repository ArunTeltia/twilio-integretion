const _ = require('lodash');
const { User } = require('../models/user');
const express = require('express');
const router = express.Router();
const cors = require('cors');
const bodyParser = require('body-parser');
const { TWILIO_FE_URL } = require('../config/config');

let corsOptions = {
  credentials: true,
  origin: `${TWILIO_FE_URL}/login`
};

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
router.use(cors(corsOptions));

router.post('/', async (req, res) => {
  const { email, password, resource } = req.body;
  let dbUser = await User.findOneAndUpdate(
    { resource },
    { $set: { email, password } },
    { new: true },
    (err, doc) => {
      if (err) console.log(err);
      console.log('Auth - findOneAndUpdate : ', doc);
    }
  );
  if (!dbUser) {
    res.status(400).send('Resource not found in DB', resource);
  }
  console.log('----received request', req.body);
  res.send(dbUser);
});

module.exports = router;
