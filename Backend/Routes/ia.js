const express = require("express");
const router = express.Router();

const { adaptarClausula } = require("../Controllers/iaController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/adaptar-clausula", authMiddleware, adaptarClausula);

module.exports = router;