const crypto = require('crypto');

const getUserByEmail = (email, users) => {
  for (const user of Object.values(users)) {
    if (user.email === email) {
      return user;
    }
  }
  return undefined;
};

const urlsForUser = (id, urlDatabase) => {
  let urlFiltered = {};
  for (const [uKey, uValue] of Object.entries(urlDatabase)) {
    if (uValue.userID === id) {
      urlFiltered[uKey] = uValue;
    }
  }
  return urlFiltered;
};

const validUser = (req, users) => {
  return req.session.userID !== undefined && users[req.session.userID] !== undefined;
};

const generateRandomString = () => {
  return crypto.randomBytes(4).toString('hex');
};

const getDateTime = () => {
  let dt = new Date();

  // current date
  // adjust 0 before single digit date
  let date = ("0" + dt.getDate()).slice(-2);

  // current month
  let month = ("0" + (dt.getMonth() + 1)).slice(-2);

  // current year
  let year = dt.getFullYear();

  // current hours
  let hours = dt.getHours();

  // current minutes
  let minutes = dt.getMinutes();

  // current seconds
  let seconds = dt.getSeconds();

  // prints date & time in YYYY-MM-DD HH:MM:SS format
  return `${year}-${month}-${date} ${hours}:${minutes}:${seconds}`;

};

module.exports = {
  getUserByEmail,
  urlsForUser,
  validUser,
  generateRandomString,
  getDateTime
};