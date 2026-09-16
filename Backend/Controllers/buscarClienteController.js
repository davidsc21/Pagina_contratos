const pool = require("../Databases/db");

const buscarCliente = async (req, res) => {
    const q = (req.query.q || "").trim();

    if (!q) {
        return res.json([]);
    }

    try {
        const termino = `%${q}%`;

        const resultado = await pool.query(
            `SELECT * FROM cliente
             WHERE nombre ILIKE $1 OR nit_cc ILIKE $1 OR representante_legal ILIKE $1
             ORDER BY nombre ASC
             LIMIT 20`,
            [termino]
        );

        res.json(resultado.rows);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            mensaje: "error al buscar el cliente"
        });
    }
};

module.exports = { buscarCliente };