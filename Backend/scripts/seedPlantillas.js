const pool = require("../Databases/db");

const TIPO = "Prestación de servicios";
const ARCHIVO_ID = "18H5WSng2h4d0Xbh6eno0wl-KOi9GUlMK";
const NOMBRE = "260916-41 Contrato INDUSTRIAS AVM SA.docx";

(async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS tipos_contrato (
                id SERIAL PRIMARY KEY,
                nombre VARCHAR(100) NOT NULL UNIQUE
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS plantillas (
                id SERIAL PRIMARY KEY,
                tipo_id INTEGER NOT NULL REFERENCES tipos_contrato(id) ON DELETE CASCADE,
                archivo_id VARCHAR(200) NOT NULL UNIQUE,
                nombre VARCHAR(255) NOT NULL
            )
        `);

        const tipo = await pool.query(
            `INSERT INTO tipos_contrato (nombre) VALUES ($1)
             ON CONFLICT (nombre) DO UPDATE SET nombre = EXCLUDED.nombre
             RETURNING id`,
            [TIPO]
        );

        await pool.query(
            `INSERT INTO plantillas (tipo_id, archivo_id, nombre)
             VALUES ($1, $2, $3)
             ON CONFLICT (archivo_id) DO UPDATE
                SET tipo_id = EXCLUDED.tipo_id, nombre = EXCLUDED.nombre`,
            [tipo.rows[0].id, ARCHIVO_ID, NOMBRE]
        );

        const r = await pool.query(
            `SELECT p.nombre, t.nombre AS tipo
             FROM plantillas p JOIN tipos_contrato t ON t.id = p.tipo_id
             ORDER BY t.nombre, p.nombre`
        );

        console.log("OK: tipos y plantillas registrados");
        r.rows.forEach((x) => console.log(`  [${x.tipo}] ${x.nombre}`));

    } catch (error) {
        console.error("ERROR:", error.message);
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
})();