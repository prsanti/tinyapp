const { assert } = require('chai');

const { getUserByEmail, urlsForUser } = require('../helpers.js');

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

const testUrlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "abcdef"},
  "9sm5xK": { longURL: "http://www.google.com", userID: "123456"}
};

// Had to modify Compass' getUserByEmail function to match what it does in my project
describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail(testUsers, "user@example.com");
    const expectedOutput = testUsers["userRandomID"];
    assert.deepEqual(user, expectedOutput);
  });

  it('should return undefined with an invalid email', () => {
    const user = getUserByEmail(testUsers, "invalid@example.com");
    const expectedOutput = undefined;
    assert.equal(user, expectedOutput);
  });
});

describe('urlsForUser', () => {
  it('should return the users own created urls', () => {
    const urls = urlsForUser(testUrlDatabase, "abcdef");
    const expectedOutput = {
      "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "abcdef"}
    };
    assert.deepEqual(urls, expectedOutput);
  });

  it('should return an empty object for users with no urls created', () => {
    const urls = urlsForUser(testUrlDatabase, "asd123");
    const expectedOutput = {};
    assert.deepEqual(urls, expectedOutput);
  });
});