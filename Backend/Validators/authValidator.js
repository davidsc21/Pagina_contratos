const {body} = require("express-validator");

const validarLogin = [
    
    body("correo").trim().notEmpty().withMessage("el correo es obligatorio").isEmail().withMessage("debe ingresar un correo valido"),
    body("password").notEmpty().withMessage("la contraseña es obligatoria")
];

module.exports = {
    validarLogin
};