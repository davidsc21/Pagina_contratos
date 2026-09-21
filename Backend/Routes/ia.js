const express = require("express");
const router = express.Router();

const { adaptarClausula, generarObjetivoGeneral } = require("../Controllers/iaController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/adaptar-clausula", authMiddleware, adaptarClausula);
router.post("/objetivo-general", authMiddleware, generarObjetivoGeneral);

module.exports = router;