const mongoose = require('mongoose');

const ConductorSchema = new mongoose.Schema({
  TipoFigura: {
    type: String,
    required: true
  },
  RFCFigura: {
    type: String,
    required: true
  },
  NumLicencia: {
    type: String,
    required: true
  },
  NombreFigura: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Conductor', ConductorSchema);
