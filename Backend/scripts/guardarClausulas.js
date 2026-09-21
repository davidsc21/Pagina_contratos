const pool = require("../Databases/db");
const {obtenerContenido} = require("../Services/googleDrive");

const FILE_ID = "18H5WSng2h4d0Xbh6eno0wl-KOi9GUlMK";

const ORDINALES = [
    "PRIMERA", "SEGUNDA", "TERCERA", "CUARTA", "QUINTA", "SEXTA",
    "SÉPTIMA", "OCTAVA", "NOVENA", "DÉCIMA",
    "DÉCIMA PRIMERA", "DÉCIMA SEGUNDA", "DÉCIMA TERCERA", "DÉCIMA CUARTA",
    "DÉCIMA QUINTA", "DÉCIMA SEXTA", "DÉCIMA SÉPTIMA", "DÉCIMA OCTAVA",
    "DÉCIMA NOVENA", "VIGÉSIMA",
    "VIGÉSIMA PRIMERA", "VIGÉSIMA SEGUNDA", "VIGÉSIMA TERCERA",
    "VIGÉSIMA CUARTA", "VIGÉSIMA QUINTA", "VIGÉSIMA SEXTA",
    "VIGÉSIMA SÉPTIMA", "VIGÉSIMA OCTAVA", "VIGÉSIMA NOVENA",
    "TRIGÉSIMA", "TRIGÉSIMA PRIMERA", "TRIGÉSIMA SEGUNDA",
    "TRIGÉSIMA TERCERA", "TRIGÉSIMA CUARTA", "TRIGÉSIMA QUINTA",
    "TRIGÉSIMA SEXTA", "TRIGÉSIMA SÉPTIMA", "TRIGÉSIMA OCTAVA",
    "TRIGÉSIMA NOVENA", "CUADRAGÉSIMA", "CUADRAGÉSIMA PRIMERA"
];

const NUMEROS_SELECCIONADOS = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 25, 28, 32
];

function numeroOrdinal(valor) {
    const idx = ORDINALES.indexOf(valor);
    return idx === -1 ? null : idx + 1;
}

function separarClausulas(html) {
    const re = /<p><strong>CLÁUSULA ([^<]+?)<\/strong>/g;
    const coincidencias = [];
    let m;

    while ((m = re.exec(html)) !== null) {
        coincidencias.push({
            inicio: m.index,
            finEtiqueta: re.lastIndex,
            encabezado: m[1].replace(/\s+/g, " ").trim()
        });
    }

    return coincidencias.map((c, i) => {
        const siguiente = coincidencias[i + 1] ? coincidencias[i + 1].inicio : html.length;

        const ordinalTexto = c.encabezado.split(". ")[0].trim();

        return {
            numero: numeroOrdinal(ordinalTexto),
            titulo: c.encabezado.replace(/^[^.]+\.\s*/, "").replace(/:$/, "").trim(),
            contenido: html.slice(c.finEtiqueta, siguiente).trim()
        };
    });
}

(async () => {
    let crearTabla = null;

    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS clausulas (
                id SERIAL PRIMARY KEY,
                titulo VARCHAR(200) NOT NULL,
                contenido TEXT NOT NULL
            )
        `);

        const contenido = await obtenerContenido(FILE_ID);
        const clausulas = separarClausulas(contenido.html);

        if (clausulas.length === 0) {
            throw new Error("No se encontraron cláusulas en la plantilla");
        }

        const seleccionadas = clausulas
            .filter((c) => c.numero !== null && NUMEROS_SELECCIONADOS.includes(c.numero))
            .sort((a, b) => a.numero - b.numero);

        if (seleccionadas.length !== NUMEROS_SELECCIONADOS.length) {
            const encontrados = seleccionadas.map((c) => c.numero);
            throw new Error(`No se encontraron todas las cláusulas pedidas (${NUMEROS_SELECCIONADOS.join(",")}). Encontradas: ${encontrados.join(",")}`);
        }

        await pool.query("TRUNCATE clausulas RESTART IDENTITY");

        for (const c of seleccionadas) {
            await pool.query(
                "INSERT INTO clausulas (titulo, contenido) VALUES ($1, $2)",
                [c.titulo, c.contenido]
            );
        }

        console.log(`OK: ${seleccionadas.length} cláusulas guardadas en la tabla 'clausulas':`);
        seleccionadas.forEach((c) => console.log(`  ${c.numero}. ${c.titulo}`));
        console.log("(números internos de referencia; en la BD solo queda titulo y contenido)");

    } catch (error) {
        console.error("ERROR:", error.message);
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
})();