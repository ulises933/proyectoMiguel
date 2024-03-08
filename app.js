const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const cors = require("cors");
const { body } = require("express-validator");
const fs = require('fs');
const authController = require("./controllers/authController");
const crypto = require('crypto');
const builder = require('xmlbuilder');
const moment = require('moment');
const https = require('https');
const http = require('http');
const authenticateToken = require('./controllers/authenticateToken');


const ErrorLog = require("./models/Errors");
dotenv.config();

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Conectado a MongoDB"))
  .catch((error) => console.error("Error al conectar a MongoDB:", error));


app.post(
  "/login",
  [
    body("ParticipanteName").notEmpty().withMessage("El nombre del participante es requerido").trim().escape(),
    body("Password").notEmpty().withMessage("La contraseña es requerida").trim().escape(),
  ],
  authController.login
);

// end point de pureba ***********************************
async function ProcessDataCFDI(dataArray) {
  try {
    const results = dataArray.map(async data => {
      const validationResult = validateInputData(data);
      if (validationResult.error) {
        // Guardar errores en MongoDB
        const errorToSave = new ErrorLog({
          success: false,
          data: [{
            folio: data.NumeroOperacion.toString(),
            errorDetail: validationResult.error.details.map(detail => ({
              message: detail.message,
            })),
          }]
        });
        await errorToSave.save();
        return {
          success: false,
          data: { message: "Se procesó parcialmente" },
          errors: validationResult.error.details.map(detail => {
            return {
              code: "400",
              source: "Bad Requests",
              detail: detail.message 
            };
          })
        };
      } else {
        // Si no hay errores, procesa los datos
        try{
          // Verifica y elimina un error previo en MongoDB para este folio si existe
        await ErrorLog.deleteMany({ "data.folio": data.NumeroOperacion.toString() });
        }catch(error){
          console.log(error)
        }
        const xml = buildCartaPorteXML(data);
        return {
          success: true,
          data: { message: "Se procesó exitosamente" },
          errors: []
        };
      }
    });

    // Aquí tendrías que decidir qué hacer con los resultados.
    // Por ejemplo, podrías devolver un error si alguno falla,
    // o podrías devolver éxito si todos pasan.
    return results;
  } catch (error) {
    // Guardar errores en MongoDB
    const errorToSave = new ErrorLog({
      success: false,
      data: [{
        folio: data.NumeroOperacion.toString(),
        errorDetail: [{
          message: "Error en los datos de entrada Status Code 400",
        }],
      }]
    });
    await errorToSave.save();
    console.error("Error al procesar los datos:", error);
    return {
      success: false,
      data: { message: "No se encontraron datos relacionados" },
      errors: [
        {
          code: "400",
          source: "Bad Request",
          detail: "No se tiene el formato esperado"
        },
        // ... y otros errores si son necesarios
      ]
    };
  }
}
// validate input
const Joi = require('joi');

function validateInputData(data) {

  const customErrorMessages = {
    "any.required": "El dato {{#label}} es un campo requerido",
    "string.empty": "El dato {{#label}} no debe estar vacío",
    "string.min": "El dato {{#label}} debe tener al menos {{#limit}} caracteres",
    "string.base": "El dato {{#label}} debe ser un String",
    "string.max": "El dato {{#label}} debe tener como máximo {{#limit}} caracteres",
    "string.alphanum": "El dato {{#label}} debe contener solo caracteres alfanuméricos",
    "string.email": "El dato {{#label}} debe ser una dirección de correo electrónico válida",
    "string.isoDate": "El dato {{#label}} debe ser una fecha ISO válida",
    "number.base": "El dato {{#label}} debe ser un número",
    "number.min": "El dato {{#label}} debe ser mayor o igual a {{#limit}}",
    "number.max": "El dato {{#label}} debe ser menor o igual a {{#limit}}",
    "array.min": "El dato Debe haber al menos {{#limit}} {{#label}}",
    "object.base": "El dato {{#label}} debe ser un objeto",
    "object.min": "El dato Debe haber al menos {{#limit}} {{#label}}",
    };

    const detalleFacturaSchema = Joi.array()
        .min(1)
        .items(
            Joi.object({
              NumeroFactura: Joi.string().required().max(50).label('Número de Factura'),
              NumeroParte: Joi.string().required().max(50).label('Número de Parte'),
              Descripcion: Joi.string().required().max(1000).label('Descripción'),
              PesoNeto: Joi.number().required().label('Peso Neto'),
              PesoTara: Joi.number().required().label('Peso Tara'),
              Pedimento: Joi.string().required().max(21).label('Pedimento'),
              FraccionArancelaria: Joi.string().required().max(50).label('Fracción Arancelaria'),
              Cantidad: Joi.number().required().label('Cantidad'),
            })
            ).label('detalleFacturaSchema');

    const detalleMercanciaSchema = Joi.array()
        .min(1)
        .items(
            Joi.object({
            UnidadPeso: Joi.string().required().max(5).label('UnidadPeso'),
            PesoBruto: Joi.number().required().label('PesoBruto'),
            PesoNeto: Joi.number().required().label('PesoNeto'),
            PesoTara: Joi.number().required().label('PesoTara'),
            })
            ).label('Detalle de la Mercancía');

    const cantidadTransportaSchema = Joi.array()
        .min(1)
        .items(
            Joi.object({
            CantidadTrans: Joi.number().required().label('CantidadTrans'),
            IDOrigen: Joi.string().required().max(150).label('IDOrigen'),
            IDDestino: Joi.string().required().max(150).label('IDDestino'),
            DetalleMercancia: detalleMercanciaSchema,
            DetalleFactura: detalleFacturaSchema,
            })
            ).label('cantidadTransportaSchema');

        const mercanciasSchema = Joi.object({
            NumeroContenedor: Joi.string().required().max(12).label('NumeroContenedor'),
            PesoBrutoTotal: Joi.number().required().label('PesoBrutoTotal'),
            UnidadPeso: Joi.string().required().max(150).label('UnidadPeso'),
            PesoNetoTotal: Joi.number().required().label('PesoNetoTotal'),
            NumTotalMercancias: Joi.number().required().label('NumTotalMercancias'),
            UUID: Joi.string().allow('').label('UUID'),
            CargoPorTasacion: Joi.number().label('CargoPorTasacion'),
            LogisticaInversaRecoleccionDevolucion: Joi.string().label('LogisticaInversaRecoleccionDevolucion'),
        });
        const documentacionAduaneraSchema = Joi.object({
          TipoDocumento: Joi.string().max(150).label('TipoDocumento'),
          NumPedimento: Joi.string().max(150).label('NumPedimento'),
          IdentDocAduanero: Joi.string().max(150).label('IdentDocAduanero'),
          RFCImpo: Joi.string().max(150).label('RFCImpo'),
          GuiasIdentificacion: Joi.string().max(150).label('GuiasIdentificacion'),
          NumeroGuiaIdentifiacion: Joi.string().max(150).label('NumeroGuiaIdentifiacion'),
          DescripGuiaIdentificacion: Joi.string().max(150).label('DescripGuiaIdentificacion'),
          PesoGuiaIdentificacion: Joi.string().max(150).label('PesoGuiaIdentificacion'),
          
      });

        const mercanciaSchema = Joi.object({
            NumeroContenedor: Joi.string().required().max(12).label('NumeroContenedor'),
            BienesTransp: Joi.string().required().max(150).label('BienesTransp'),
            TamañoContenedor: Joi.string().required().max(4).label('TamañoContenedor'),
            ClaveSTCC: Joi.string().required().max(150).label('ClaveSTCC'),
            Descripcion: Joi.string().required().max(500).label('Descripcion'),
            Cantidad: Joi.number().required().label('Cantidad'),
            ClaveUnidad: Joi.string().required().max(150).label('ClaveUnidad'),
            Unidad: Joi.string().required().max(150).label('Unidad'),
            MaterialPeligroso: Joi.string().required().max(150).label('MaterialPeligroso'),
            CveMaterialPeligroso: Joi.string().required().max(150).label('CveMaterialPeligroso'),
            Embalaje: Joi.string().required().max(150).label('Embalaje'),
            DescripEmbalaje: Joi.string().required().max(500).label('DescripEmbalaje'),
            PesoEnKg: Joi.number().required().label('PesoEnKg'),
            ValorMercancia: Joi.number().label('ValorMercancia'),
            Moneda: Joi.string().max(150).label('Moneda'),
            FraccionArancelaria: Joi.string().max(150).label('FraccionArancelaria'),
            UUIDComercioExt: Joi.string().max(150).label('UUIDComercioExt'),
            TipoMateria: Joi.string().max(150).label('TipoMateria'),
            DescripcionMateria: Joi.string().max(150).label('DescripcionMateria'),
            DocumentacionAduanera: documentacionAduaneraSchema,
            CantidadTransporta: cantidadTransportaSchema,
        });

        const contenedorSchema = Joi.object({
            BL: Joi.string().max(16).required().label('BL'),
            BookingConfirmation: Joi.string().max(12).allow('').label('BookingConfirmation'),
            Buque: Joi.string().required().max(30).label('Buque'),
            BuyerCode: Joi.string().required().max(6).label('BuyerCode'),
            PackingList: Joi.string().required().max(6).label('PackingList'),
            ProveedorLogistico: Joi.string().required().max(3).label('ProveedorLogistico'),
        });


    const domicilioSchema = Joi.array()
        .min(1)
        .items(
            Joi.object({
        Calle: Joi.string().required().max(250).label('Calle'),
        NumeroExterior: Joi.string().required().max(10).label('NumeroExterior'),
        NumeroInterior:Joi.string().required().label('NumeroInterior'),
        Colonia: Joi.string().required().max(10).label('Colonia'),
        Localidad: Joi.string().required().max(10).label('Localidad'),
        Referencia: Joi.string().max(250).label('Referencia'),
        Municipio: Joi.string().required().max(10).label('Municipio'),
        Estado: Joi.string().required().max(10).label('Estado'),
        Pais: Joi.string().required().max(10).label('Pais'),
        CodigoPostal: Joi.string().max(10).required().label('CodigoPostal'),
      })).label('cantidadTransportaSchema');

      const ubicacionSchema = Joi.object({
        TipoEstacion: Joi.string().length(2).required().max(10).label('TipoEstacion'),
        DistanciaRecorrida: Joi.number().required().label('DistanciaRecorrida'),
        Origen: Joi.array()
          .min(1)
          .items(
            Joi.object({
              IDOrigen: Joi.string().required().max(50).label('IDOrigen'),
              RFCRemitente: Joi.string().required().max(50).label('RFCRemitente'),
              NombreRemitente: Joi.string().required().max(250).label('NombreRemitente'),
              NumRegIdTribRemitente: Joi.string().max(50).label('NumRegIdTribRemitente'),
              ResidenciaFiscalRemitente: Joi.string().max(50).label('ResidenciaFiscalRemitente'),
              NumeroEstacionRemitente: Joi.string().max(50).label('NumeroEstacionRemitente'),
              NombreEstacionRemitente: Joi.string().max(250).label('NombreEstacionRemitente'),
              NavegacionTraficoRemitente: Joi.string().max(50).label('NavegacionTraficoRemitente'),
              FechaHoraSalidaRemitente: Joi.string().isoDate().required().label('FechaHoraSalidaRemitente'),
              Distancia: Joi.number().label('Distancia'),
              Domicilio: domicilioSchema,
            })
          )
          .required().label('Origen'),
        Destino: Joi.array()
          .min(1)
          .items(
            Joi.object({
              IDDestino: Joi.string().required().max(50).label('IDDestino'),
              RFCDestinatario: Joi.string().required().max(50).label('RFCDestinatario'),
              NombreDestinatario: Joi.string().required().max(250).label('NombreDestinatario'),
              NumRegIdTribDestinatario: Joi.string().max(50).label('NumRegIdTribDestinatario'),
              ResidenciaFiscalDestinatario: Joi.string().max(50).label('ResidenciaFiscalDestinatario'),
              NumeroEstacionDestinatario: Joi.string().max(50).label('NumeroEstacionDestinatario'),
              NombreEstacionDestinatario: Joi.string().max(250).label('NombreEstacionDestinatario'),
              NavegacionTraficoDestinatario: Joi.string().max(50).label('NavegacionTraficoDestinatario'),
              FechaHoraSalidaDestinatario: Joi.string().isoDate().required().label('FechaHoraSalidaDestinatario'),
              Distancia: Joi.number().label('Distancia'),
              Domicilio: domicilioSchema,
            })
          )
          .required().label('Destino'),
      }).label('ubicacionSchema');

      const mainSchema = Joi.object({
        FechaProcesamiento: Joi.string().isoDate().required().label('FechaProcesamiento'),
        PlantaProcesamiento: Joi.string().label('PlantaProcesamiento'),
        Usuario: Joi.string().required().label('Usuario'),
        TipoDocumento: Joi.string().valid("ComplementoCartaPorte").required().max(150).label('TipoDocumento'),
        NumeroOperacion: Joi.string().required().label('NumeroOperacion'),
        TipoViaje: Joi.string().length(1).required().label('TipoViaje'),
        TipoMovimiento: Joi.string().length(1).required().label('TipoMovimiento'),
        RegimenAduanero: Joi.string().max(100).label('RegimenAduanero'),
        EntradaSalidaMerc: Joi.string().max(100).label('EntradaSalidaMerc'),
        ViaEntradaSalida: Joi.string().max(100).label('ViaEntradaSalida'),
        TipoEnvio: Joi.string().max(100).label('TipoEnvio'),
        Ubicaciones: Joi.array().min(1).items(ubicacionSchema).required().label('Ubicaciones'),
        Mercancias: Joi.array().min(1).items(mercanciasSchema).required().label('Mercancias'),
        Mercancia: Joi.array().min(1).items(mercanciaSchema).required().label('Mercancia'),
        Contenedor: Joi.array().min(1).items(contenedorSchema).required().label('Contenedor'),
      }).messages(customErrorMessages);

      

    const datos = {
        // Tus datos JSON
    };

    if (!Array.isArray(data.Contenedor)) {
      console.log("Contenedor no es un array")
      data.Contenedor = []; // Asume un array vacío si 'Contenedor' no está o no es un array.
    }

    if (!Array.isArray(data.Mercancia)) {
      console.log("Mercancia no es un array")
       // Asume un array vacío si 'Contenedor' no está o no es un array.
    }
    else{
      console.log("Mercancia si es un array")
    }

    if (!Array.isArray(data.Contenedor)) {
      // Si no lo es, maneja el caso como sea apropiado, por ejemplo lanzando un error o asignándole un array vacío
      throw new Error("'Contenedor' debe ser un array.");
    }
    
    const validationResult = mainSchema.validate(data, { abortEarly: false, messages: customErrorMessages });

  if (validationResult.error) {
    return {
      errors: validationResult.error.details.map((error) => error.message),
    };
  } else {
    return {
      isValid: true,
    };
  }
}
// funcion xml *********************************}
//*********************** */

function buildCartaPorteXML(data) {
  const { FechaProcesamiento, TipoDocumento, NumeroOperacion, TipoViaje, TipoMovimiento, Ubicaciones, Mercancias, Mercancia, Contenedor } = data;

  // Crear la estructura básica del XML
  const cartaPorte = builder.create("cfdi:Comprobante", { encoding: "UTF-8" });

  // Agregar atributos al nodo principal
  cartaPorte.att("xmlns:cfdi", "http://www.sat.gob.mx/cfd/4");
  cartaPorte.att("xmlns:xsi", "http://www.w3.org/2001/XMLSchema-instance");
  cartaPorte.att("xmlns:cartaporte", "http://www.sat.gob.mx/CartaPorte");
  cartaPorte.att("Fecha", moment(FechaProcesamiento).format("YYYY-MM-DDTHH:mm:ss"));
  cartaPorte.att("TipoDocumento", TipoDocumento);
  
  const CFDIEmisor = cartaPorte.ele("cfdi:Emisor");
  CFDIEmisor.att("RegimenFiscal", "601");
  CFDIEmisor.att("Rfc","ETB170323P63");
  CFDIEmisor.att("Nombre", "ENLACES TERRESTRES DEL BOSQUE");

  //const CFDIReceptor
  const CFDIReceptor = cartaPorte.ele("cfdi:Receptor");
  CFDIReceptor.att("Rfc", "NME610911L71");
  CFDIReceptor.att("Nombre","NISSAN MEXICANA");
  CFDIReceptor.att("DomicilioFiscalReceptor", "01090");
  CFDIReceptor.att("RegimenFiscalReceptor", "601");
 

  // Agregar el nodo Carta Porte
  const cartaPorteNode = cartaPorte.ele("cartaporte:CartaPorte30");
  cartaPorteNode.att("Version", "3.0");
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
        NumRegIdTribRemitente: origen.NumRegIdTribRemitente,
        ResidenciaFiscalRemitente: origen.ResidenciaFiscalRemitente,
        NumeroEstacionRemitente: origen.NumeroEstacionRemitente,
        NombreEstacionRemitente: origen.NombreEstacionRemitente,
        NavegacionTraficoRemitente: origen.NavegacionTraficoRemitente,
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
        NumRegIdTribDestinatario: destino.NumRegIdTribDestinatario,
        ResidenciaFiscalDestinatario: destino.ResidenciaFiscalDestinatario,
        NumeroEstacionDestinatario: destino.NumeroEstacionDestinatario,
        NombreEstacionDestinatario: destino.NombreEstacionDestinatario,
        NavegacionTraficoDestinatario: destino.NavegacionTraficoDestinatario,
        FechaHoraArriboDestinatario: moment(destino.FechaHoraArriboDestinatario).format("YYYY-MM-DDTHH:mm:ss"),
        });
          // Agregar el nodo Domicilio
  const domicilioNode = destinoNode.ele("cartaporte:Domicilio", destino.Domicilio[0]);
});
});
// Agregar el nodo Mercancia
const mercanciaNode = cartaPorteNode.ele("cartaporte:Mercancias");
data.Mercancia.forEach((mercancia) => {
  const mercanciaItem = mercanciaNode.ele("cartaporte:Mercancia", {
    ClaveSTCC: mercancia.ClaveSTCC,
    Descripcion: mercancia.Descripcion,
    Unidad: mercancia.Unidad,
    Peso: mercancia.Peso,
    TipoPeso: mercancia.TipoPeso,
    TipoTransporte: mercancia.TipoTransporte,
  });

  // Si 'CantidadTransporta' es un array, lo procesamos
  if (Array.isArray(mercancia.CantidadTransporta)) {
    mercancia.CantidadTransporta.forEach(ct => {
      mercanciaItem.ele("cartaporte:CantidadTransporta", {
        CantidadTrans: ct.CantidadTrans,
        IDOrigen: ct.IDOrigen,
        IDDestino: ct.IDDestino,
        

        // ... atributos de 'ct'
      });
      if (Array.isArray(ct.DetalleMercancia) && ct.DetalleMercancia.length) {
        ct.DetalleMercancia.forEach(dm => {
          mercanciaItem.ele("cartaporte:DetalleMercancia", {
            UnidadPeso: dm.UnidadPeso,
            PesoBruto: dm.PesoBruto,
            PesoNeto: dm.PesoNeto,
            PesoTara: dm.PesoTara
          });
        });
      }
      if (Array.isArray(ct.DetalleFactura) && ct.DetalleFactura.length) {
        ct.DetalleFactura.forEach(df => {
          mercanciaItem.ele("cartaporte:DetalleFactura", {
            NumeroFactura: df.NumeroFactura,
            NumeroParte: df.NumeroParte,
            Descripcion: df.Descripcion,
            PesoNeto: df.PesoNeto,
            PesoTara: df.PesoTara,
            Pedimento: df.Pedimento,
            FraccionArancelaria: df.FraccionArancelaria,
            Cantidad: df.Cantidad
        });
      });
    }
    });
  }
});

// Agregar el nodo Contenedor
// if (Array.isArray(data.Contenedor)) {
  const contenedorNode = cartaPorteNode.ele("cartaporte:Contenedor");
  data.Contenedor.forEach((contenedor) => {
    contenedorNode.ele("cartaporte:Datos", {
      TamañoContenedor: contenedor.TamañoContenedor,
      TipoContenedor: contenedor.TipoContenedor,
      PesoNetoMercancia: contenedor.PesoNetoMercancia,
      RFCOperador: contenedor.RFCOperador,
      NombreOperador: contenedor.NombreOperador,
      NumRegIdTribOperador: contenedor.NumRegIdTribOperador,
      ResidenciaFiscalOperador: contenedor.ResidenciaFiscalOperador,
      // ... otros atributos
    });
  });
// } else {
//   // Manejar el caso donde 'Contenedor' no es un array o no existe.
//   throw new Error("'Contenedor' debe ser un array.");
// }


// Obtener el XML como string
const xmlString = cartaPorte.end({ pretty: true });

// Generar un nombre de archivo aleatorio usando una cadena hexadecimal
const nombreBaseArchivo = 'cartaPorte';
const sufijoArchivo = crypto.randomBytes(4).toString('hex');
const nombreArchivo = `${nombreBaseArchivo}-${sufijoArchivo}.xml`;

// Escribir el contenido del XML en un archivo con el nombre generado en la carpeta local
fs.writeFileSync(`./xml/${nombreArchivo}`, xmlString);
// Retorna el XML como string
return cartaPorte.end({ pretty: true });

}


// Añade el endpoint para procesar los datos del CFDI
app.post('/api/process-data-cfdi', authenticateToken,async (req, res) => {
  //console.log(req.body);
    // Obtenemos el token de autorización del header
    
  try {
    const result = await ProcessDataCFDI(req.body);
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send({ message: 'Error processing data', error });
  }
});

app.post('/api/GetErrors',authenticateToken, async (req, res) => {
 
  try {
    const errors = await ErrorLog.find({ success: false });
    const errorResponse = errors.map(error => {
      return {
        success: error.success,
        data: error.data.map(dataItem => ({
          folio: dataItem.folio,
          errorDetail: dataItem.errorDetail.map(detail => ({
            message: detail.message
          }))
        })),
        errors: {
          code: "",
          title: "", // Asumiendo que 'source' se desea usar como 'title'
          detail: "",
        }
      };
    });

    res.json(errorResponse);
  } catch (error) {
    console.error("Error al recuperar los errores:", error);
    res.status(500).json({
      success: false,
      "data": {
          "message": ""
      },
      "errors": [
          {
              "code": "400",
              "source": "Bad Request",
              "title": "Bad Request",
              "detail": "error recuperando los errores"
          }
      ]
  });
  }
});

app.use((err, req, res, next) => {
   console.error(err.stack);
    res.status(500).json({
        success: false,
        "data": {
            "message": "No se encontraron datos relacionados"
        },
        "errors": [
            {
                "code": "400",
                "source": "Bad Request",
                "title": "Bad Request",
                "detail": "No se tiene el formato esperado"
            }
        ]
    });
});

function verifyToken(req, res, next) {
  const token = req.headers['authorization'];

  if (!token) {
      return res.status(403).send({ message: 'No token provided' });
  }

  jwt.verify(token, 'secreto', (err, decoded) => {
      if (err) {
          return res.status(401).send({ message: 'Unauthorized' });
      }
      req.userId = decoded.id;
      next();
  });
}

const port = process.env.PORT || 3000;
// Cambia la manera en que inicias el servidor para usar HTTPS
// const options = {
//   key: fs.readFileSync('/etc/letsencrypt/live/apidelbosque2.duckdns.org/privkey.pem'),
//   cert: fs.readFileSync('/etc/letsencrypt/live/apidelbosque2.duckdns.org/fullchain.pem')
// };

// https.createServer(options, app).listen(port, () => {
//   console.log(`🍉🍉🍉 https://localhost:${port}`);
// });

app.listen(3000, () => {
  console.log('App listening on port 3000!');
});
// http.createServer( app).listen(port, () => {
//   console.log(`🍉🍉🍉 http://localhost:${port}`);
// });

// jajaj creo que ya jalo xd