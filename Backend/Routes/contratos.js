const router = require("express").Router();
const authMiddleware = require("../middleware/authMiddleware");
const { generarContrato, listarContratosCtrl } = require("../Controllers/contratosController");

router.get("/", authMiddleware, listarContratosCtrl);
router.post("/", authMiddleware, generarContrato);

module.exports = router;