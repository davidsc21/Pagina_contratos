const {body} = require("express-validator");

const validarCrearUsuario =[
    body("nombre").trim().notEmpty().withMessage("el nombre es obligatorio"),
    body("apellido").trim().notEmpty().withMessage("el apellido es obligatorio"),
    body("correo").trim().notEmpty().withMessage("el correo es obligatorio").isEmail().withMessage("debe ingresar un correo valido"),
    body("password").notEmpty().withMessage("la contraseña es obligatoria").isLength({min: 6}).withMessage("la contraseña debe tener al menos 6 caracteres"),
    body("rol").isIn(["admin", "usuario"]).withMessage("el rol debe ser admin o usuario"),
];

const validarActualizarUsuario = [
    body("nombre").optional().trim().notEmpty().withMessage("el nombre no puede estar vacio"),
    body("apellido").optional().trim().notEmpty().withMessage("el apellido no puede estar vacio"),
    body("correo").optional().trim().isEmail().withMessage("debe ingresar un correo valido"),
    body("password").optional().isLength({min: 6}).withMessage("la contraseña debe tener al menos 6 caracteres"),
    body("rol").optional().isIn(["admin", "usuario"]).withMessage("el rol debe ser admin o usuario"),
];

module.exports = {
    validarCrearUsuario,
    validarActualizarUsuario
};
