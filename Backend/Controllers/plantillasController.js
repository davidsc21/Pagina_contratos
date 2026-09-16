const {
    listarPlantillas,
    obtenerContenido,
    obtenerErrorConfig
} = require("../Services/googleDrive");

const obtenerPlantillas = async (req, res) => {
    try {
        if (obtenerErrorConfig()) {
            return res.status(503).json({mensaje: obtenerErrorConfig()});
        }

        const plantillas = await listarPlantillas();
        res.json(plantillas);

    } catch (error) {
        if (error.code === 403) {
            return res.status(403).json({
                mensaje: "Google Drive rechazó el acceso. Comparte la carpeta con la cuenta de servicio."
            });
        }
        console.error(error);
        res.status(500).json({
            mensaje: "error al obtener las plantillas de Google Drive"
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

module.exports = {obtenerPlantillas, obtenerContenidoPlantilla};