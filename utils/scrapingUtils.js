const axios = require('axios');
const scrapingURL = 'http://www.theblackdog.net/insecure.htm';

exports.parseQuotes = async () => {
  let html;
  try {
    const response = await axios.get(scrapingURL);
    html = response.data;
  } catch (error) {
    console.error(error);
  }

  let quotes = html.slice(
    html.indexOf('quoteArray[0]'),
    html.indexOf('quoteArray[42]')
  );

  let regex = /quoteArray\[[0-9]\]=|quoteArray\[[1-4][0-9]\]=/g;
  quotes = quotes
    .replace(regex, '')
    .split('\n')
    .filter(el => el.length > 0);
  return quotes;
};

exports.getRandomAdvice = function(parsedQuotes) {
  return parsedQuotes[Math.ceil(Math.random() * parsedQuotes.length) - 1];
};
