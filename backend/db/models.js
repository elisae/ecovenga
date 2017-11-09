module.exports = function(mongoose) {

  var ItemSchema = new mongoose.Schema({
      // _id is implicit
      label: String,
      // TODO: find out how to link
      assigned_to: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      },
      event: {
        type: mongoose.Schema.ObjectId,
        ref: 'Event'
      },
      cost: Number
      // TODO: isAssigned() function
  });

  ItemSchema.post('save', function(item) {
    models.Event.findByIdAndUpdate(
      item.event,
      {$addToSet: {items: item.id}},
      {new: true},
      function(err, event) {
        if (err) {
          console.log(err);
        }
      }
    );
  });

  ItemSchema.post('remove', function(item) {
    models.Event.findByIdAndUpdate(
      item.event,
      {$pull: {items: item.id}},
      {new: true},
      function(err, event) {
        if (err) {
          console.log(err);
        }
      }
    );
  });

  var EventSchema = new mongoose.Schema({
      // _id is implicit
      name: String,
      date: Date,
      participants: [{
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }],
      items: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Item'
      }],
      notes: String,
      creator: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }
  });

  EventSchema.post('remove', function(event) {
    if (event.participants) {
      models.User.update(
        {_id: {$in: event.participants}},
        {$pull: {events: event.id}},
        function(err, raw) {
          if (err) {
            console.log(err);
          }
        }
      );
    }
  });

  EventSchema.post('save', function(event) {
    if (event.participants) {
      models.User.update(
        {_id: {$in: event.participants}},
        {$addToSet: {events: event.id}},
        function(err, raw) {
          if (err) {
            console.log(err);
          }
        }
      );
    }
  })

  var UserSchema = new mongoose.Schema({
      // _id is implicit
      name: String,
      username: { type: String, unique: true },
      password: String,
      events: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Event'
      }]
  });

  var models = {
    User: mongoose.model('User', UserSchema),
    Event: mongoose.model('Event', EventSchema),
    Item: mongoose.model('Item', ItemSchema)
  }

  return models;
}
