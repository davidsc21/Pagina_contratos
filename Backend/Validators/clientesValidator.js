const {body} = require("express-validator");

const validarCliente = [
    body("nombre").trim().notEmpty().withMessage("el nombre es obligatorio"),
    body("documento").trim().notEmpty().withMessage("el documento es obligatorio"),
    body("correo").optional({checkFalsy: true}).isEmail().withMessage("debe ingresar un correo valido")
];

module.exports = {
    validarCliente
};