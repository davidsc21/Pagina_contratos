const express = require("express");
const router = express.Router();

const {login}= require("../Controllers/authController");
const {validarLogin} = require("../Validators/authValidator");
const validarCampos = require("../middleware/validarCampos");

router.post("/login", validarLogin, validarCampos, login);


module.exports = router;