const auth = require('../routes/auth');
const chat = require('../routes/chat');

module.exports = function(app) {
  app.use('/auth', auth);
  app.use('/chat', chat);
};
