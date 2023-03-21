const express = require('express');
const router = express.Router();
const Joi = require('joi');




      

module.exports = schema;
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
      detail: error.message
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

module.exports = router;
