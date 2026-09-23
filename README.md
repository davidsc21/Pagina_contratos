# Pagina Contratos

Sistema web para la **generación automatizada de contratos** a partir de plantillas de Google Drive. Permite registrar clientes, seleccionar y personalizar cláusulas, y previsualizar el documento final en tiempo real antes de generarlo. Incluye apoyo de **Inteligencia Artificial (Google Gemini)** para adaptar cláusulas y proponer el título del contrato.

> **Estado:** versión provisional / en desarrollo activo. La funcionalidad principal está operativa y sujeta a cambios.

![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-5.x-000000?logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14%2B-4169E1?logo=postgresql&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-F7DF1E?logo=javascript&logoColor=black)

---

## Tabla de contenido

- [Características](#características)
- [Tecnologías](#tecnologías)
- [Arquitectura y estructura](#arquitectura-y-estructura)
- [Requisitos previos](#requisitos-previos)
- [Configuración](#configuración)
- [Puesta en marcha](#puesta-en-marcha)
- [API REST](#api-rest)
- [Base de datos](#base-de-datos)
- [Flujo de generación de contratos](#flujo-de-generación-de-contratos)
- [Integración con IA](#integración-con-ia)
- [Seguridad](#seguridad)
- [Roadmap](#roadmap)

---

## Características

- **Autenticación con JWT** y control de acceso por roles (`admin` / `usuario`).
- **Gestión de clientes**: listado, búsqueda dinámica, creación, edición y eliminación (persona Natural / Jurídica).
- **Gestión de usuarios** (solo administradores): creación, edición y eliminación.
- **Plantillas dinámicas**: los tipos de contrato y sus plantillas se almacenan en base de datos y se resuelven desde Google Drive, por lo que se pueden agregar nuevos tipos sin tocar el código.
- **Selección de cláusulas**: catálogo de cláusulas reutilizables que se insertan en el contrato según su orden.
- **Vista previa en tiempo real**: el contrato se arma y se muestra al instante a medida que se completan los datos.
- **Asistencia con IA (Google Gemini)**:
  - Adaptación de cláusulas según el objeto del contrato.
  - Generación automática de un título corto a partir de la descripción.
  - Generación de las consideraciones (CONSIDERANDOS) del contrato.
  - Las modificaciones hechas con IA o de forma manual aplican **solo al contrato en pantalla**, nunca al catálogo almacenado.
- **Generación directa en Google Drive**: con la cuenta de Google del usuario, el contrato armado se crea como **documento de Google** en la carpeta "Contratos generados".
- **Historial** de contratos generados.

---

## Tecnologías

**Backend**
- Node.js + Express 5
- PostgreSQL (`pg`)
- JSON Web Tokens (`jsonwebtoken`) y `bcrypt`
- `express-validator` para validación de datos
- Google APIs (`googleapis`) para Google Drive
- `mammoth` para extracción de texto desde documentos `.docx`
- `dotenv` para variables de entorno

**Frontend**
- HTML5, CSS3 y JavaScript (vanilla), sin frameworks
- Aplicación de una sola página (SPA) con enrutamiento por hash

**Servicios externos**
- Google Drive (plantillas de contratos y generación del documento final)
- Google Gemini (asistencia con IA)

---

## Arquitectura y estructura

```
Pagina_contratos/
├── Backend/
│   ├── Controllers/      Lógica de cada recurso (auth, clientes, usuarios, plantillas, cláusulas, IA)
│   ├── Routes/           Definición de endpoints y middlewares por ruta
│   ├── Services/         Integraciones externas (Google Drive, Google Gemini)
│   ├── middleware/       Autenticación, autorización de admin y validación
│   ├── Databases/        Conexión a PostgreSQL y esquema (schema.sql)
│   ├── scripts/          Utilidades de carga de datos (seed)
│   ├── config/           Credenciales locales (no versionadas)
│   ├── server.js         Punto de entrada del servidor
│   └── .env              Variables de entorno (no versionado)
├── Frontend/
│   ├── index.html        SPA principal (inicio, crear, historial, administración)
│   ├── login.html        Inicio de sesión
│   ├── CSS/              Estilos (styles, dashboard, crear, admin)
│   ├── JS/               Lógica de la aplicación (app.js, login.js)
│   └── Media/            Recursos gráficos
└── README.md
```

---

## Requisitos previos

- Node.js 18 o superior
- PostgreSQL 14 o superior
- Una **cuenta de Google** (personal) conectada mediante **OAuth** con acceso a las carpetas de Drive de plantillas y de contratos
- Una **clave de API de Google Gemini** (Google AI Studio)

> La cuenta de servicio es opcional y se usa solo como respaldo para consultar plantillas; la generación de contratos requiere la conexión OAuth de una cuenta personal con cuota.

---

## Configuración

Crea el archivo `Backend/.env` con las siguientes variables (usa tus propios valores):

```env
# Servidor
PORT=3000

# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_NAME=Contratos_db

# Autenticación
JWT_SECRET=una_clave_larga_y_segura

# Google Drive
GOOGLE_SERVICE_ACCOUNT_PATH=./config/service-account-key.json
GOOGLE_DRIVE_FOLDER_ID=id_de_la_carpeta_de_plantillas
GOOGLE_DRIVE_CONTRATOS_FOLDER_ID=id_de_la_carpeta_de_contratos

# Google OAuth (cuenta personal para generar contratos)
# Crear el ID de cliente OAuth (aplicación web) en Google Cloud Console con:
#   URI de redireccionamiento -> http://localhost:3000/auth/google/callback
GOOGLE_OAUTH_CLIENT_ID=tu_client_id
GOOGLE_OAUTH_CLIENT_SECRET=tu_client_secret
GOOGLE_OAUTH_REDIRECT_URI=http://localhost:3000/auth/google/callback

# Google Gemini
GEMINI_API_KEY=tu_api_key
GEMINI_MODEL=gemini-3.5-flash-lite
```

> El archivo `.env` y la carpeta `Backend/config/` están **excluidos del repositorio** (`.gitignore`). Nunca subas credenciales reales.

---

## Puesta en marcha

### 1. Base de datos

Crea la base de datos y aplica el esquema:

```bash
psql -U tu_usuario -d Contratos_db -f Backend/Databases/schema.sql
```

Carga los datos iniciales (tipos de contrato, plantillas y cláusulas):

```bash
cd Backend
node scripts/seedPlantillas.js
node scripts/guardarClausulas.js
```

### 2. Backend

```bash
cd Backend
npm install
npm start
```

El servidor queda disponible en `http://localhost:3000`.

### 3. Frontend

Sirve la carpeta `Frontend/` con cualquier servidor estático (por ejemplo, la extensión *Live Server*) y abre `login.html` para iniciar sesión.

> El backend ya incluye el servicio estático del frontend (`express.static`), por lo que en producción no se necesita un servidor aparte: un solo proceso sirve toda la aplicación.

---

## Publicación en la nube (Render + Supabase)

La aplicación está preparada para funcionar 24/7 desde la nube:

- **Render** (plan gratuito) sirve backend + frontend como un solo proceso Node.
- **Supabase** aloja la base de datos PostgreSQL.

### 1. Subir el código a GitHub

```bash
git add .
git commit -m "feat: :rocket: preparar despliegue en la nube"
git push
```

### 2. Crear la base de datos en Supabase

1. Crea un proyecto en [database.new](https://database.new).
2. Abre **SQL Editor → New query** y pega todo el contenido de `Backend/scripts/backup_contratos.sql` (exporta el esquema y los datos actuales) y ejecútalo.
3. Copia la **connection string** (Project Settings → Database) con la contraseña.

### 3. Crear el servicio web en Render

1. Entra a [render.com](https://render.com) → **New → Web Service** → conecta el repositorio de GitHub.
2. Si usas el `render.yaml` incluido, Render detecta el servicio automáticamente; o configura manualmente:
   - Root directory: `Backend`
   - Build: `npm install`
   - Start: `npm start`
3. En **Environment**, completa:
   - `DATABASE_URL`: la connection string de Supabase
   - `JWT_SECRET`: una clave larga y segura
   - `GEMINI_API_KEY`: tu clave de Gemini
   - `GOOGLE_OAUTH_CLIENT_ID` / `GOOGLE_OAUTH_CLIENT_SECRET`: tus credenciales OAuth
   - `GOOGLE_DRIVE_FOLDER_ID`: carpeta de plantillas
   - `GOOGLE_DRIVE_CONTRATOS_FOLDER_ID`: carpeta "Contratos generados"
   - `NODE_ENV=production` y `FRONTEND_DIR=../Frontend` (ya vienen en el `render.yaml`)

### 4. Ajustes en Google Cloud Console

1. En el **cliente OAuth**, agrega como URI de redireccionamiento autorizado:
   ```
   https://TU-APP.onrender.com/auth/google/callback
   ```
   (mantén también `http://localhost:3000/auth/google/callback` para desarrollo).
2. En **Pantalla de consentimiento**, cambia el estado de publicación a **En producción** (en modo Prueba el token de actualización caduca a los 7 días).

### 5. Conectar Google Drive en la app publicada

Tras el despliegue, entra a la página → **Inicio → panel "Conexión Google Drive" → Conectar con Google** (visible solo para administradores) y autoriza con tu cuenta. El token se guarda en la base de datos (tabla `config_google`), por lo que **sobrevive a cada despliegue**.

### Notas del plan gratuito

- Render (gratis): la app se duerme tras ~15 min de inactividad y la primera visita tarda ~30-60 s en arrancar. Con actividad normal se mantiene siempre despierta.
- Supabase (gratis): el proyecto se pausa tras ~1 semana sin actividad; el uso de la app lo mantiene activo.

---

## API REST

Todas las rutas protegidas requieren el encabezado `Authorization: Bearer <token>`.

| Método | Ruta | Descripción | Acceso |
| ------ | ---- | ----------- | ------ |
| `GET` | `/` | Verifica la conexión con PostgreSQL | Público |
| `POST` | `/auth/login` | Inicio de sesión (devuelve el token) | Público |
| `GET` | `/clientes` | Lista de clientes | Público |
| `POST` | `/clientes` | Crea un cliente | Público |
| `PUT` | `/clientes/:id` | Actualiza un cliente | Público |
| `DELETE` | `/clientes/:id` | Elimina un cliente | Público |
| `GET` | `/buscar-cliente?q=texto` | Búsqueda dinámica de clientes | Autenticado |
| `GET` | `/usuarios` | Lista de usuarios | Admin |
| `POST` | `/usuarios` | Crea un usuario | Admin |
| `PUT` | `/usuarios/:id` | Actualiza un usuario | Admin |
| `DELETE` | `/usuarios/:id` | Elimina un usuario | Admin |
| `GET` | `/plantillas/tipos` | Tipos de contrato disponibles | Autenticado |
| `GET` | `/plantillas?tipo=id` | Plantillas de un tipo de contrato | Autenticado |
| `GET` | `/plantillas/:id` | Contenido de la plantilla (texto) | Autenticado |
| `GET` | `/clausulas` | Catálogo de cláusulas | Autenticado |
| `POST` | `/ia/adaptar-clausula` | Adapta una cláusula según el objeto | Autenticado |
| `POST` | `/ia/objetivo-general` | Genera un título corto a partir de la descripción | Autenticado |
| `POST` | `/ia/consideraciones` | Genera las consideraciones del contrato según el objeto y el cliente | Autenticado |
| `POST` | `/contratos` | Crea el documento final en Google Drive (devuelve id y enlace) | Autenticado |
| `GET` | `/auth/google` | URL de autorización OAuth para conectar la cuenta de Google | Autenticado |
| `GET` | `/auth/google/callback` | Callback de OAuth (recibe el código y guarda el token) | Público |
| `GET` | `/auth/google/estado` | Estado de la conexión con Google (conectado / correo) | Autenticado |

---

## Base de datos

| Tabla | Descripción |
| ----- | ----------- |
| `usuarios` | Usuarios del sistema, con rol y contraseña cifrada |
| `cliente` | Clientes (persona Natural o Jurídica) |
| `clausulas` | Catálogo de cláusulas reutilizables (título y contenido) |
| `tipos_contrato` | Tipos de contrato disponibles |
| `plantillas` | Plantillas de Drive asociadas a cada tipo de contrato |

Para otorgar permisos de administrador a un usuario:

```sql
UPDATE usuarios SET rol = 'admin' WHERE correo = 'usuario@correo.com';
```

---

## Flujo de generación de contratos

1. **Selección de tipo de contrato**: al elegir un tipo se cargan sus plantillas disponibles.
2. **Selección de plantilla**: se obtiene el documento desde Google Drive y se convierte a texto/HTML.
3. **Datos del contrato**: cliente, valor, plazo y descripción/objeto.
4. **Selección de cláusulas**: las cláusulas del catálogo se marcan para incluirlas; el orden de la lista define su numeración.
5. **Armado del documento**: la plantilla contiene una cláusula de objeto fija, las cláusulas legales numeradas y un punto de inserción donde se agregan las cláusulas adicionales.
6. **Vista previa** en tiempo real, con opción de editar o adaptar cada cláusula con IA.
7. **Generación** del contrato final: se crea un documento de Google en la carpeta "Contratos generados" de la cuenta conectada (OAuth).

### Conexión con Google Drive (OAuth)

1. En **Google Cloud Console → APIs y servicios → Credenciales** crea un **ID de cliente OAuth** (aplicación web).
2. En el flujo de consentimiento agrega tu correo como **usuario de prueba**.
3. Pega `ID de cliente` y `Secreto del cliente` en `Backend/.env`.
4. En la app: **Administrar → Conexión Google → Conectar con Google** y autoriza con tu cuenta.

Con la cuenta conectada, los documentos de contrato se crean a tu nombre (usando su cuota), no con la cuenta de servicio.

---

## Integración con IA

La asistencia de IA se apoya en la API de Google Gemini y se expone mediante dos endpoints:

- **Adaptar cláusula** (`POST /ia/adaptar-clausula`): recibe el título, el contenido y el objeto del contrato, y devuelve la cláusula redactada en función de ese contexto.
- **Objetivo general** (`POST /ia/objetivo-general`): a partir de la descripción, devuelve una frase corta en mayúsculas para el título del contrato.
- **Consideraciones** (`POST /ia/consideraciones`): genera los recitales (CONSIDERANDOS) del contrato a partir del objeto y de los datos del cliente; el resultado se muestra en un campo editable para ajustarlo antes de incluirlo en el documento.

Consideraciones:
- Si la clave no está configurada, el servicio responde `503`.
- Los cambios generados por IA **no modifican el catálogo**; solo afectan al contrato que se está construyendo.

---

## Seguridad

- Las credenciales se gestionan mediante variables de entorno y **no se versionan**.
- El token OAuth de Google se guarda en `Backend/config/drive-token.json`, **excluido del repositorio**
- Las contraseñas se almacenan cifradas con `bcrypt`.
- El acceso a los recursos se controla con JWT y un middleware de rol para administradores.
- Si una credencial se expone accidentalmente, debe **rotarse de inmediato**.

---

## Roadmap

- [x] Conexión con Google Drive mediante OAuth (cuenta personal)
- [ ] Persistencia del historial de contratos generados
- [ ] Exportación directa a `.docx` / PDF
- [ ] Pruebas automatizadas (backend y frontend)
- [ ] Documentación de API con OpenAPI/Swagger
- [ ] Mejoras de accesibilidad y diseño responsivo

---

> Documento provisional. Se irá ampliando a medida que avance el proyecto.