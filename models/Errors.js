const mongoose = require('mongoose');
const ErrorLogSchema = new mongoose.Schema({
  success: Boolean,
  data: [{
    folio: String,
    errorDetail: [{ message: String }],
  }],
  errors: [{
    code: String,
    title: String,
    detail: String,
  }],
});

module.exports = mongoose.model('ErrorLog', ErrorLogSchema);