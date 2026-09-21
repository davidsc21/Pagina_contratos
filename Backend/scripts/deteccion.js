const pool = require("../Databases/db");

(async () => {
  const r = await pool.query(
    "SELECT id, titulo, contenido FROM clausulas ORDER BY id"
  );
  const conFrente = [];
  const conParagrafo = [];
  r.rows.forEach((c) => {
    if (/frente/i.test(c.titulo + " " + c.contenido)) conFrente.push(c.id + " " + c.titulo);
    if (/par[aá]grafo/i.test(c.titulo + " " + c.contenido)) conParagrafo.push(c.id + " " + c.titulo);
  });
  console.log("=== CON 'FRENTE' ===");
  conFrente.forEach((x) => console.log("  " + x));
  console.log("=== CON 'PARAGRAFO' ===");
  conParagrafo.forEach((x) => console.log("  " + x));
  await pool.end();
})();