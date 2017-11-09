var fs = require('fs');
var mongoose = require('mongoose');
var url = "mongodb://localhost:27017/test";

console.log("Connecting to db with URL '" + url + "'");

mongoose.Promise = global.Promise;

var api = require("../backend/db-functions.js")(mongoose);
var assert = require("chai").assert;
var user1 = new api.models.User();
var user2 = new api.models.User();
var event1 = new api.models.Event();
var event2 = new api.models.Event();
var item1 = new api.models.Item();
var item2 = new api.models.Item();

// connect to DB
before(function(done) {
  setTimeout(function() {
    mongoose.connect(url);
    mongoose.connection.on('connected', function() {
      console.log("Connected to DB");
      done();
    });
    mongoose.connection.on('error', function(err) {
      console.log(err);
    });
    mongoose.connection.on('disconnected', function() {
      console.log("Disconnected from DB");
    });
  }, 100);
});

// drop and populate database
before(function(done) {
  this.timeout(6000);
  setTimeout(function() {
    mongoose.connection.dropDatabase(function(err) {
      if (err) { done(err); }

      user1.name = "User1";
      user1.username = "fancy-username";
      user1.password = "test";

      user2.name = "User2";
      user2.username = "another-unique-nickname";
      user2.password = "test";

      event1.name = "Event1";
      event1.participants = [user1.id];
      event1.items = [item1, item2];

      event2.name = "Event2";
      event2.participants = [user1.id, user2.id];

      item1.label = "AssignedItem";
      item1.assigned_to = user2.id;
      item2.label = "UnassignedItem";

      user1.save();
      event1.save();
      user2.save();
      event2.save();
      item1.save();
      item2.save();

      done();
    })
  }, 1000);
});

describe('Check DB setup', function() {
  this.timeout(6000);
  it('should contain two users', function(done) {
    api.models.User.find({}, function(err, res) {
      if (err) { done(err); }
      assert.equal(2, res.length);
      done();
    });
  });
  it('should contain two events', function(done) {
    api.models.Event.find({}, function(err, res) {
      if (err) { done(err); }
      assert.equal(2, res.length);
      done();
    });
  });
  it('should contain two items', function(done) {
    api.models.Item.find({}, function(err, res) {
      if (err) { done(err); }
      assert.equal(2, res.length);
      done();
    });
  });
})

describe('API Tests', function() {
  describe('Users', function() {
    describe.skip('.getUsers()', function() {
      it('should return all users', function() {

      });
    });
    describe('.getUserById()', function() {
      it('should return user with given id', function(done) {
        var id = user1.id;
        api.getUserById(id, function(data) {
          assert.equal("User1", data.name);
          done();
        });
      });
      it('should return error for invalid id', function(done) {
        // TODO: actually, let db-functions handle this error
        api.getUserById("abc", function(data) {
          assert.isDefined(data.message); // if data was a user, reason wouldn't be a field
          done();
        });
      });
    });
    describe.skip('.createUser() - not implemented yet', function() {
      it('should create a user', function() {

      });
      it('should not allow duplicate username', function() {

      });
    });
    describe.skip('.updateUser()', function() {
      it('should update a user', function() {

      });
      it('should not allow duplicate username', function() {

      });
      it('should update affected events', function() {
        // i.e. update event participants
      });
    });
  });

  describe('Events', function() {
    describe('.getEvents()', function() {
      it('should return all events', function(done) {
        api.getEvents(function(data) {
          assert.equal(2, data.length);
          done();
        });
      });
    });
    describe.skip('.getEventById()', function() {
      it('should return event with given id', function(done) {

      });
    });
    describe.skip('.getUserEvents()', function() {
      it('should return user\'s events', function(done) {
        done();
      });
    });
    describe.skip('.createEvent()', function() {
      it('should create event', function() {

      });
      it('should validate date', function() {
        // not to be in the past etc;
      });
    });
    describe.skip('.updateEvent()', function() {
      it('should update event with given id', function() {

      });
      it('should update affected users', function() {
        // i.e. if participants change, user.events needs to change, too;
      });
      it.skip('should only be possible for ?', function() {
        // TODO: requires sophisticated auth
        // discuss: possible for creator or participant?
      });
    });
    describe.skip('.deleteEvent()', function() {
      it('should delete event', function() {

      });
      it('should update affected users', function() {

      });
      // TODO: should it really? maybe reconsider
      it('should delete respective items', function() {

      });
    });
    describe('.addParticipant()', function() {
      before(function(done) {
        assert.notInclude(event1.participants, user2.id, 'user2 is not yet participant');
        api.models.Event.findById(event1.id, function(err, event) {
          if (err) { done(err); }
          assert.notInclude(event.participants, user2.id, 'user2 is not yet participant');
          done();
        });
      });
      it('should add given User as participant to given Event', function(done) {
        api.addParticipant(event1.id, user2.id, function(data) {
          assert.equal(data.id, event1.id, 'returned data is our event');
          assert.include(data.participants, user2.id, 'user2 is now a participant (in returned data)');
          done();
        });
      });
    });
    describe('.removeParticipant()', function() {
      before(function(done) {
        assert.include(event2.participants, user2.id, 'user2 is participant');
        api.models.Event.findById(event2.id, function(err, event) {
          if (err) { done(err); }
          assert.include(event.participants, user2.id, 'user2 is participant');
          done();
        });
      });
      it('should remove given User as participant from given Event', function(done) {
        api.removeParticipant(event2.id, user2.id, function(data) {
          assert.equal(data.id, event2.id, 'returned data is our event');
          assert.notInclude(data.participants, user2.id, 'user2 is not a participant anymore (in returned data)');
          done();
        });
      });
    });
  });

  after(function(done) {
    mongoose.disconnect(function() {
      done();
    });
  });
});
