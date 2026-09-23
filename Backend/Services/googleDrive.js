const {google} = require("googleapis");
const fs = require("fs");
const path = require("path");
const pool = require("../Databases/db");
require("dotenv").config();

const RUTA_CREDENCIALES = process.env.GOOGLE_SERVICE_ACCOUNT_PATH;
const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;
const FOLDER_CONTRATOS_ID = process.env.GOOGLE_DRIVE_CONTRATOS_FOLDER_ID || "1ipvNm0ODa_hshBJMziid_D4POdq7l9ni";

const OAUTH_CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID;
const OAUTH_CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
const OAUTH_REDIRECT_URI = process.env.GOOGLE_OAUTH_REDIRECT_URI || "http://localhost:3000/auth/google/callback";
const RUTA_TOKEN_OAUTH = path.resolve(__dirname, "..", "config", "drive-token.json");

let drive = null;
let configError = null;

function crearClienteOAuth() {
    if (!OAUTH_CLIENT_ID || !OAUTH_CLIENT_SECRET) return null;
    return new google.auth.OAuth2(OAUTH_CLIENT_ID, OAUTH_CLIENT_SECRET, OAUTH_REDIRECT_URI);
}

async function guardarTokensEnDb(tokens) {
    try {
        await pool.query(
            `INSERT INTO config_google (id, tokens)
             VALUES (1, $1)
             ON CONFLICT (id) DO UPDATE SET tokens = EXCLUDED.tokens`,
            [JSON.stringify(tokens)]
        );
        return true;
    } catch (e) {
        console.warn("No se pudo guardar el token en la base de datos:", e.message);
        return false;
    }
}

async function leerTokensDeDb() {
    try {
        const resultado = await pool.query("SELECT tokens FROM config_google WHERE id = 1");
        const tokens = resultado.rows[0]?.tokens;
        return tokens && tokens.refresh_token ? tokens : null;
    } catch (e) {
        return null;
    }
}

async function leerTokenOAuth() {
    const deDb = await leerTokensDeDb();
    if (deDb) return deDb;

    try {
        if (fs.existsSync(RUTA_TOKEN_OAUTH)) {
            const datos = JSON.parse(fs.readFileSync(RUTA_TOKEN_OAUTH, "utf8"));
            return datos.refresh_token ? datos : null;
        }
    } catch (e) {
        console.error("No se pudo leer el token de OAuth:", e.message);
    }
    return null;
}

function reiniciarDrive() {
    drive = null;
}

async function inicializarDrive() {
    // 1) Cuenta personal (OAuth): permite leer plantillas y crear contratos sin límite de cuota
    const token = await leerTokenOAuth();
    const cliente = crearClienteOAuth();
    if (token && cliente) {
        cliente.setCredentials(token);
        drive = google.drive({version: "v3", auth: cliente});
        configError = null;
        return drive;
    }

    // 2) Fallback: cuenta de servicio (útil solo para lectura de plantillas)
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

async function obtenerDrive() {
    if (!drive) await inicializarDrive();
    return drive;
}

async function obtenerErrorConfig() {
    if (!drive) await inicializarDrive();
    return configError;
}

function generarUrlAutorizacion(redirectUri) {
    const cliente = crearClienteOAuth();
    if (!cliente) {
        throw new Error("Faltan GOOGLE_OAUTH_CLIENT_ID o GOOGLE_OAUTH_CLIENT_SECRET en el .env");
    }
    return cliente.generateAuthUrl({
        access_type: "offline",
        prompt: "consent",
        redirect_uri: redirectUri || OAUTH_REDIRECT_URI,
        scope: [
            "https://www.googleapis.com/auth/drive",
            "https://www.googleapis.com/auth/userinfo.email"
        ]
    });
}

async function guardarTokenDesdeCodigo(code, redirectUri) {
    const cliente = crearClienteOAuth();
    if (!cliente) throw new Error("Faltan credenciales OAuth en el .env");

    const {tokens} = await cliente.getToken({code, redirect_uri: redirectUri || OAUTH_REDIRECT_URI});
    if (!tokens.refresh_token) {
        throw new Error("No se obtuvo el token de actualización. Autoriza de nuevo.");
    }
    cliente.setCredentials(tokens);

    let correo = "";
    try {
        const oauth2 = google.oauth2({version: "v2", auth: cliente});
        const info = await oauth2.userinfo.get();
        correo = info.data.email || "";
    } catch (e) {
        // el correo es informativo; no bloqueamos
    }

    fs.mkdirSync(path.dirname(RUTA_TOKEN_OAUTH), {recursive: true});
    fs.writeFileSync(RUTA_TOKEN_OAUTH, JSON.stringify({...tokens, correo}, null, 2));
    await guardarTokensEnDb(tokens);
    reiniciarDrive();

    return {...tokens, correo};
}

async function informacionConexion() {
    const token = await leerTokenOAuth();
    const configurada = !!(OAUTH_CLIENT_ID && OAUTH_CLIENT_SECRET);
    return {
        conectado: configurada && !!token,
        configurada,
        correo: token ? token.correo || "" : ""
    };
}

async function listarPlantillas() {
    const d = await obtenerDrive();
    if (!d) throw new Error(configError || "Google Drive no configurado");

    const res = await d.files.list({
        q: `'${FOLDER_ID}' in parents and trashed = false`,
        fields: "files(id, name, mimeType)",
        orderBy: "name"
    });

    return res.data.files || [];
}

async function obtenerMetadatos(fileId) {
    const d = await obtenerDrive();
    if (!d) throw new Error(configError || "Google Drive no configurado");

    const meta = await d.files.get({fileId, fields: "id, name, mimeType"});
    return meta.data;
}

async function obtenerContenido(fileId) {
    const d = await obtenerDrive();
    if (!d) throw new Error(configError || "Google Drive no configurado");

    const meta = await obtenerMetadatos(fileId);
    const nombre = meta.name;
    const mime = meta.mimeType;

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

async function crearDocumentoGoogle({nombre, html}) {
    const d = await obtenerDrive();
    if (!d) throw new Error(configError || "Google Drive no configurado");

    const res = await d.files.create({
        requestBody: {
            name: nombre,
            mimeType: "application/vnd.google-apps.document",
            parents: [FOLDER_CONTRATOS_ID]
        },
        media: {
            mimeType: "text/html",
            body: html
        },
        fields: "id, name, mimeType, webViewLink"
    });

    return res.data;
}

async function listarContratos() {
    const d = await obtenerDrive();
    if (!d) throw new Error(configError || "Google Drive no configurado");

    const res = await d.files.list({
        q: `'${FOLDER_CONTRATOS_ID}' in parents and trashed = false`,
        fields: "files(id, name, mimeType, size, createdTime, webViewLink)",
        orderBy: "createdTime desc",
        pageSize: 500
    });

    return res.data.files || [];
}

module.exports = {
    listarPlantillas,
    obtenerMetadatos,
    obtenerContenido,
    crearDocumentoGoogle,
    listarContratos,
    obtenerErrorConfig,
    generarUrlAutorizacion,
    guardarTokenDesdeCodigo,
    informacionConexion
};