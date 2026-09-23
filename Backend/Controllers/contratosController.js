const { crearDocumentoGoogle, listarContratos, obtenerErrorConfig } = require("../Services/googleDrive");

async function listarContratosCtrl(req, res) {
    try {
        const error = await obtenerErrorConfig();
        if (error) return res.status(500).json({mensaje: error});

        const archivos = await listarContratos();
        return res.json(archivos);
    } catch (error) {
        console.error("Error listando contratos:", error.message);

        let mensaje = error.message || "Error al consultar los contratos en Drive";
        if (/quota|no storage quota|storage/i.test(String(error.message))) {
            mensaje = "La cuenta conectada no tiene espacio disponible en Google Drive.";
        } else if (/notFound|permission|403|forbidden/i.test(String(error.message))) {
            mensaje = "No se pudo acceder a la carpeta 'Contratos generados'. Revisa que exista y que la cuenta de Google tenga acceso.";
        }

        return res.status(500).json({mensaje});
    }
}

async function generarContrato(req, res) {
    try {
        const { nombre, html } = req.body || {};

        if (typeof html !== "string" || !html.trim()) {
            return res.status(400).json({ mensaje: "Falta el contenido (html) del contrato" });
        }

        const nombreFinal = typeof nombre === "string" && nombre.trim()
            ? nombre.trim()
            : `Contrato generado ${new Date().toISOString().slice(0, 10)}`;

        const doc = await crearDocumentoGoogle({ nombre: nombreFinal, html });

        return res.status(201).json({
            id: doc.id,
            name: doc.name,
            webViewLink: doc.webViewLink
        });

    } catch (error) {
        console.error("Error al generar contrato en Drive:", error.message);

        let mensaje = error.message || "Error al generar el contrato en Google Drive";

        if (/storagequota|no storage quota|storage quota has been exceeded/i.test(String(error.message))) {
            mensaje = "La cuenta de servicio no puede crear archivos en Mi unidad. Mueve la carpeta 'Contratos generados' a un Shared Drive y compártelo con la cuenta de servicio, o configura acceso OAuth.";
        } else if (/notFound|permission|403|forbidden|shared drive/i.test(String(error.message))) {
            mensaje = "No se pudo acceder a la carpeta de contratos. Comparte el Shared Drive 'Contratos generados' con la cuenta de servicio con rol Content Manager.";
        }

        return res.status(500).json({ mensaje });
    }
}

module.exports = { generarContrato, listarContratosCtrl };