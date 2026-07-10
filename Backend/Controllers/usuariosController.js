const pool = require("../Databases/db");
const bcrypt = require("bcrypt");

const obtenerUsuarios = async (req, res) =>  {
    try {
        const resultado = await pool.query("SELECT * FROM usuarios");
        res.json(resultado.rows);

    } catch (error){
        console.error(error);
        res.status(500).json({
            mensaje: "error al obtener los usuarios"
        });
    }
};

const crearUsuario = async (req, res) => {
    const {nombre, apellido, correo, password} = req.body;

    try {
        const sql = `
        INSERT INTO usuarios (nombre, apellido, correo, password)
        Values ($1,$2,$3,$4)
        RETURNING *;
        `;
        const passwordHash = await bcrypt.hash(password, 10);
        const resultado = await pool.query(sql, [nombre, apellido, correo, passwordHash]);
        res.status(201).json(resultado.rows[0]);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            mensaje: "error al crear el usuario"
        })
    }
}

module.exports = {obtenerUsuarios, crearUsuario};