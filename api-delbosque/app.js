const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const loginRouter = require('./routes/login');
const app = express();
const fs = require('fs');
const xml2js = require('xml2js');
const builder = new xml2js.Builder();

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
// Ejemplo para crear el json
app.post('/generateXML', (req, res) => {
  const jsonData = req.body;

  // Crear el objeto que será convertido a XML
  const xmlData = {
    ComplementoCartaPorte: {
      $: {
        'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
        'xsi:schemaLocation': 'http://www.sat.gob.mx/carta_porte http://www.sat.gob.mx/sitio_internet/cfd/carta_porte/carta_porte.xsd',
        'xmlns:cartap': 'http://www.sat.gob.mx/carta_porte',
        Version: '1.1',
        FechaProcesamiento: jsonData[0].FechaProcesamiento,
        // Agregar aquí más atributos requeridos por el SAT en base al archivo schemaxml.xsf
      },
      // Agregar aquí más elementos requeridos por el SAT en base al archivo schemaxml.xsf
    },
  };

  // Generar el XML y guardar en archivo
  const xml = builder.buildObject(xmlData);
  fs.writeFile('carta_porte.xml', xml, (err) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error al guardar el archivo XML.');
    } else {
      res.status(200).send('Archivo XML guardado correctamente.');
    }
  });
});

// Puerto del servidor
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});
const processDataCFDIRouter = require('./routes/processDataCFDI');
app.use('/processDataCFDI', processDataCFDIRouter);
