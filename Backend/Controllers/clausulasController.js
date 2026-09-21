const pool = require("../Databases/db");

const obtenerClausulas = async (req, res) => {
    try {
        const resultado = await pool.query("SELECT id, titulo, contenido FROM clausulas ORDER BY id ASC");
        res.json(resultado.rows);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            mensaje: "error al obtener las cláusulas"
        });
    }
};

module.exports = {
    obtenerClausulas
};