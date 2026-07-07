const {body} = require("express-validator");

const validarCrearUsuario =[

    body("nombre").trim().notEmpty().withMessage("el nombre es obligatorio"),
    body("apellido").trim().notEmpty().withMessage("el apellido es obligatorio"),
    body("correo").trim().notEmpty().withMessage("el correo es obligatorio").isEmail().withMessage("debe ingresar un correo valido"),
    body("password").notEmpty().withMessage("la contraseña es obligatoria").isLength({min: 6}).withMessage("la contreseña debe tener al menos 6 caracteres"),

];

module.exports = {
    validarCrearUsuario
};