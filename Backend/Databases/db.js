const { Pool } = require("pg");
require("dotenv").config();

// family: 4 fuerza IPv4; algunos hosts (p. ej. Render) no enrutan IPv6 a Supabase
const pool = process.env.DATABASE_URL
    ? new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === "production"
            ? { rejectUnauthorized: false }
            : undefined,
        family: 4
      })
    : new Pool({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        family: 4
    });

module.exports = pool;