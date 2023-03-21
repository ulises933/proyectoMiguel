const express = require('express');
const router = express.Router();
const Joi = require('joi');

const schema = Joi.object({
    FechaProcesamiento: Joi.string().isoDate().required(),
    PlantaProcesamiento: Joi.string().max(4000).required(),
    Usuario: Joi.string().max(150).required(),
    TipoDocumento: Joi.string().max(150).required(),
    NumeroOperacion: Joi.number().integer().required(),
    TipoViaje: Joi.string().valid('N', 'I', 'E').required(),
    TipoMovimiento: Joi.string().valid('A', 'T', 'M', 'F').required(),
    Ubicaciones: Joi.array().items(
        Joi.object({
            TipoEstacion: Joi.string().max(10).required(),
            DistanciaRecorrida: Joi.number().precision(6).required(),
            Origen: Joi.object({
                IDOrigen: Joi.string().max(50).required(),
                RFCRemitente: Joi.string().max(50).required(),
                NombreRemitente: Joi.string().max(250).required(),
                NumRegIdTribRemitente: Joi.string().max(50).required(),
                ResidenciaFiscalRemitente: Joi.string().max(50).required(),
                NumeroEstacionRemitente: Joi.string().max(50).required(),
                NombreEstacionRemitente: Joi.string().max(250).required(),
                NavegacionTraficoRemitente: Joi.string().max(50).required(),
                FechaHoraSalidaRemitente: Joi.string().isoDate().required(),
                Domicilio: Joi.object({
                    Calle: Joi.string().max(250).required(),
                    NumeroExterior: Joi.string().max(10).required(),
                    NumeroInterior: Joi.string().max(10).required(),
                    Colonia: Joi.string().max(10).required(),
                    Localidad: Joi.string().max(10).required(),
                    Referencia: Joi.string().max(250).required(),
                    Municipio: Joi.string().max(10).required(),
                    Estado: Joi.string().max(10).required(),
                    Pais: Joi.string().max(10).required(),
                    CodigoPostal: Joi.string().max(10).required(),
                }).required(),
            }).required(),
            Destino: Joi.array().items(
                Joi.object({
                    IDDestino: Joi.string().max(50).required(),
                    RFCDestinatario: Joi.string().max(50).required(),
                    NombreDestinatario: Joi.string().max(250).required(),
                    NumRegIdTribDestinatario: Joi.string().max(50).required(),
                    ResidenciaFiscalDestinatario: Joi.string().max(50).required(),
                    NumeroEstacionDestinatario: Joi.string().max(50).required(),
                    NombreEstacionDestinatario: Joi.string().max(250).required(),
                    NavegacionTraficoDestinatario: Joi.string().max(50).required(),
                    FechaHoraSalidaDestinatario: Joi.string().isoDate().required(),
                    Domicilio: Joi.object({
                        Calle: Joi.string().max(250).required(),
                        NumeroExterior: Joi.string().max(10).required(),
                        NumeroInterior: Joi.string().max(10).required(),
                        Colonia: Joi.string().max(10).required(),
                        Localidad: Joi.string().max(10).required(),
                        Referencia: Joi.string().max(250).required(),
                        Municipio: Joi.string().max(10).required(),
                        Estado: Joi.string().max(10).required(),
                        Pais: Joi.string().max(10).required(),
                        CodigoPostal: Joi.string().max(10).required(),
                    }).required(),
                    Mercancias: Joi.array().items(
                        Joi.object({
                            NumeroContenedor: Joi.string().max(12).allow('').required(),
                            PesoBrutoTotal: Joi.number().precision(6).required(),
                            UnidadPeso: Joi.string().max(150).required(),
                            PesoNetoTotal: Joi.number().precision(6).required(),
                            NumTotalMercancias: Joi.number().precision(6).required(),
                        })),
                    Mercancias: Joi.array().items(
                        Joi.object({
                            NumeroContenedor: Joi.string().max(12).allow('').required(),
                            BienesTransp: Joi.string().max(150).allow('').required(),
                            TamañoContenedor: Joi.string().max(4).required(),
                            ClaveSTCC: Joi.string().max(150).required(),
                            Descripcion: Joi.string().max(500).required(),
                            Cantidad: Joi.number().precision(6).required(),
                            ClaveUnidad: Joi.string().max(150).required(),
                            Unidad: Joi.string().max(150).required(),
                            MaterialPeligroso: Joi.string().max(150).required(),
                            CveMaterialPeligroso: Joi.string().max(150).required(),
                            Embalaje: Joi.string().max(150).required(),
                            DescripEmbalaje: Joi.string().max(500).required(),
                            PesoEnKg: Joi.number().precision(6).required(),
                            CantidadTransporta: Joi.array().items(
                                Joi.object({
                                    CantidadTrans: Joi.number().precision(6).required(),
                                    IDOrigen: Joi.string().max(150).required(),
                                    IDDestino: Joi.string().max(150).required(),
                                    DetalleMercancia: Joi.array().items(
                                        Joi.object({
                                            UnidadPeso: Joi.string().max(5).required(),
                                            PesoBruto: Joi.number().precision(6).required(),
                                            PesoNeto: Joi.number().precision(6).required(),
                                            PesoTara: Joi.number().precision(6).required(),
                                        })),//Fin Detalle de mercancia
                                    DetalleFactura: Joi.array().items(
                                        Joi.object({
                                            NumeroFactura: Joi.string().max(50).required(),
                                            NumeroParte: Joi.string().max(50).required(),
                                            Descripcion: Joi.string().max(1000).required(),
                                            PesoNeto: Joi.number().precision(6).required(),
                                            PesoTara: Joi.number().precision(6).required(),
                                            Pedimento: Joi.string().max(21).required(),
                                            FraccionArancelaria: Joi.string().max(50).required(),
                                            Cantidad: Joi.number().precision(6).required(),
                                        })),//Fin Detalle Factura
                                })),//Fin Detalle Mercancia
                            Contenedor: Joi.array().items(
                                Joi.object({
                                    BL: Joi.string().max(16).required(),
                                    Buque: Joi.string().max(30).required(),
                                    BuyerCode: Joi.string().max(6).required(),
                                    PackingList: Joi.string().max(6).required(),
                                    ProveedorLogistico: Joi.string().max(3).required(),
                                }))
                        }))//Fin de Mercancias
                }))
        }))
})

      

module.exports = dataSchema;
router.post('/', (req, res) => {
  // Obtenemos el token de autorización del header
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    // Si el token no se encuentra en el header, devolvemos un error 401
    return res.status(401).json({ error: 'No se proporcionó un token de autorización' });
  }
  const { error, value } = schema.validate(req.body);
if (error) {
  // Si los datos no cumplen con el schema, generar un mensaje de error
  const errorMessage = {
    success: false,
    data: null,
    errors: [{
      code: '400',
      source: 'Bad Request',
      title: 'Bad Request',
      detail: error.details[0].message
    }]
  };
  return res.status(400).json(errorMessage);
}

// Procesar los datos y determinar si la operación fue exitosa o no
const processedData = processData(value);

let success = false;
let message = '';
let errors = [];

if (processedData.successful) {
  // Si se procesaron todos los datos exitosamente
  success = true;
  message = 'Se procesó exitosamente';
} else if (processedData.partial) {
  // Si algunos datos no pudieron ser procesados correctamente
  success = true;
  message = 'Se procesó parcialmente';

  // Agregar los errores al mensaje de salida
  processedData.errors.forEach(error => {
    errors.push({
      code: '400',
      source: 'Bad Request',
      title: `NumeroOperacion ${error.NumeroOperacion}`,
      detail: error.message
    });
  });
} else {
  // Si no se encontraron datos relacionados o hubo un error completo
  success = false;
  message = 'No se encontraron datos relacionados';
  errors.push({
    code: '400',
    source: 'Bad Request',
    title: 'Bad Request',
    detail: 'No se tiene el formato esperado'
  });
}

// Generar el mensaje de salida con la información requerida
const outputMessage = {
  success,
  data: { message },
  errors
};

return res.status(200).json(outputMessage);
  



  res.status(200).json({ message: 'Datos procesados correctamente' });
});

module.exports = route