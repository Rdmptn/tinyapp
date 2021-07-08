let uniqueEmailChecker = function(email, database) {
  for (let user in database) {
    if (database[user].email === email) {
      return user;
    }
  }
  return false;
};

module.exports = { uniqueEmailChecker };