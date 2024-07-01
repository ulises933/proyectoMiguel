const mongoose = require('mongoose');

const FolioSuatSchema = new mongoose.Schema({
  Autotransporte: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Autotransporte',
    required: true
  },
  FiguraTransporte: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conductor',
    required: true
  },
  FolioSuat: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('FolioSuat', FolioSuatSchema);
