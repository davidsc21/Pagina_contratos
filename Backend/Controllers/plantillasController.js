const {
    obtenerMetadatos,
    obtenerContenido,
    obtenerErrorConfig
} = require("../Services/googleDrive");
const pool = require("../Databases/db");

const obtenerTiposContrato = async (req, res) => {
    try {
        const resultado = await pool.query(
            "SELECT id, nombre FROM tipos_contrato ORDER BY nombre"
        );
        res.json(resultado.rows);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            mensaje: "error al obtener los tipos de contrato"
        });
    }
};

const obtenerPlantillas = async (req, res) => {
    try {
        if (obtenerErrorConfig()) {
            return res.status(503).json({mensaje: obtenerErrorConfig()});
        }

        const {tipo} = req.query;

        if (tipo && !/^\d+$/.test(String(tipo))) {
            return res.status(400).json({mensaje: "El tipo de contrato indicado no es válido"});
        }

        const resultado = await pool.query(
            `SELECT archivo_id AS id, nombre AS name, tipo_id
             FROM plantillas
             ${tipo ? "WHERE tipo_id = $1" : ""}
             ORDER BY nombre`,
            tipo ? [tipo] : []
        );

        const plantillas = await Promise.all(resultado.rows.map(async (plantilla) => {
            let name = plantilla.name;

            try {
                const meta = await obtenerMetadatos(plantilla.id);
                if (meta && meta.name) name = meta.name;
            } catch (error) {
                console.error(`No se pudo leer el nombre en Drive de ${plantilla.id}:`, error.message);
            }

            return {id: plantilla.id, name, tipo_id: plantilla.tipo_id};
        }));

        res.json(plantillas);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            mensaje: "error al obtener las plantillas"
        });
    }
};

const obtenerContenidoPlantilla = async (req, res) => {
    const {id} = req.params;

    try {
        if (obtenerErrorConfig()) {
            return res.status(503).json({mensaje: obtenerErrorConfig()});
        }

        const contenido = await obtenerContenido(id);
        res.json(contenido);

    } catch (error) {
        if (error.code === 403) {
            return res.status(403).json({
                mensaje: "Google Drive rechazó el acceso a la plantilla."
            });
        }
        console.error(error);
        res.status(500).json({
            mensaje: "error al obtener el contenido de la plantilla"
        });
    }
};

module.exports = {obtenerTiposContrato, obtenerPlantillas, obtenerContenidoPlantilla};