// controllers/authController.js
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

exports.login = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }

  const user = await User.findOne({ ParticipanteName: req.body.ParticipanteName });
  if (!user) {
    return res.status(400).send({ success: false, errors: [{ code: "100", title: "Error de autenticación", detail: "Usuario no encontrado" }] });
  }

  const validPassword = req.body.Password === user.Password;
  if (!validPassword) {
    return res.status(400).send({ success: false, errors: [{ code: "101", title: "Error de autenticación", detail: "Contraseña incorrecta" }] });
  }
  

  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
  res.send({ success: true, data: { token } });
};
