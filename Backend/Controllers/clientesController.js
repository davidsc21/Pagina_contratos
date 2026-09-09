const pool = require("../Databases/db");

const obtenerClientes = async (req, res) => {
    try {
        const resultado = await pool.query("SELECT * FROM clientes ORDER BY id ASC");
        res.json(resultado.rows);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            mensaje: "error al obtener los clientes"
        });
    }
};

const crearCliente = async (req, res) => {
    const {nombre, documento, correo, telefono} = req.body;

    try {
        const sql = `
            INSERT INTO clientes (nombre, documento, correo, telefono)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;
        const resultado = await pool.query(sql, [nombre, documento, correo || null, telefono || null]);
        res.status(201).json(resultado.rows[0]);

    } catch (error) {
        if (error.code === "23505") {
            return res.status(409).json({
                mensaje: "El documento ya está registrado"
            });
        }
        if (error.code === "42P01") {
            return res.status(500).json({
                mensaje: "La tabla 'clientes' no existe. Ejecuta el script Databases/schema.sql"
            });
        }
        console.error(error);
        res.status(500).json({
            mensaje: "error al crear el cliente"
        });
    }
};

const actualizarCliente = async (req, res) => {
    const {id} = req.params;
    const {nombre, documento, correo, telefono} = req.body;

    try {
        const sql = `
            UPDATE clientes
            SET nombre = $1, documento = $2, correo = $3, telefono = $4
            WHERE id = $5
            RETURNING *;
        `;
        const resultado = await pool.query(sql, [nombre, documento, correo || null, telefono || null, id]);

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                mensaje: "cliente no encontrado"
            });
        }

        res.json(resultado.rows[0]);

    } catch (error) {
        if (error.code === "23505") {
            return res.status(409).json({
                mensaje: "El documento ya está registrado"
            });
        }
        console.error(error);
        res.status(500).json({
            mensaje: "error al actualizar el cliente"
        });
    }
};

const eliminarCliente = async (req, res) => {
    const {id} = req.params;

    try {
        const resultado = await pool.query("DELETE FROM clientes WHERE id = $1 RETURNING *", [id]);

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                mensaje: "cliente no encontrado"
            });
        }

        res.json({
            mensaje: "cliente eliminado"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            mensaje: "error al eliminar el cliente"
        });
    }
};

module.exports = {
    obtenerClientes,
    crearCliente,
    actualizarCliente,
    eliminarCliente
};