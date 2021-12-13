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

module.exports = {
  getUserByEmail,
  urlsForUser,
  validUser,
  generateRandomString
};