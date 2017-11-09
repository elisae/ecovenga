var validTokens = [
  "1234",
  "5678",
  "abcd",
  "efgh"
]; // TODO: use actual auth token mechanism;

function generateToken() {
  var i = Math.floor(Math.random() * 4);
  return validTokens[i];
}

function checkToken(authToken) {
  if (!authToken || !validTokens.includes(authToken)) {
    return false;
  }
  return true;
}

function hash(password) {
  // TODO: actually hash
  return password;
}

module.exports = {generateToken, hash, checkToken};
