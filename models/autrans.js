const mongoose = require('mongoose');

const IdentificacionVehicularSchema = new mongoose.Schema({
  ConfigVehicular: {
    type: String,
    required: true
  },
  PesoBrutoVehicular: {
    type: String,
    required: true
  },
  PlacaVM: {
    type: String,
    required: true
  },
  AnioModeloVM: {
    type: String,
    required: true
  }
});

const SegurosSchema = new mongoose.Schema({
  AseguraRespCivil: {
    type: String,
    required: true
  },
  PolizaRespCivil: {
    type: String,
    required: true
  }
});

const RemolqueSchema = new mongoose.Schema({
  SubTipoRem: {
    type: String,
    required: true
  },
  Placa: {
    type: String,
    required: true
  }
});

const AutotransporteSchema = new mongoose.Schema({
  PermSCT: {
    type: String,
    required: true
  },
  NumPermisoSCT: {
    type: String,
    required: true
  },
  IdentificacionVehicular: {
    type: IdentificacionVehicularSchema,
    required: true
  },
  Seguros: {
    type: SegurosSchema,
    required: true
  },
  Remolques: {
    Remolque: [RemolqueSchema]
  }
});

module.exports = mongoose.model('Autotransporte', AutotransporteSchema);
