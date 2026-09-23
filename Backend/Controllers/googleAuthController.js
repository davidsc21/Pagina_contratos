const googleDrive = require("../Services/googleDrive");

function construirRedirectUri(req) {
    return `${req.protocol}://${req.get("host")}/auth/google/callback`;
}

function iniciarAuthGoogle(req, res) {
    try {
        const url = googleDrive.generarUrlAutorizacion(construirRedirectUri(req));
        return res.json({url});
    } catch (error) {
        console.error("Error generando URL de autorización:", error.message);
        return res.status(500).json({mensaje: error.message});
    }
}

async function callbackGoogle(req, res) {
    const {code, error} = req.query;

    if (error) {
        return res.status(400).send(htmlRespuesta(
            "Autorización denegada",
            "No otorgaste acceso a Google. Puedes cerrar esta ventana e intentarlo de nuevo.",
            "error"
        ));
    }

    if (!code) {
        return res.status(400).send("Falta el parámetro code");
    }

    try {
        const datos = await googleDrive.guardarTokenDesdeCodigo(code, construirRedirectUri(req));
        return res.send(htmlRespuesta(
            "Cuenta conectada",
            `Google Drive quedó conectado${datos.correo ? ` con ${datos.correo}` : ""}. Ya puedes cerrar esta ventana y volver a la aplicación.`,
            "ok"
        ));
    } catch (err) {
        console.error("Error intercambiando el código OAuth:", err.message);
        return res.status(500).send(htmlRespuesta(
            "Error al conectar",
            err.message || "No se pudo completar la conexión con Google.",
            "error"
        ));
    }
}

async function estadoGoogle(req, res) {
    const estado = await googleDrive.informacionConexion();
    return res.json(estado);
}

function htmlRespuesta(titulo, mensaje, tipo) {
    const color = tipo === "ok" ? "#1e7e34" : "#c0392b";
    return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${titulo}</title>
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f6f8; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
        .caja { background: #fff; border-radius: 12px; box-shadow: 0 6px 24px rgba(0,0,0,.08); padding: 32px 40px; max-width: 420px; text-align: center; }
        h1 { font-size: 1.3rem; color: ${color}; margin: 0 0 12px; }
        p { color: #444; font-size: .95rem; line-height: 1.5; }
    </style>
</head>
<body>
    <div class="caja">
        <h1>${titulo}</h1>
        <p>${mensaje}</p>
    </div>
</body>
</html>`;
}

module.exports = {iniciarAuthGoogle, callbackGoogle, estadoGoogle};