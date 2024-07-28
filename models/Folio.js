const mongoose = require('mongoose');

const folioSuatSchema = new mongoose.Schema({
  Autotransporte: { type: mongoose.Schema.Types.ObjectId, ref: 'Autotransporte', required: true },
  FiguraTransporte: { type: mongoose.Schema.Types.ObjectId, ref: 'Conductor', required: true },
  FolioSuat: { type: String, required: true },
  FleteBase: { type: String, required: true },
  Casetas: { type: String, require: true },
  Diesel: { type: String , required: true},
  Stops: { type: String, required: true},
  Total: { type:String, reuired: true}
});

const FolioSuat = mongoose.model('FolioSuat', folioSuatSchema);

module.exports = FolioSuat;
