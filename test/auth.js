var auth = require('../backend/auth/auth.js');
var assert = require("chai").assert;

var validTokens = ["1234", "5678", "abcd", "efgh"];
function isValidToken(token) {
  for (var i = 0; i < validTokens.length; i++) {
    // TODO: adjust when actual token mechanism is being used
    if (token == validTokens[i]) {
      return true;
    }
  }
  return false;
}

describe('Test password hashing', function() {
  it('(same password should lead to same hash', function() {
    var pw1 = "MeinPassword1";
    var pw2 = "MeinPassword1";
    var hash1 = auth.hash(pw1);
    var hash2 = auth.hash(pw2);
    assert.equal(hash1, hash2, "Hashes are equal");
  });
  it.skip('different passwords should lead to different hash', function() {
    // actually not necessary to test hash functions of a well-known library
  });
});

describe('Test generateToken()', function() {
  it('should generate a valid token', function() {
    var token = auth.generateToken();
    assert.isTrue(isValidToken(token), token + " is a valid token");
  });
  it.skip('token should expire, and so on...', function() {

  });
});

describe('Test checkToken()', function() {
  it('should validate a correct token', function() {
    var validToken = validTokens[0];
    assert.isTrue(auth.checkToken(validToken), "corrctly validated " + validToken);
  });
  it('should not validate a fake token', function() {
    var invalidToken = "some invalid token";
    assert.isFalse(auth.checkToken(invalidToken), "corrctly rejected " + invalidToken);
  });
});
