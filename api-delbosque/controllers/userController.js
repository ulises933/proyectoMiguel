const jwt = require('jsonwebtoken');
const User = require('../models/user');

exports.login = async (req, res) => {
  const { participanteName, password } = req.body;

  // Verificar si el usuario existe y la contraseña es correcta
  const user = await User.findOne({ participanteName });
  if (!user || user.password !== password) {
    return res.status(401).json({
      success: false,
      data: '',
      errors: [
        {
          code: '401',
          source:"Authentication",
          title:"Unauthorized",
          detail:"User and password invalid"

        }
      ]
    });
  }

  // Generar un token JWT y devolverlo como respuesta
  const token = jwt.sign({ userId: user._id }, 'secreto', { expiresIn: '1h' });
  res.json({
    success: true,
    data: { token },
    errors: [
        {
          code: '',
          source:"",
          title:"",
          detail:"Sin errores"

        }
      ]
  });
};
