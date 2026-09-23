const fs = require("fs");
const path = require("path");
const pool = require("../Databases/db");

const TABLAS = ["usuarios", "cliente", "clausulas", "tipos_contrato", "plantillas", "config_google"];
const SECUENCIAS = [
    ["usuarios_id_seq", "usuarios", "id"],
    ["cliente_id_cliente_seq", "cliente", "id_cliente"],
    ["clausulas_id_seq", "clausulas", "id"],
    ["tipos_contrato_id_seq", "tipos_contrato", "id"],
    ["plantillas_id_seq", "plantillas", "id"]
];

function escapar(valor) {
    if (valor === null || valor === undefined) return "NULL";
    if (typeof valor === "number") return String(valor);
    if (typeof valor === "boolean") return valor ? "true" : "false";
    return "'" + String(valor).replace(/'/g, "''") + "'";
}

async function exportar() {
    const rutasSalida = [];
    const filasTotales = [];

    for (const tabla of TABLAS) {
        const res = await pool.query(`SELECT * FROM ${tabla} ORDER BY 1`);
        filasTotales.push({tabla, filas: res.rows, columnas: res.fields.map((f) => f.name)});
    }

    const schema = fs.readFileSync(path.join(__dirname, "..", "Databases", "schema.sql"), "utf8");

    const salida = [
        "-- ============================================================",
        "-- Respaldo generado automaticamente: " + new Date().toISOString(),
        "-- Aplicar en Supabase: SQL Editor > New query > pegar y ejecutar",
        "-- ============================================================",
        "",
        schema.trim(),
        ""
    ];

    for (const {tabla, filas, columnas} of filasTotales) {
        if (filas.length === 0) continue;
        salida.push(`-- Datos de ${tabla} (${filas.length} registros)`);
        for (const fila of filas) {
            const valores = columnas.map((col) => escapar(fila[col])).join(", ");
            salida.push(`INSERT INTO ${tabla} (${columnas.join(", ")}) VALUES (${valores});`);
        }
        salida.push("");
    }

    for (const [secuencia, tabla, columna] of SECUENCIAS) {
        salida.push(`SELECT setval('${secuencia}', (SELECT COALESCE(MAX(${columna}), 1) FROM ${tabla}));`);
    }
    salida.push("");

    const rutaFinal = path.join(__dirname, "backup_contratos.sql");
    fs.writeFileSync(rutaFinal, salida.join("\n"), "utf8");

    console.log("Respaldo generado en:", rutaFinal);
    const total = filasTotales.reduce((acc, t) => acc + t.filas.length, 0);
    console.log("Registros exportados:", total);
    await pool.end();
}

exportar().catch((e) => {
    console.error("ERROR:", e.message);
    process.exit(1);
});