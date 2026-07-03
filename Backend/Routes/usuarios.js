const express = require("express");
const router = express.Router();
const pool = require("../Databases/db");
router.get("/", async (req, res) => {
    try {
        const resultado = await pool.query("SELECT * FROM usuarios");
        res.json(resultado.rows);
    } catch (error){
        console.error(error);
        res.status(500).json({
            mensaje: "error al obtener los usuarios"
        });
    }
});

module.exports = router;