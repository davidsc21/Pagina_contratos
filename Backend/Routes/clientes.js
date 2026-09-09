const express = require("express");
const router = express.Router();

const {obtenerClientes, crearCliente, actualizarCliente, eliminarCliente} = require("../Controllers/clientesController");
const {validarCliente} = require("../Validators/clientesValidator");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const validarCampos = require("../middleware/validarCampos");

router.use(authMiddleware);
router.use(adminMiddleware);

router.get("/", obtenerClientes);

router.post("/", validarCliente, validarCampos, crearCliente);

router.put("/:id", validarCliente, validarCampos, actualizarCliente);

router.delete("/:id", eliminarCliente);

module.exports = router;