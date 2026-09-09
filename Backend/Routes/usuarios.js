const express = require("express");
const router = express.Router();
const {
    obtenerUsuarios,
    crearUsuario,
    actualizarUsuario,
    eliminarUsuario
} = require("../Controllers/usuariosController");
const {
    validarCrearUsuario,
    validarActualizarUsuario
} = require("../Validators/usuariosValidator");
const validarCampos = require("../middleware/validarCampos");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

router.get("/", authMiddleware, adminMiddleware, obtenerUsuarios);

router.post("/", authMiddleware, adminMiddleware, validarCrearUsuario, validarCampos, crearUsuario);

router.put("/:id", authMiddleware, adminMiddleware, validarActualizarUsuario, validarCampos, actualizarUsuario);

router.delete("/:id", authMiddleware, adminMiddleware, eliminarUsuario);

module.exports = router;
