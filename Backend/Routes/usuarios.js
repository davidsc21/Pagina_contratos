const express = require("express");
const router = express.Router();
const {obtenerUsuarios} = require("../Controllers/usuariosController");
const {crearUsuario} = require("../Controllers/usuariosController");
const {validarCrearUsuario} = require("../Validators/usuariosValidator");
const validarCampos = require("../middleware/validarCampos");

router.get("/", obtenerUsuarios);

router.post("/", validarCrearUsuario, validarCampos, crearUsuario);

module.exports = router;