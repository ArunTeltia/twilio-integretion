module.exports = {
  TWILIO_ACCOUNT_SID: '',
  TWILIO_AUTH_TOKEN: '',
  TWILIO_DB_STR: `mongodb://twilio_dbuser:twilio_dbpass1@ds129914.mlab.com:29914/twilio_db`,
  TWILIO_INC_NUM_LIST: [
    { resource: 'whatsapp:+918860700006', userName: 'ArunTeltia' },
    { resource: 'whatsapp:+', userName: '' },
    //add number that the company want to send message to 
    
  ],
  TWILIO_FE_URL: ''//the site where we want to fetch data it is for one aggregrator
};
