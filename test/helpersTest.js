const { assert } = require('chai');

const { uniqueEmailChecker } = require('../helpers.js');

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

describe('uniqueEmailChecker', function() {
  
  it('should return a user with valid email', function() {
    const user = uniqueEmailChecker("user@example.com", testUsers)
    const expectedOutput = "userRandomID";
    assert.equal(user, expectedOutput);
  });
  
  it('should return false if the email is not registered in the database', function() {
    const user = uniqueEmailChecker("who@example.com", testUsers)
    const expectedOutput = false;
    assert.equal(user, expectedOutput);
  });
});