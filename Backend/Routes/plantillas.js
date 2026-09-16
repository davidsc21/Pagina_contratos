const express = require("express");
const router = express.Router();

const {
    obtenerPlantillas,
    obtenerContenidoPlantilla
} = require("../Controllers/plantillasController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware, obtenerPlantillas);
router.get("/:id", authMiddleware, obtenerContenidoPlantilla);

module.exports = router;