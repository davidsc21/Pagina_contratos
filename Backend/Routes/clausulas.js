const express = require("express");
const router = express.Router();

const {obtenerClausulas} = require("../Controllers/clausulasController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware, obtenerClausulas);

module.exports = router;