const { adaptarClausula, generarObjetivoGeneral } = require("../Services/gemini");

function responderError(res, error) {
    const sinConfigurar = error.codigo === "IA_SIN_CONFIGURAR";
    console.error("Error en /ia:", error.message);

    return res.status(sinConfigurar ? 503 : (error.status || 500)).json({
        mensaje: sinConfigurar
            ? "La clave de Gemini no está configurada. Agrega GEMINI_API_KEY en Backend/.env"
            : (error.message || "Error al procesar la solicitud")
    });
}

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
        return responderError(res, error);
    }
}

async function generarObjetivoGeneralCtrl(req, res) {
    try {
        const { objetivo } = req.body || {};

        if (typeof objetivo !== "string" || !objetivo.trim()) {
            return res.status(400).json({ mensaje: "Se requiere el 'objetivo' del contrato" });
        }

        const texto = await generarObjetivoGeneral(objetivo.trim());

        return res.json({ texto });

    } catch (error) {
        return responderError(res, error);
    }
}

module.exports = {
    adaptarClausula: adaptarClausulaCtrl,
    generarObjetivoGeneral: generarObjetivoGeneralCtrl
};