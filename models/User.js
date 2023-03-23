// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  ParticipanteName: { type: String, required: true },
  Password: { type: String, required: true },
});

module.exports = mongoose.model("User", userSchema);
