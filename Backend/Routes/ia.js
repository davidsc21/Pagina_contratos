const express = require("express");
const router = express.Router();

const { adaptarClausula, generarObjetivoGeneral, generarConsideraciones } = require("../Controllers/iaController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/adaptar-clausula", authMiddleware, adaptarClausula);
router.post("/objetivo-general", authMiddleware, generarObjetivoGeneral);
router.post("/consideraciones", authMiddleware, generarConsideraciones);

module.exports = router;