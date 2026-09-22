const router = require("express").Router();
const authMiddleware = require("../middleware/authMiddleware");
const { generarContrato } = require("../Controllers/contratosController");

router.post("/", authMiddleware, generarContrato);

module.exports = router;