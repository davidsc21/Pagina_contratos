const pool = require("../Databases/db");

const mapearCliente = (fila) => ({
    id: fila.id_cliente,
    tipo_cliente: fila.tipo_cliente,
    nit_cc: fila.nit_cc,
    nombre: fila.nombre,
    representante_legal: fila.representante_legal,
    direccion: fila.direccion
});

const obtenerClientes = async (req, res) => {
    try {
        const resultado = await pool.query("SELECT * FROM cliente ORDER BY id_cliente ASC");
        res.json(resultado.rows.map(mapearCliente));

    } catch (error) {
        console.error(error);
        res.status(500).json({
            mensaje: "error al obtener los clientes"
        });
    }
};

const crearCliente = async (req, res) => {
    const {nombre, tipo_cliente, nit_cc, representante_legal, direccion} = req.body;

    try {
        const sql = `
            INSERT INTO cliente (tipo_cliente, nit_cc, nombre, representante_legal, direccion)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        `;
        const resultado = await pool.query(sql, [
            tipo_cliente,
            nit_cc,
            nombre,
            representante_legal || null,
            direccion || null
        ]);
        res.status(201).json(mapearCliente(resultado.rows[0]));

    } catch (error) {
        if (error.code === "23505") {
            return res.status(409).json({
                mensaje: "El NIT/CC ya está registrado"
            });
        }
        if (error.code === "23514") {
            return res.status(400).json({
                mensaje: "El tipo de cliente debe ser Natural o Juridico"
            });
        }
        if (error.code === "42P01") {
            return res.status(500).json({
                mensaje: "La tabla 'cliente' no existe. Ejecuta el script Databases/schema.sql"
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
    const {nombre, tipo_cliente, nit_cc, representante_legal, direccion} = req.body;

    try {
        const sql = `
            UPDATE cliente
            SET tipo_cliente = $1, nit_cc = $2, nombre = $3, representante_legal = $4, direccion = $5
            WHERE id_cliente = $6
            RETURNING *;
        `;
        const resultado = await pool.query(sql, [
            tipo_cliente,
            nit_cc,
            nombre,
            representante_legal || null,
            direccion || null,
            id
        ]);

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                mensaje: "cliente no encontrado"
            });
        }

        res.json(mapearCliente(resultado.rows[0]));

    } catch (error) {
        if (error.code === "23505") {
            return res.status(409).json({
                mensaje: "El NIT/CC ya está registrado"
            });
        }
        if (error.code === "23514") {
            return res.status(400).json({
                mensaje: "El tipo de cliente debe ser Natural o Juridico"
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
        const resultado = await pool.query("DELETE FROM cliente WHERE id_cliente = $1 RETURNING *", [id]);

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