const {google} = require("googleapis");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const RUTA_CREDENCIALES = process.env.GOOGLE_SERVICE_ACCOUNT_PATH;
const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;

let drive = null;
let configError = null;

function inicializarDrive() {
    if (!RUTA_CREDENCIALES || !FOLDER_ID) {
        configError = "Faltan las variables GOOGLE_SERVICE_ACCOUNT_PATH o GOOGLE_DRIVE_FOLDER_ID en el .env";
        return null;
    }

    const rutaResuelta = path.resolve(RUTA_CREDENCIALES);
    if (!fs.existsSync(rutaResuelta)) {
        configError = `No se encontró el archivo de credenciales: ${rutaResuelta}`;
        return null;
    }

    const auth = new google.auth.GoogleAuth({
        keyFile: rutaResuelta,
        scopes: ["https://www.googleapis.com/auth/drive.readonly"]
    });

    drive = google.drive({version: "v3", auth});
    configError = null;
    return drive;
}

function obtenerDrive() {
    if (!drive) inicializarDrive();
    return drive;
}

function obtenerErrorConfig() {
    if (!drive) inicializarDrive();
    return configError;
}

async function listarPlantillas() {
    const d = obtenerDrive();
    if (!d) throw new Error(configError || "Google Drive no configurado");

    const res = await d.files.list({
        q: `'${FOLDER_ID}' in parents and trashed = false`,
        fields: "files(id, name, mimeType)",
        orderBy: "name"
    });

    return res.data.files || [];
}

async function obtenerContenido(fileId) {
    const d = obtenerDrive();
    if (!d) throw new Error(configError || "Google Drive no configurado");

    const meta = await d.files.get({fileId, fields: "id, name, mimeType"});
    const nombre = meta.data.name;
    const mime = meta.data.mimeType;

    if (mime === "application/vnd.google-apps.document") {
        const res = await d.files.export({fileId, mimeType: "text/html"});
        let html = res.data;

        const coincidencia = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        if (coincidencia) html = coincidencia[1];

        return {name: nombre, html};
    }

    if (mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        const res = await d.files.get({fileId, alt: "media"}, {responseType: "arraybuffer"});
        const buffer = Buffer.from(res.data);
        const mammoth = require("mammoth");
        const resultado = await mammoth.convertToHtml({buffer});
        return {name: nombre, html: resultado.value};
    }

    if (mime === "text/plain") {
        const res = await d.files.get({fileId, alt: "media"}, {responseType: "text"});
        return {name: nombre, html: `<pre style="white-space: pre-wrap;">${res.data}</pre>`};
    }

    throw new Error(`Formato no soportado: ${mime}`);
}

module.exports = {listarPlantillas, obtenerContenido, obtenerErrorConfig};