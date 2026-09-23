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
-- Tabla de cláusulas seleccionables de los contratos
-- (titulo y contenido, sin número; el número se asigna por orden)
-- ============================================================

CREATE TABLE IF NOT EXISTS clausulas (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    contenido TEXT NOT NULL
);

-- ============================================================
-- Tipos de contrato y sus plantillas de Drive
-- (permite agregar más tipos en el futuro sin tocar el código)
-- ============================================================

CREATE TABLE IF NOT EXISTS tipos_contrato (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS plantillas (
    id SERIAL PRIMARY KEY,
    tipo_id INTEGER NOT NULL REFERENCES tipos_contrato(id) ON DELETE CASCADE,
    archivo_id VARCHAR(200) NOT NULL UNIQUE,
    nombre VARCHAR(255) NOT NULL
);

-- ============================================================
-- Token de OAuth de Google (cuenta personal que genera contratos)
-- Se guarda en la base de datos para que sobreviva a los despliegues
-- de la app en la nube (el disco del servidor es efímero).
-- ============================================================

CREATE TABLE IF NOT EXISTS config_google (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    tokens JSONB,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- Para crear un usuario administrador ejecuta:
--
--   UPDATE usuarios SET rol = 'admin'
--   WHERE correo = 'usuario@correo.com';
--
-- ============================================================
