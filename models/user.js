const passportLocalMongoose  = require('passport-local-mongoose'),
      mongoose               = require('mongoose'),
      express                = require('express');

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  dob: Date,
  address: {
    street: String,
    city: String,
    postCode: String,
    country: String
  },
  interests: Object
});

// Adds the needed passport methods to Schema
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);
