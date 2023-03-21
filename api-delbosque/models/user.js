const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  participanteName: String,
  password: String
});

const User = mongoose.model('User', userSchema);

module.exports = User;
