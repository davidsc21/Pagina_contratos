const pool = require("../Databases/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const login = async(req, res) => {

    try {
        const {correo, password} = req.body;

        const resultado = await pool.query("SELECT * FROM  usuarios WHERE correo = $1", [correo]);

        if (resultado.rows.length === 0) {
        return res.status(401).json({
            mensaje: "correo o contraseña incorrectos"
        });
    }
        const usuario = resultado.rows[0];
        
        const passwordCorrecta = await bcrypt.compare(password, usuario.password);

        if(!passwordCorrecta){
            return res.status(401).json({
                mensaje: "correo o contraseña incorrecta"
            });
        }

        const token = jwt.sign({
            id: usuario.id,
            rol: usuario.rol
        },
            process.env.JWT_SECRET
        );

        console.log(token);

        res.json({
            mensaje: "Login exitoso",
            token,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                apellido: usuario.apellido,
                correo: usuario.correo,
                rol: usuario.rol
            }
        });
    }catch (error){

        res.status(500).json({
            mensaje: "Error en el login"
        });
    }

};

module.exports = {
    login
};