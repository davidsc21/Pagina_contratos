const express = require("express");
const router = express.Router();

const {
    obtenerTiposContrato,
    obtenerPlantillas,
    obtenerContenidoPlantilla
} = require("../Controllers/plantillasController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/tipos", authMiddleware, obtenerTiposContrato);
router.get("/", authMiddleware, obtenerPlantillas);
router.get("/:id", authMiddleware, obtenerContenidoPlantilla);

module.exports = router;