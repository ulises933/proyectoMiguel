const Joi = require('joi');

const fecha = Joi.string().isoDate().required();

const plantaProcesamiento = Joi.string().max(4000).required();

const usuario = Joi.string().max(150).required();

const tipoDocumento = Joi.string().max(150).required();

const numeroOperacion = Joi.number().integer().required();

const tipoViaje = Joi.string().valid('N', 'I', 'E').required();

const tipoMovimiento = Joi.string().valid('A', 'T', 'M', 'F').required();

const ubicacion = Joi.object({
  latitud: Joi.number().required(),
  longitud: Joi.number().required(),
});

const tipoEstacion = Joi.string().max(10).required();

const distanciaRecorrida = Joi.number().precision(6).required();

const nodo = Joi.object({
  id: Joi.string().max(50).required(),
  rfc: Joi.string().max(50).required(),
  nombre: Joi.string().max(250).required(),
  numRegIdTrib: Joi.string().max(50).required(),
  residenciaFiscal: Joi.string().max(50).required(),
  numEstacion: Joi.string().max(50).required(),
  nombreEstacion: Joi.string().max(250).required(),
  navegacionTrafico: Joi.string().max(50).required(),
  fechaHoraSalida: Joi.string().isoDate().required(),
  domicilio: Joi.object({
    calle: Joi.string().max(250).required(),
    numExt: Joi.string().max(10).required(),
    numInt: Joi.string().max(10).required(),
    colonia: Joi.string().max(10).required(),
    localidad: Joi.string().max(10).required(),
    referencia: Joi.string().max(250).required(),
    municipio: Joi.string().max(10).required(),
    estado: Joi.string().max(10).required(),
    pais: Joi.string().max(10).required(),
    codigoPostal: Joi.string().max(10).required(),
  }).required(),
}).required();

const numeroContenedor = Joi.string().max(12).required();

const pesoBrutoTotal = Joi.number().precision(6).required();

const unidadPeso = Joi.string().max(150).required();

const pesoNetoTotal = Joi.number().precision(6).required();

const numTotalMercancias = Joi.number().precision(6).required();

const uuid = Joi.string().guid().required();

const mercancia = Joi.object({
  numeroContenedor: Joi.string().max(12).required(),
  bienesTransp: Joi.string().max(150).required(),
  tamanoContenedor: Joi.string().max(4),
  claveSTCC: Joi.string().max(150).required(),
  descripcion: Joi.string().max(500).required(),
  cantidad: Joi.number().precision(6).required(),
  claveUnidad: Joi.string().max(150).required(),
  unidad: Joi.string().max(150).required(),
  materialPeligroso: Joi.string().max(150),
  cveMaterialPeligroso: Joi.string().max(150),
  embalaje: Joi.string().max(150).required(),
  descripEmbalaje: Joi.string().max(500).required(),
  pesoEnKg: Joi.number().precision(6).required(),
}).required();

const cantidadTransporta = Joi.object({
  cantidadTrans: Joi.number().precision(6).required(),
  idOrigen: Joi.string().max(150).required(),
  idDestino: Joi.string().max(150).required(),
  });
  const detalleMercancia = Joi.object({
    unidadPeso: Joi.string().max(5).required(),
    pesoBruto: Joi.number().precision(6).required(),
    pesoNeto: Joi.number().precision(6).required(),
    pesoTara: Joi.number().precision(6).required(),
    }).required();
    
    const detalleFactura = Joi.object({
    numeroFactura: Joi.string().max(50),
    numeroParte: Joi.string().max(50),
    descripcion: Joi.string().max(1000),
    pesoNeto: Joi.number().precision(6),
    pesoTara: Joi.number().precision(6),
    pedimento: Joi.string().max(21),
    fraccionArancelaria: Joi.string().max(50),
    cantidad: Joi.number().precision(6),
    }).required();
    
    const contenedor = Joi.object({
    bookingConfirmation: Joi.string().max(12),
    buque: Joi.string().max(30).required(),
    buyerCode: Joi.string().max(6).required(),
    packingList: Joi.string().max(6).required(),
    proveedorLogistico: Joi.string().max(3).required(),
    }).required();
    
    const schemaExpo = Joi.object({
    fechaProcesamiento: fecha,
    plantaProcesamiento,
    usuario,
    tipoDocumento,
    numeroOperacion,
    tipoViaje,
    tipoMovimiento,
    ubicaciones: Joi.array().items(ubicacion).required(),
    tipoEstacion,
    distanciaRecorrida,
    origen: nodo,
    idOrigen: Joi.string().max(50).required(),
    rfcRemitente: Joi.string().max(50).required(),
    nombreRemitente: Joi.string().max(250).required(),
    numRegIdTribRemitente: Joi.string().max(50).required(),
    residenciaFiscalRemitente: Joi.string().max(50).required(),
    numeroEstacionRemitente: Joi.string().max(50).required(),
    nombreEstacionRemitente: Joi.string().max(250).required(),
    navegacionTraficoRemitente: Joi.string().max(50).required(),
    fechaHoraSalidaRemitente: Joi.string().isoDate().required(),
    domicilioRemitente: Joi.object({
    calle: Joi.string().max(250).required(),
    numeroExterior: Joi.string().max(10).required(),
    numeroInterior: Joi.string().max(10).required(),
    colonia: Joi.string().max(10).required(),
    localidad: Joi.string().max(10).required(),
    referencia: Joi.string().max(250).required(),
    municipio: Joi.string().max(10).required(),
    estado: Joi.string().max(10).required(),
    pais: Joi.string().max(10).required(),
    codigoPostal: Joi.string().max(10).required(),
    }).required(),
    destino: Joi.array().items(nodo).required(),
    idDestino: Joi.string().max(50).required(),
    rfcDestinatario: Joi.string().max(50).required(),
    nombreDestinatario: Joi.string().max(250).required(),
    numRegIdTribDestinatario: Joi.string().max(50).required(),
    residenciaFiscalDestinatario: Joi.string().max(50).required(),
    numeroEstacionDestinatario: Joi.string().max(50).required(),
    nombreEstacionDestinatario: Joi.string().max(250).required(),
    navegacionTraficoDestinatario: Joi.string().max(50).required(),
    fechaHoraSalidaDestinatario: Joi.string().isoDate().required(),
    domicilioDestinatario: Joi.object({
    calle: Joi.string().max(250).required(),
    numeroExterior: Joi.string().max(10).required(),
    numeroInterior: Joi.string().max(10).required(),
    colonia: Joi.string().max(10).required(),
    localidad: Joi.string().max(10).required(),
    referencia: Joi.string().max(250).required(),
    municipio: Joi.string().max(10).required(),
    estado: Joi.string().max(10).required(),
    pais: Joi.string().max(10).required(),
    codigoPostal: Joi.string().max(10).required(),
    }).required(),
    mercancias: Joi.array().items(mercancia).required(),
    numeroContenedor: Joi.string().max(12).required(),
    pesoBrutoTotal: Joi.number().precision(6).required(),
    unidadPeso: Joi.string().max(150).required(),
    pesoNetoTotal: Joi.number().precision(6).required(),
    numTotalMercancias: Joi.number().precision(6).required(),
    uuid: Joi.string().guid().optional(),
    mercancia: Joi.array().items(detalleMercancia).required(),
    numeroContenedor: Joi.string().max(12).required(),
    bienesTransp: Joi.string().max(150).required(),
    tamanoContenedor: Joi.string().max(4),
    claveSTCC: Joi.string().max(150),
    descripcion: Joi.string().max(500),
    cantidad: Joi.number().precision(6),
    claveUnidad: Joi.string().max(150),
    unidad: Joi.string().max(150),
    materialPeligroso: Joi.string().max(150),
    cveMaterialPeligroso: Joi.string().max(150),
    embalaje: Joi.string().max(150),
    descripEmbalaje: Joi.string().max(500),
    pesoEnKg: Joi.number().precision(6),
    cantidadTransporta: Joi.array().items(cantidadTrans).required(),
    cantidadTrans: Joi.number().precision(6).required(),
    idOrigen: Joi.string().max(150),
    idDestino: Joi.string().max(150),
    detalleMercancia: Joi.array().items(detalleMercancia).required(),
    unidadPeso: Joi.string().max(5).required(),
    pesoBruto: Joi.number().precision(6).required(),
    pesoNeto: Joi.number().precision(6).required(),
    pesoTara: Joi.number().precision(6).required(),
    detalleFactura: Joi.array().items(detalleFactura),
    numeroFactura: Joi.string().max(50),
    numeroParte: Joi.string().max(50),
    descripcion: Joi.string().max(1000),
    pesoNeto: Joi.number().precision(6),
    pesoTara: Joi.number().precision(6),
    pedimento: Joi.string().max(21),
    fraccionArancelaria: Joi.string().max(50),
    cantidad: Joi.number().precision(6),
    contenedor: Joi.array().items(contenedor),
    bookingConfirmation: Joi.string().max(12),
    buque: Joi.string().max(30).required(),
    buyerCode: Joi.string().max(6).required(),
    packingList: Joi.string().max(6).required(),
    proveedorLogistico: Joi.string().max(3).required(),});
module.exports = schemaExpo;
    
    
    
    
