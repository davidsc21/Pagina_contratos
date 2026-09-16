const express = require("express");
const router = express.Router();

const {buscarCliente} = require("../Controllers/buscarClienteController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware, buscarCliente);

module.exports = router;