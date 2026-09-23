const { Pool } = require("pg");
const dns = require("dns");
require("dotenv").config();

const DATABASE_URL = process.env.DATABASE_URL;
const SSL = process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined;

let promesa;

function construirPoolLocal() {
    return new Pool({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });
}

// pg crea el socket solo con (puerto, host) y no respeta la opción family,
// por lo que en hosts sin IPv6 (p. ej. Render) puede fallar intentando IPv6.
// Solución: resolver el hostname a su IPv4 y conectar a esa dirección literal.
function construirPoolConIPv4() {
    return new Promise((resolve) => {
        const url = new URL(DATABASE_URL);
        const host = url.hostname;

        dns.lookup(host, { family: 4 }, (error, direccion) => {
            if (error) {
                console.error("[db] no se pudo resolver IPv4 de", host, "->", error.message, "usando el host original");
                url.hostname = host;
            } else {
                console.log(`[db] resolviendo ${host} -> ${direccion} (IPv4)`);
                url.hostname = direccion;
            }
            resolve(new Pool({ connectionString: url.toString(), ssl: SSL }));
        });
    });
}

function obtenerPool() {
    if (!promesa) {
        promesa = DATABASE_URL ? construirPoolConIPv4() : Promise.resolve(construirPoolLocal());
    }
    return promesa;
}

module.exports = new Proxy({}, {
    get(_obj, propiedad) {
        if (propiedad === "then") return undefined;
        return (...args) => obtenerPool().then((pool) => {
            const valor = pool[propiedad];
            return typeof valor === "function" ? valor.apply(pool, args) : valor;
        });
    }
});