const adminMiddleware = (req, res, next) => {
    if (req.usuario && req.usuario.rol === "admin") {
        return next();
    }

    return res.status(403).json({
        mensaje: "Acceso denegado. Se requieren permisos de administrador"
    });
};

module.exports = adminMiddleware;