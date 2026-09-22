const express = require("express");
const cors = require("cors");
const pool = require("./Databases/db");
const usuariosRoutes = require("./Routes/usuarios");
const authRoutes = require("./Routes/auth");
const clientesRoutes = require("./Routes/clientes");
const buscarClienteRoutes = require("./Routes/buscarCliente");
const plantillasRoutes = require("./Routes/plantillas");
const clausulasRoutes = require("./Routes/clausulas");
const iaRoutes = require("./Routes/ia");
const contratosRoutes = require("./Routes/contratos");
const googleAuthRoutes = require("./Routes/googleAuth");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/usuarios", usuariosRoutes);
app.use("/auth", authRoutes);
app.use("/auth", googleAuthRoutes);
app.use("/clientes", clientesRoutes);
app.use("/buscar-cliente", buscarClienteRoutes);
app.use("/plantillas", plantillasRoutes);
app.use("/clausulas", clausulasRoutes);
app.use("/ia", iaRoutes);
app.use("/contratos", contratosRoutes);

app.use((err, req, res, next) => {
    console.error("ERROR NO MANEJADO:", err);
    res.status(500).json({ mensaje: "Error interno del servidor" });
});

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