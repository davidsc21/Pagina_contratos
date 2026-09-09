const pool = require("../Databases/db");
const bcrypt = require("bcrypt");

const obtenerUsuarios = async (req, res) =>  {
    try {
        const resultado = await pool.query(
            "SELECT id, nombre, apellido, correo, rol, creado_en FROM usuarios ORDER BY id ASC"
        );
        res.json(resultado.rows);

    } catch (error){
        console.error(error);
        res.status(500).json({
            mensaje: "error al obtener los usuarios"
        });
    }
};

const crearUsuario = async (req, res) => {
    console.log("REQ.BODY crearUsuario:", req.body);
    const {nombre, apellido, correo, password, rol} = req.body;

    try {
        const passwordHash = await bcrypt.hash(password, 10);
        const sql = `
        INSERT INTO usuarios (nombre, apellido, correo, password, rol)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, nombre, apellido, correo, rol, creado_en;
        `;
        const resultado = await pool.query(sql, [
            nombre, apellido, correo, passwordHash, rol || "usuario"
        ]);
        res.status(201).json(resultado.rows[0]);

    } catch (error) {
        console.error(error);
        if (error.code === "23505") {
            return res.status(400).json({
                mensaje: "El correo ya esta registrado"
            });
        }
        res.status(500).json({
            mensaje: "error al crear el usuario"
        });
    }
};

const actualizarUsuario = async (req, res) => {
    console.log("PUT actualizarUsuario id:", req.params.id, "body:", req.body);
    const {id} = req.params;
    const {nombre, apellido, correo, password, rol} = req.body;

    try {
        let sql;
        let valores;

        if (password) {
            const passwordHash = await bcrypt.hash(password, 10);
            sql = `
            UPDATE usuarios
            SET nombre = $1, apellido = $2, correo = $3, password = $4, rol = $5
            WHERE id = $6
            RETURNING id, nombre, apellido, correo, rol, creado_en;
            `;
            valores = [nombre, apellido, correo, passwordHash, rol, id];
        } else {
            sql = `
            UPDATE usuarios
            SET nombre = $1, apellido = $2, correo = $3, rol = $4
            WHERE id = $5
            RETURNING id, nombre, apellido, correo, rol, creado_en;
            `;
            valores = [nombre, apellido, correo, rol, id];
        }

        const resultado = await pool.query(sql, valores);

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                mensaje: "Usuario no encontrado"
            });
        }

        res.json(resultado.rows[0]);

    } catch (error) {
        console.error(error);
        if (error.code === "23505") {
            return res.status(400).json({
                mensaje: "El correo ya esta registrado"
            });
        }
        res.status(500).json({
            mensaje: "error al actualizar el usuario"
        });
    }
};

const eliminarUsuario = async (req, res) => {
    const {id} = req.params;

    try {
        const resultado = await pool.query(
            "DELETE FROM usuarios WHERE id = $1 RETURNING id",
            [id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                mensaje: "Usuario no encontrado"
            });
        }

        res.json({ mensaje: "Usuario eliminado" });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            mensaje: "error al eliminar el usuario"
        });
    }
};

module.exports = {obtenerUsuarios, crearUsuario, actualizarUsuario, eliminarUsuario};
