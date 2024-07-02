const mongoose = require('mongoose');

const folioSchema = new mongoose.Schema({
  Folio: { 
    type: String, 
    required: true, 
    unique: true 
  }
});

const FolioAux = mongoose.model('FolioAux', folioSchema);

module.exports = FolioAux;
