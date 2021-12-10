const { assert } = require('chai');

const { getUserByEmail, urlsForUser } = require('../helper');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  },
  i3BoTh: {
    longURL: "https://www.google.com",
    userID: "aJ48ko"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.equal(user.id, expectedUserID);
    assert.equal(user.email, "user@example.com");
    assert.equal(user.password, "purple-monkey-dinosaur");
  });
  it('should return undefined if email is not valid', function() {
    const user = getUserByEmail("user1@example.com", testUsers);
    assert.isUndefined(user);
  });
});

describe('urlsForUser', function() {
  it('should urls for a given user', function() {
    const urls = urlsForUser("aJ48lW", urlDatabase);
    assert.equal(Object.keys(urls).length, 2);
    assert.equal(Object.keys(urls)[0], 'b6UTxQ');
  });
  it('should return empty object if the given user is not there in url database', function() {
    assert.deepEqual(urlsForUser("a", urlDatabase), {});
  });
});