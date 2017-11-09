module.exports = function(mongoose) {
  var module = {};
  var models = require('./db/models.js')(mongoose);

  module.getUsers = function(callback) {
    models.User.find(function(err, users) {
      if (err) {
        return callback(err);
      }
      return callback(users);
    });
  }

  module.getUserById = function(id, callback) {
    models.User.findById(id, function(err, user) {
      if (err) {
        return callback(err);
      }
      return callback(user);
    });
  }

  module.getUserByName = function(username, callback) {
    models.User.findOne({username: username}, function(err, user) {
      return callback(err, user);
    });
  }

  module.updateUser = function(id, update, callback) {
    models.User.findById(id, function(err, user) {
      if (err) {
        return callback(err);
      }
      user.name = update.name;
      user.events = update.events;
      user.save(function(err, user) {
        if (err) {
          return callback(err);
        }
        return callback({
          message: "User successfully updated",
          data: user
        });
      });
    });
  }

  module.getUserEvents = function(user_id, callback) {
    models.User.findById(user_id, function(err, user) {
      if (err) {
        return callback(err);
      }
      var nextLevelCallback = callback;
      console.log("Found User " + user);
      models.Event.find({participants: user.id})
        .populate('items', ['label', 'cost', 'assigned_to'])
        .exec(function(err, events) {
          if (err) {
            return nextLevelCallback(err);
          }
          console.log("Found events " + events);
          return nextLevelCallback(events);
        });
    });
  }

  module.getEvents = function(callback) {
    models.Event.find()
      .populate('items', ['label', 'cost', 'assigned_to'])
      .exec(function(err, events) {
        if (err) {
          return callback(err);
        }
        return callback(events);
      });
  }

  module.createEvent = function(eventdata, callback) {
    console.log("Creating from eventdata:" + JSON.stringify(eventdata));
    var event = new models.Event({
      name: eventdata.name,
      date: eventdata.date,
      participants: eventdata.participants,
      creator: eventdata.creator,
      notes: eventdata.notes,
      items: [] // initialize empty
    });
    if (eventdata.items) {
      for (var i = 0; i < eventdata.items.length; i++) {
        var item = new models.Item(eventdata.items[i]);
        item.event = event.id;
        item.save();
      }
    }
    event.save(function(err, event) {
      if (err) {
        return callback(err);
      }
      var nextLevelCallback = callback;
      models.Event.findById(event.id)
        .populate('items', ['label', 'cost', 'assigned_to'])
        .exec(function(err, res) {
          if (err) {
            return nextLevelCallback(err);
          }
          return nextLevelCallback({
            message: "Event successfully created",
            event: res
          });
        })
    });
  }

  module.getEventById = function(id, callback) {
    models.Event.findById(id)
      .populate({
        path: 'items',
        select: ['label', 'assigned_to', 'cost'],
        populate: {
          path: 'assigned_to',
          select: ['name']
        }
      })
      .populate({
        path: 'participants',
        select: ['name']
      })
      .populate({
        path: 'creator',
        select: ['name']
      })
      .exec(function(err, event) {
        if (err) {
          return callback(err);
        }
        return callback(event);
      }
    );
  }

  module.updateEvent = function(id, update, callback) {
    models.Event.findByIdAndUpdate(
      id,
      {$set: update}, // override all fields that are present in request
      {new: true}, // return updated version
      function(err, event) {
        if (err) {
          return callback(err);
        }
        return callback(event);
    });
  }

  module.deleteEvent = function(id, callback) {
    models.Event.findByIdAndRemove(id, function(err, event) {
      if (err) {
        return callback(err);
      }
      return callback({
        message: "Event successfully deleted",
        event: event
      });
    })
  }

  module.addParticipant = function(event_id, user_id, callback) {
    models.User.findById(user_id, function(err, user) {
      if (err) {
        return callback(err);
      }
      var nextLevelCallback = callback;
      models.Event.findByIdAndUpdate(
        event_id,
        {$addToSet: {participants: user.id}},
        {new: true},
        function(err, event) {
          if (err) {
            return nextLevelCallback(err);
          }
          return nextLevelCallback(event);
        });
    })
  }

  module.removeParticipant = function(event_id, user_id, callback) {
    models.User.findById(user_id, function(err, user) {
      if (err) {
        return callback(err);
      }
      var nextLevelCallback = callback;
      models.Event.findByIdAndUpdate(
        event_id,
        {$pull: {participants: user.id}},
        {new: true},
        function(err, event) {
          if (err) {
            return nextLevelCallback(err);
          }
          return nextLevelCallback(event);
        });
    })
  }

  module.getItems = function(callback) {
    models.Item.find(function(err, items) {
      if (err) {
        return callback(err);
      }
      return callback(items);
    });
  }

  module.createItem = function(itemdata, callback) {
    var item = new models.Item(itemdata);
    item.save(function(err, item) {
      if (err) {
        return callback(err);
      }
      return callback({
        message: "Item successfully created",
        item: item
      });
    })
  }

  module.deleteItem = function(id, callback) {
    models.Item.findByIdAndRemove(id, function(err, item) {
      if (err) {
        return callback(err);
      }
      return callback({
        message: "Item successfully deleted",
        item: item
      });
    });
  }

  module.updateItem = function(id, update, callback) {
    models.Item.findByIdAndUpdate(
      id,
      {$set: update}, // override all fields that are present in request
      {new: true}, // return updated version
      function(err, item) {
        if (err) {
          return callback(err);
        }
        return callback(item);
    });
  }

  module.shutdown = function() {
    mongoose.disconnect(function() {
      console.log("Disconnected from DB");
    })
  }

  module.mongoose = mongoose;
  module.models = models;

  return module;
}
