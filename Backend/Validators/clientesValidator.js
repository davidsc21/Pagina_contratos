const {body} = require("express-validator");

const validarCliente = [
    body("nombre").trim().notEmpty().withMessage("el nombre es obligatorio"),
    body("tipo_cliente").notEmpty().withMessage("el tipo de cliente es obligatorio")
        .isIn(["Natural", "Juridico"]).withMessage("el tipo de cliente debe ser Natural o Juridico"),
    body("nit_cc").trim().notEmpty().withMessage("el NIT/CC es obligatorio")
];

module.exports = {
    validarCliente
};