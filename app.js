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

// end point de pureba ******************************************
// Ejemplo para crear el json ****************************
async function ProcessDataCFDI(data) {

  try {
    // Validar datos de entrada
    const validationResult = validateInputData(data);
    if (!validationResult.isValid) {
      return {
          success: true,
          "data": {
              "message": "Se procesó parcialmente"
          },
          errors: [
              {
                  "code": "400",
                  "source": "Bad Request",
                  "title": "NumeroOperacion " + data.NumeroOperacion,
                   detail: validationResult,
              },
           ],   

       
      };
    }
      app.use((err, req, res, next) => {
          console.error(err.stack);
          res.status(400).json({
              success: false,
              data: {
                  message: 'Ocurrió un error interno del servidor'
              },
              errors: [
                  {
                      code: '500',
                      source: 'Internal Server Error',
                      title: 'Internal Server Error',
                      detail: err.message
                  }
              ]
          });
      });
    // Crear el XML
    const xml = buildCartaPorteXML(data);

    return {
        success: true,
        "data": {
            "message": "Se procesó exitosamente"
        },
        "errors": [
            {
                "code": "",
                "source": "",
                "title": "",
                "detail": "Sin errores"
            }
        ],
    };
  } catch (error) {
      console.error("Error al procesar los datos:", error);
    return {
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
        ],
      errors: ["Error al procesar los datos."],
    };
  }
}
// validate input
const Joi = require('joi');

function validateInputData(data) {

    const detalleFacturaSchema = Joi.array()
        .min(1)
        .items(
            Joi.object({
            NumeroFactura: Joi.string().required(),
            NumeroParte: Joi.string().required(),
            Descripcion: Joi.string().required(),
            PesoNeto: Joi.number().required(),
            PesoTara: Joi.number().required(),
            Pedimento: Joi.string().required(),
            FraccionArancelaria: Joi.string().required(),
            Cantidad: Joi.number().required(),
            })
            );

    const detalleMercanciaSchema = Joi.array()
        .min(1)
        .items(
            Joi.object({
            UnidadPeso: Joi.string().required(),
            PesoBruto: Joi.number().required(),
            PesoNeto: Joi.number().required(),
            PesoTara: Joi.number().required(),
            })
            );

    const cantidadTransportaSchema = Joi.array()
        .min(1)
        .items(
            Joi.object({
            CantidadTrans: Joi.number().required(),
            IDOrigen: Joi.string().required(),
            IDDestino: Joi.string().required(),
            DetalleMercancia: detalleMercanciaSchema,
            DetalleFactura: detalleFacturaSchema,
            })
            );

        const mercanciasSchema = Joi.object({
            NumeroContenedor: Joi.string().required(),
            PesoBrutoTotal: Joi.number().required(),
            UnidadPeso: Joi.string().required(),
            PesoNetoTotal: Joi.number().required(),
            NumTotalMercancias: Joi.number().required(),
        });

        const mercanciaSchema = Joi.object({
            NumeroContenedor: Joi.string().required(),
            BienesTransp: Joi.string().required(),
            TamanioContenedor: Joi.string().required(),
            ClaveSTCC: Joi.string().required(),
            Descripcion: Joi.string().required(),
            Cantidad: Joi.number().required(),
            ClaveUnidad: Joi.string().required(),
            Unidad: Joi.string().required(),
            MaterialPeligroso: Joi.string().required(),
            CveMaterialPeligroso: Joi.string().required(),
            Embalaje: Joi.string().required(),
            DescripEmbalaje: Joi.string().required(),
            PesoEnKg: Joi.number().required(),
            CantidadTransporta: cantidadTransportaSchema,
        });

        const contenedorSchema = Joi.object({
            BL: Joi.string().required(),
            Buque: Joi.string().required(),
            BuyerCode: Joi.string().required(),
            PackingList: Joi.string().required(),
            ProveedorLogistico: Joi.string().required(),
        });


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
        Mercancias: Joi.array().min(1).items(mercanciasSchema).required(),
        Mercancia: Joi.array().min(1).items(mercanciaSchema).required(),
        Contenedor: Joi.array().min(1).items(contenedorSchema).required(),
      });

    const datos = {
        // Tus datos JSON
    };

    mainSchema.validateAsync(datos)
        .then(() => {
            console.log('Los datos son válidos.');
        })
        .catch((error) => {
            console.log('Los datos son inválidos:', error.message);
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
const mercanciaNode = cartaPorteNode.ele("cartaporte:Mercancia");
Mercancia.forEach((mercancia) => {
mercanciaNode.ele("cartaporte:Mercancia", {
ClaveSTCC: mercancia.ClaveSTCC,
Descripcion: mercancia.Descripcion,
CantidadTransporta: mercancia.CantidadTransporta,
Unidad: mercancia.Unidad,
Peso: mercancia.Peso,
TipoPeso: mercancia.TipoPeso,
TipoTransporte: mercancia.TipoTransporte,
});
});

// Agregar el nodo Contenedor
const contenedorNode = cartaPorteNode.ele("cartaporte:Contenedor");
Contenedor.forEach((contenedor) => {
contenedorNode.ele("cartaporte:Datos", {
TamañoContenedor: contenedor.TamañoContenedor,
TipoContenedor: contenedor.TipoContenedor,
PesoNetoMercancia: contenedor.PesoNetoMercancia,
RFCOperador: contenedor.RFCOperador,
NombreOperador: contenedor.NombreOperador,
NumRegIdTribOperador: contenedor.NumRegIdTribOperador,
ResidenciaFiscalOperador: contenedor.ResidenciaFiscalOperador ,
});
});
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
app.post('/api/process-data-cfdi', async (req, res) => {
    // Obtenemos el token de autorización del header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        // Si el token no se encuentra en el header, devolvemos un error 401
        return res.status(401).json({ error: 'No se proporcionó un token de autorización' });
    }
  try {
    const result = await ProcessDataCFDI(req.body);
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send({ message: 'Error processing data', error });
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
app.listen(port, () => console.log(`Servidor escuchando en el puerto ${port}`));