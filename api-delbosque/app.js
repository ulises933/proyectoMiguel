const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const loginRouter = require('./routes/login');
const app = express();
const fs = require('fs');
const xml2js = require('xml2js');
const builders = new xml2js.Builder();
const builder = require('xmlbuilder');
const moment = require('moment');
const verifyToken = require('./middleware/authMiddleware');



app.use(express.json());

// Configuración de MongoDB
mongoose.connect('mongodb+srv://ulisesrdzmtz:VicenteCanuto93@cluster0.skyblhr.mongodb.net/Cluster0?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Conexión a la base de datos exitosa');
  })
  .catch((error) => {
    console.log('Error al conectar a la base de datos:', error);
  });

// Configuración de bodyParser
app.use(bodyParser.json());

// Rutas de la API
app.use('/api', loginRouter);
// Ejemplo para crear el json **********************************************************************************
async function ProcessDataCFDI(data) {
  try {
    // Validar datos de entrada
    const validationResult = validateInputData(data);
    if (!validationResult.isValid) {
      return {
        success: false,
        errors: validationResult.errors,
      };
    }

    // Crear el XML
    const xml = buildCartaPorteXML(data);

    return {
      success: true,
      xml: xml,
    };
  } catch (error) {
    console.error("Error al procesar los datos:", error);
    return {
      success: false,
      errors: ["Error al procesar los datos."],
    };
  }
}
// validate input
const Joi = require('joi');

function validateInputData(data) {
  const domicilioSchema = Joi.object({
    Calle: Joi.string().required(),
    NumeroExterior: Joi.string().required(),
    NumeroInterior: Joi.string(),
    Colonia: Joi.string().required(),
    Localidad: Joi.string().required(),
    Referencia: Joi.string(),
    Municipio: Joi.string().required(),
    Estado: Joi.string().required(),
    Pais: Joi.string().length(3).required(),
    CodigoPostal: Joi.string().length(5).required(),
  });

  const ubicacionSchema = Joi.object({
    TipoEstacion: Joi.string().length(2).required(),
    DistanciaRecorrida: Joi.number().required(),
    Origen: Joi.array()
      .min(1)
      .items(
        Joi.object({
          IDOrigen: Joi.string().required(),
          RFCRemitente: Joi.string().required(),
          NombreRemitente: Joi.string().required(),
          NumRegIdTribRemitente: Joi.string(),
          ResidenciaFiscalRemitente: Joi.string().length(3),
          NumeroEstacionRemitente: Joi.string(),
          NombreEstacionRemitente: Joi.string(),
          NavegacionTraficoRemitente: Joi.string(),
          FechaHoraSalidaRemitente: Joi.string().isoDate().required(),
          Domicilio: domicilioSchema,
        })
      )
      .required(),
    Destino: Joi.array()
      .min(1)
      .items(
        Joi.object({
          IDDestino: Joi.string().required(),
          RFCDestinatario: Joi.string().required(),
          NombreDestinatario: Joi.string().required(),
          NumRegIdTribDestinatario: Joi.string(),
          ResidenciaFiscalDestinatario: Joi.string().length(3),
          NumeroEstacionDestinatario: Joi.string(),
          NombreEstacionDestinatario: Joi.string(),
          NavegacionTraficoDestinatario: Joi.string(),
          FechaHoraSalidaDestinatario: Joi.string().isoDate().required(),
          Domicilio: domicilioSchema,
        })
      )
      .required(),
  });

  const mainSchema = Joi.object({
    FechaProcesamiento: Joi.string().isoDate().required(),
    PlantaProcesamiento: Joi.string(),
    Usuario: Joi.string().required(),
    TipoDocumento: Joi.string().valid("ComplementoCartaPorte").required(),
    NumeroOperacion: Joi.string().required(),
    TipoViaje: Joi.string().length(1).required(),
    TipoMovimiento: Joi.string().length(1).required(),
    Ubicaciones: Joi.array().min(1).items(ubicacionSchema).required(),
    // Aquí puedes agregar el resto de los esquemas de validación para Mercancias, Mercancia y Contenedor.
  });

  const validationResult = mainSchema.validate(data, { abortEarly: false });

  if (validationResult.error) {
    return {
      isValid: false,
      errors: validationResult.error.details.map((error) => error.message),
    };
  } else {
    return {
      isValid: true,
    };
  }
}
// funcion xml *************************************************************************************************}
//********************************************************************* */

function buildCartaPorteXML(data) {
  const { FechaProcesamiento, TipoDocumento, NumeroOperacion, TipoViaje, TipoMovimiento, Ubicaciones, Mercancias, Mercancia, Contenedor } = data[0];

  // Crear la estructura básica del XML
  const cartaPorte = builder.create("cfdi:Comprobante", { encoding: "UTF-8" });

  // Agregar atributos al nodo principal
  cartaPorte.att("xmlns:cfdi", "http://www.sat.gob.mx/cfd/3");
  cartaPorte.att("xmlns:xsi", "http://www.w3.org/2001/XMLSchema-instance");
  cartaPorte.att("xmlns:cartaporte", "http://www.sat.gob.mx/CartaPorte");
  cartaPorte.att("Fecha", moment(FechaProcesamiento).format("YYYY-MM-DDTHH:mm:ss"));
  cartaPorte.att("TipoDocumento", TipoDocumento);

  // Agregar el nodo Carta Porte
  const cartaPorteNode = cartaPorte.ele("cartaporte:CartaPorte");
  cartaPorteNode.att("Version", "2.0");
  cartaPorteNode.att("NumeroOperacion", NumeroOperacion);
  cartaPorteNode.att("TipoViaje", TipoViaje);
  cartaPorteNode.att("TipoMovimiento", TipoMovimiento);

  // Agregar el nodo Ubicaciones
  const ubicacionesNode = cartaPorteNode.ele("cartaporte:Ubicaciones");
  Ubicaciones.forEach((ubicacion) => {
    const { TipoEstacion, DistanciaRecorrida, Origen, Destino } = ubicacion;

    // Agregar el nodo Origen
    Origen.forEach((origen) => {
      const origenNode = ubicacionesNode.ele("cartaporte:Origen", {
        TipoEstacion: TipoEstacion,
        DistanciaRecorrida: DistanciaRecorrida,
        IDOrigen: origen.IDOrigen,
        RFCRemitente: origen.RFCRemitente,
        NombreRemitente: origen.NombreRemitente,
        NumRegIdTribRemitente: origen.NumRegIdTribRemitente || undefined,
        ResidenciaFiscalRemitente: origen.ResidenciaFiscalRemitente || undefined,
        NumeroEstacionRemitente: origen.NumeroEstacionRemitente || undefined,
        NombreEstacionRemitente: origen.NombreEstacionRemitente || undefined,
        NavegacionTraficoRemitente: origen.NavegacionTraficoRemitente || undefined,
        FechaHoraSalidaRemitente: moment(origen.FechaHoraSalidaRemitente).format("YYYY-MM-DDTHH:mm:ss"),
      });

      // Agregar el nodo Domicilio
      const domicilioNode = origenNode.ele("cartaporte:Domicilio", origen.Domicilio[0]);
    });

    // Agregar el nodo Destino
    Destino.forEach((destino) => {
      const destinoNode = ubicacionesNode.ele("cartaporte:Destino", {
        IDDestino: destino.IDDestino,
        RFCDestinatario: destino.RFCDestinatario,
        NombreDestinatario: destino.NombreDestinatario,
        NumRegIdTribDestinatario: destino.NumRegIdTribDestinatario || undefined,
        ResidenciaFiscalDestinatario: destino.ResidenciaFiscalDestinatario || undefined,
        NumeroEstacionDestinatario: destino.NumeroEstacionDestinatario || undefined,
        NombreEstacionDestinatario: destino.NombreEstacionDestinatario || undefined,
        NavegacionTraficoDestinatario: destino.NavegacionTraficoDestinatario || undefined,
        FechaHoraArriboDestinatario: moment(destino.FechaHoraArriboDestinatario).format("YYYY-MM-DDTHH:mm:ss"),
        });
          // Agregar el nodo Domicilio
  const domicilioNode = destinoNode.ele("cartaporte:Domicilio", destino.Domicilio[0]);
});
});
// Agregar el nodo Mercancias
const mercanciasNode = cartaPorteNode.ele("cartaporte:Mercancias");
Mercancias.forEach((mercancia) => {
mercanciasNode.ele("cartaporte:Mercancia", {
ClaveSTCC: mercancia.ClaveSTCC,
Descripcion: mercancia.Descripcion,
CantidadTransporta: mercancia.CantidadTransporta,
Unidad: mercancia.Unidad,
Peso: mercancia.Peso,
TipoPeso: mercancia.TipoPeso,
TipoTransporte: mercancia.TipoTransporte || undefined,
});
});

// Agregar el nodo Contenedor
const contenedorNode = cartaPorteNode.ele("cartaporte:Contenedor");
Contenedor.forEach((contenedor) => {
contenedorNode.ele("cartaporte:Datos", {
TamañoContenedor: contenedor.TamañoContenedor,
TipoContenedor: contenedor.TipoContenedor,
PesoNetoMercancia: contenedor.PesoNetoMercancia,
RFCOperador: contenedor.RFCOperador || undefined,
NombreOperador: contenedor.NombreOperador || undefined,
NumRegIdTribOperador: contenedor.NumRegIdTribOperador || undefined,
ResidenciaFiscalOperador: contenedor.ResidenciaFiscalOperador || undefined,
});
});

// Retorna el XML como string
return cartaPorte.end({ pretty: true });
}


// Añade el endpoint para procesar los datos del CFDI
app.post('/api/process-data-cfdi', async (req, res) => {
  try {
    const result = await ProcessDataCFDI(req.body);
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send({ message: 'Error processing data', error });
  }
});


// Puerto del servidor
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});
///const processDataCFDIRouter = require('./routes/processDataCFDI');
//app.use('/processDataCFDI', processDataCFDIRouter);
