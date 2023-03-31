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
      return res.status(401).send({
          success: false,
          errors: [{
              code: "401",
              "source": "Authentication",
              "title": "Unauthorized",
              detail: "User invalid"
          }]
      });
  }

  const validPassword = req.body.Password === user.Password;
  if (!validPassword) {
      return res.status(401).send({
          success: false,
          errors: [{
              code: "401",
              "source": "Authentication",
              "title": "Unauthorized",
              detail: "Password invalid"
          }]
      });
  }
  

  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
    res.send({
        success: true,
        data: { token },
           "errors": [
            {
                "code": "",
                "source": "",
                "title": "",
                "detail": "Sin errores"
            }
        ]
    });
};
