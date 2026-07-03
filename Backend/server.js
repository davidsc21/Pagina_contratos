const express = require("express");
const cors = require("cors");
const pool = require("./Databases/db");
const usuariosRoutes = require("./Routes/usuarios");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/usuarios", usuariosRoutes);
/*app.get("/", (req, res) => {
    res.send("Servidor funcionando 🚀");
});*/

app.get("/", async (req, res) => {
    try {

        const resultado = await pool.query("SELECT NOW()");

        res.json({
            mensaje: "Conexión exitosa con PostgreSQL",
            fecha: resultado.rows[0]
        });

    } catch (error) {

    console.error("ERROR:", error);

    res.status(500).json({
        mensaje: error.message
    });

}
    
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor iniciado en http://localhost:${PORT}`);
});