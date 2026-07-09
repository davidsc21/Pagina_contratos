const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    
    const token = req.headers.authorization;
    if (!token){
        return res.status(401).json({
            mensaje: "Acceso denegado. Debe iniciar sesión"
        });
    }
    const tokenLimpio = token.split(" ")[1];

    const decoded = jwt.verify(
        tokenLimpio,
        process.env.JWT_SECRET
    );

    try {
        const decoded = jwt.verify(
            tokenLimpio,
            process.env.JWT_SECRET
        );

        req.usuario = decoded;
        next();

    } catch (error){
        return res.status(401).json({
            mensaje: "Token invalido"
        });
    }

};

module.exports = authMiddleware;
