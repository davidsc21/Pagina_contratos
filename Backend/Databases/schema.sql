-- ============================================================
-- Tabla de usuarios
-- Ejecutar en la base Contratos_db (PostgreSQL)
-- ============================================================

CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    apellido VARCHAR(150) NOT NULL,
    correo VARCHAR(120) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL DEFAULT 'usuario',
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- Tabla de clientes (usada por la página de administración)
-- ============================================================

CREATE TABLE IF NOT EXISTS cliente (
    id_cliente SERIAL PRIMARY KEY,
    tipo_cliente VARCHAR(10) NOT NULL
        CHECK (tipo_cliente IN ('Natural', 'Juridico')),
    nit_cc VARCHAR(20) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    representante_legal VARCHAR(100)
);

-- ============================================================
-- Para crear un usuario administrador ejecuta:
--
--   UPDATE usuarios SET rol = 'admin'
--   WHERE correo = 'usuario@correo.com';
--
-- ============================================================
