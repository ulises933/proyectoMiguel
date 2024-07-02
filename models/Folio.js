const mongoose = require('mongoose');

const folioSuatSchema = new mongoose.Schema({
  Autotransporte: { type: mongoose.Schema.Types.ObjectId, ref: 'Autotransporte', required: true },
  FiguraTransporte: { type: mongoose.Schema.Types.ObjectId, ref: 'Conductor', required: true },
  FolioSuat: { type: String, required: true }
});

const FolioSuat = mongoose.model('FolioSuat', folioSuatSchema);

module.exports = FolioSuat;
