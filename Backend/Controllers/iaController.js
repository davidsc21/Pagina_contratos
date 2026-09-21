const { adaptarClausula } = require("../Services/gemini");

async function adaptarClausulaCtrl(req, res) {
    try {
        const { titulo, contenido, objetivo } = req.body || {};

        if (typeof titulo !== "string" || !titulo.trim() || typeof contenido !== "string" || !contenido.trim()) {
            return res.status(400).json({ mensaje: "Se requieren 'titulo' y 'contenido' de la cláusula" });
        }

        const texto = await adaptarClausula({
            titulo: titulo.trim(),
            contenido: contenido.trim(),
            objetivo: String(objetivo || "").trim()
        });

        return res.json({ texto });

    } catch (error) {
        const sinConfigurar = error.codigo === "IA_SIN_CONFIGURAR";
        console.error("Error en /ia/adaptar-clausula:", error.message);

        return res.status(sinConfigurar ? 503 : (error.status || 500)).json({
            mensaje: sinConfigurar
                ? "La clave de Gemini no está configurada. Agrega GEMINI_API_KEY en Backend/.env"
                : (error.message || "Error al adaptar la cláusula")
        });
    }
}

module.exports = { adaptarClausula: adaptarClausulaCtrl };