const express = require("express");
const router = express.Router();
const pool = require("../Databases/db");
const bcrypt = require("bcrypt");
const {obtenerUsuarios} = require("../Controllers/usuariosController");
const {crearUsuario} = require("../Controllers/usuariosController");

router.get("/", obtenerUsuarios);

router.post("/", crearUsuario);

module.exports = router;