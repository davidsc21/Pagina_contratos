const API_URL = "http://localhost:3000";
const ADMIN = "admin";

const contenido = document.getElementById("contenido");
const navAdmin = document.getElementById("nav-admin");
const btnCerrarSesion = document.getElementById("btn-cerrar-sesion");

let rutaActual = null;

function obtenerUsuarioLocal() {
    try {
        const crudo = localStorage.getItem("usuario");
        return crudo ? JSON.parse(crudo) : null;
    } catch (error) {
        return null;
    }
}

function obtenerHeaders() {
    const token = localStorage.getItem("token");
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };
}

function cerrarSesion() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    window.location.href = "login.html";
}

function irA(ruta) {
    window.location.hash = `/${ruta}`;
}

function resaltarNav(ruta) {
    document.querySelectorAll(".nav-item").forEach((item) => {
        item.classList.toggle("activo", item.dataset.ruta === ruta);
    });
}

function mostrarToast(texto, tipo) {
    const contenedor = document.getElementById("contenedor-toast");
    if (!contenedor) return;

    const toast = document.createElement("div");
    toast.className = `toast toast-${tipo}`;
    toast.textContent = texto;

    contenedor.appendChild(toast);

    setTimeout(() => {
        toast.classList.add("toast-ocultar");
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

btnCerrarSesion.addEventListener("click", cerrarSesion);

const token = localStorage.getItem("token");
const usuario = obtenerUsuarioLocal();

if (!token || !usuario) {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    window.location.href = "login.html";
}

navAdmin.hidden = !(usuario && usuario.rol === ADMIN);

const ICONOS = {
    inicio: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3l9 8h-3v9h-5v-6h-2v6H6v-9H3z"/></svg>',
    crear: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.8 9.94l-3.75-3.75L3 17.25zM20.7 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>',
    historial: '&#9776;',
    admin: '<svg viewBox="0 0 24 24" fill="currentColor"><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.66 3.58 3 8 3s8-1.34 8-3V5"/><path d="M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3"/></svg>'
};

function templateInicio() {
    const nombreCompleto = [usuario.nombre, usuario.apellido].filter(Boolean).join(" ") || "Usuario";
    return `
        <header class="encabezado">
            <h1 class="saludo">Hola, ${nombreCompleto}</h1>
            <p class="subtitulo">Bienvenido a Contratos Palmas</p>
        </header>

        <section class="acciones">
            <a href="#/crear" class="tarjeta-accion">
                <span class="accion-icono">&#10010;</span>
                <h2>Crear contratos</h2>
                <p>Registra un nuevo contrato con los datos del cliente</p>
            </a>
            <a href="#/crear" class="tarjeta-accion">
                <span class="accion-icono">&#9881;</span>
                <h2>Generar contratos</h2>
                <p>Genera el documento final del contrato listo para firmar</p>
            </a>
        </section>

        <section class="historial" id="historial">
            <div class="historial-encabezado">
                <h2>Historial de contratos</h2>
                <div class="historial-acciones">
                    <span class="contador" id="contador-contratos">0 contratos</span>
                    <a href="#/historial" class="btn-ver-mas">Ver más</a>
                </div>
            </div>

            <div class="historial-tabla">
                <table>
                    <thead>
                        <tr>
                            <th>No. contrato</th>
                            <th>Cliente</th>
                            <th>Fecha</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody id="cuerpo-contratos">
                        <tr class="fila-vacia">
                            <td colspan="4">Aún no hay contratos registrados</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>
    `;
}

function templateCrear() {
    return `
        <header class="encabezado">
            <h1 class="titulo-pagina">Crear contrato</h1>
            <p class="subtitulo">Completa los pasos para registrar un nuevo contrato</p>
        </header>

        <nav class="pasos" aria-label="Progreso">
            <div class="paso via-paso paso-activo" id="paso-boton-1" data-paso="1">
                <span class="paso-numero">1</span>
                <span class="paso-nombre">Cliente</span>
            </div>
            <div class="paso-linea"></div>
            <div class="paso via-paso" id="paso-boton-2" data-paso="2">
                <span class="paso-numero">2</span>
                <span class="paso-nombre">Datos del contrato</span>
            </div>
            <div class="paso-linea"></div>
            <div class="paso via-paso" id="paso-boton-3" data-paso="3">
                <span class="paso-numero">3</span>
                <span class="paso-nombre">Revisión</span>
            </div>
        </nav>

        <section class="contenido-paso" id="paso-contenido-1">
            <div class="panel">
                <h2 class="panel-titulo">Buscar cliente</h2>
                <p class="panel-descripcion">Escribe el nombre del cliente</p>

                <form id="formulario-busqueda" class="buscador-clientes">
                    <input type="text" id="campo-busqueda" class="campo-busqueda-cliente"
                           placeholder="Buscar cliente..." autocomplete="off">
                    <button type="submit" class="btn-buscar">Buscar</button>
                </form>

                <div class="resultados-clientes" id="resultados-clientes"></div>
            </div>

            <div class="cliente-seleccionado" id="cliente-seleccionado" hidden>
                <div class="cliente-seleccionado-info">
                    <span class="etiqueta-seleccionado">Cliente seleccionado</span>
                    <p class="cliente-seleccionado-nombre" id="cliente-seleccionado-nombre"></p>
                    <p class="cliente-seleccionado-detalle" id="cliente-seleccionado-detalle"></p>
                </div>
                <button type="button" class="btn-cambiar" id="btn-cambiar">Cambiar</button>
            </div>

            <div class="pie-paso">
                <button type="button" class="btn-continuar" id="btn-continuar" disabled>
                    Continuar al paso 2
                </button>
            </div>
        </section>

        <section class="contenido-paso" id="paso-contenido-2" hidden>
            <div class="contrato-columnas">

                <section class="contrato-formulario">
                    <div class="panel">
                        <h2 class="panel-titulo">Datos del contrato</h2>
                        <p class="panel-descripcion">Completa la información que aparecerá en el contrato</p>

                        <div class="contrato-cliente">
                            <span class="etiqueta-seleccionado">Cliente</span>
                            <p class="contrato-cliente-nombre" id="contrato-cliente-nombre"></p>
                            <p class="contrato-cliente-datos" id="contrato-cliente-datos"></p>
                        </div>

                        <form id="formulario-contrato" class="formulario-contrato">
                            <div class="campo-formulario">
                                <label for="contrato-tipo">Tipo de contrato</label>
                                <select id="contrato-tipo" class="filtro-estado">
                                    <option value="">Selecciona un tipo...</option>
                                </select>
                            </div>

                            <div class="campo-formulario">
                                <label for="contrato-plantilla">Plantilla de contrato</label>
                                <select id="contrato-plantilla" class="filtro-estado" disabled>
                                    <option value="">Selecciona primero el tipo de contrato</option>
                                </select>
                            </div>

                            <div class="campo-formulario">
                                <label for="contrato-numero">Número de contrato</label>
                                <input type="text" id="contrato-numero" placeholder="Ej. CP-2026-001">
                            </div>

                            <div class="campo-formulario">
                                <label for="contrato-inicio">Fecha de inicio</label>
                                <input type="date" id="contrato-inicio">
                            </div>

                            <div class="campo-formulario">
                                <label for="contrato-vencimiento">Fecha de vencimiento</label>
                                <input type="date" id="contrato-vencimiento">
                            </div>

                            <div class="campo-formulario">
                                <label for="contrato-monto">Monto (COP)</label>
                                <input type="number" id="contrato-monto" placeholder="0" min="0">
                            </div>

                            <div class="campo-formulario">
                                <label for="contrato-estado">Estado</label>
                                <select id="contrato-estado" class="filtro-estado">
                                    <option value="">Selecciona un estado...</option>
                                    <option value="Pendiente">Pendiente</option>
                                    <option value="Activo">Activo</option>
                                    <option value="Finalizado">Finalizado</option>
                                    <option value="Vencido">Vencido</option>
                                </select>
                            </div>

                            <div class="campo-formulario campo-completo">
                                <label for="contrato-descripcion">Descripción / Objeto del contrato</label>
                                <textarea id="contrato-descripcion" rows="3" placeholder="Describe el objeto del contrato..."></textarea>
                                <div class="objetivo-ia">
                                    <button type="button" class="btn-objetivo-ia" id="btn-objetivo-ia">Generar título con IA</button>
                                    <span class="objetivo-general" id="objetivo-general"></span>
                                </div>
                            </div>
                        </form>
                    </div>

                    <div class="panel panel-clausulas" id="panel-clausulas" hidden>
                        <h2 class="panel-titulo">Cláusulas del contrato</h2>
                        <p class="panel-descripcion">La cláusula de OBJETO siempre queda de primera y las cláusulas legales fijas se mantienen. Marca las cláusulas que quieras: se numeran al final, antes de las firmas. Usa "IA" para adaptarlas al objetivo y "Editar" para modificar su texto; ambos cambios solo aplican a este contrato.</p>
                        <div class="clausulas-lista" id="clausulas-lista"></div>
                    </div>
                </section>

                <aside class="contrato-preview">
                    <div class="preview-contenedor">
                        <h3 class="preview-titulo" id="preview-titulo">Vista previa del contrato</h3>
                        <div class="preview-html" id="preview-html">
                            <p class="servicio-busqueda">Selecciona una plantilla para ver su contenido</p>
                        </div>
                    </div>
                </aside>
            </div>

            <div class="pie-paso">
                <button type="button" class="btn-return" data-paso="1">&#8592; Volver</button>
                <button type="button" class="btn-continuar" data-paso="3">Continuar al paso 3</button>
            </div>
        </section>

        <section class="contenido-paso" id="paso-contenido-3" hidden>
            <div class="panel">
                <h2 class="panel-titulo">Revisión</h2>
                <p class="panel-descripcion">Aquí se resumirá el contrato antes de generarlo</p>
                <div class="construccion">
                    <span class="construccion-icono">&#9888;</span>
                    <p>Esta sección está en construcción</p>
                </div>
            </div>

            <div class="pie-paso">
                <button type="button" class="btn-return" data-paso="2">&#8592; Volver</button>
                <button type="button" class="btn-generar" id="btn-generar">Generar contrato</button>
            </div>
        </section>

        <div class="modal-vista" id="modal-editar-clausula" hidden>
            <div class="modal-contenido modal-contenido-clausula">
                <div class="modal-encabezado">
                    <h2 class="panel-titulo">Editar cláusula</h2>
                    <button type="button" class="modal-cerrar" id="btn-cerrar-editar-clausula" aria-label="Cerrar">&times;</button>
                </div>
                <p class="panel-descripcion">Los cambios solo se aplican al contrato que estás generando; no se guardan en la base de datos.</p>
                <form id="formulario-editar-clausula">
                    <div class="campo-formulario campo-completo">
                        <label for="clausula-editar-titulo">Título</label>
                        <input type="text" id="clausula-editar-titulo">
                    </div>
                    <div class="campo-formulario campo-completo">
                        <label for="clausula-editar-contenido">Contenido</label>
                        <textarea id="clausula-editar-contenido" rows="14" placeholder="Escribe el contenido de la cláusula. Separa los párrafos con una línea en blanco."></textarea>
                    </div>
                    <div class="acciones-formulario">
                        <button type="submit" class="btn-guardar">Guardar cambios</button>
                        <button type="button" class="btn-cancelar" id="btn-cancelar-editar-clausula">Cancelar</button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

function templateHistorial() {
    return `
        <header class="encabezado">
            <h1 class="titulo-pagina">Historial de contratos</h1>
            <p class="subtitulo">Consulta todos los contratos registrados en detalle</p>
        </header>

        <section class="estadisticas">
            <div class="tarjeta-estadistica">
                <span class="estadistica-valor" id="total-contratos">0</span>
                <span class="estadistica-nombre">Total de contratos</span>
            </div>
            <div class="tarjeta-estadistica">
                <span class="estadistica-valor" id="activos-contratos">0</span>
                <span class="estadistica-nombre">Activos</span>
            </div>
            <div class="tarjeta-estadistica">
                <span class="estadistica-valor" id="vencidos-contratos">0</span>
                <span class="estadistica-nombre">Vencidos</span>
            </div>
            <div class="tarjeta-estadistica">
                <span class="estadistica-valor" id="finalizados-contratos">0</span>
                <span class="estadistica-nombre">Finalizados</span>
            </div>
        </section>

        <section class="historial historial-detallado">
            <div class="historial-encabezado">
                <h2>Listado completo</h2>
            </div>

            <div class="herramientas">
                <input type="text" id="buscador" class="campo-busqueda" placeholder="Buscar contrato, cliente o estado...">
                <select id="filtro-estado" class="filtro-estado">
                    <option value="">Todos los estados</option>
                    <option value="Activo">Activo</option>
                    <option value="Pendiente">Pendiente</option>
                    <option value="Vencido">Vencido</option>
                    <option value="Finalizado">Finalizado</option>
                </select>
            </div>

            <div class="historial-tabla">
                <table>
                    <thead>
                        <tr>
                            <th>No. contrato</th>
                            <th>Cliente</th>
                            <th>Tipo de contrato</th>
                            <th>Fecha de creación</th>
                            <th>Fecha de vencimiento</th>
                            <th>Monto</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody id="cuerpo-contratos">
                        <tr class="fila-vacia">
                            <td colspan="8">Aún no hay contratos registrados</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>
    `;
}

function templateAdmin() {
    return `
        <header class="encabezado">
            <h1 class="titulo-pagina">Modificar datos</h1>
            <p class="subtitulo">Administra usuarios y clientes del sistema</p>
        </header>

        <nav class="pasos admin-tabs">
            <div class="paso via-paso paso-activo" id="tab-crear-usuario" data-tab="crear-usuario">
                <span class="paso-numero">+</span>
                <span class="paso-nombre">Crear usuario</span>
            </div>
            <div class="paso-linea"></div>
            <div class="paso via-paso" id="tab-admin-usuarios" data-tab="admin-usuarios">
                <span class="paso-numero">&#9776;</span>
                <span class="paso-nombre">Administrar usuarios</span>
            </div>
            <div class="paso-linea"></div>
            <div class="paso via-paso" id="tab-admin-clientes" data-tab="admin-clientes">
                <span class="paso-numero">&#9776;</span>
                <span class="paso-nombre">Administrar clientes</span>
            </div>
        </nav>

        <p id="mensaje-admin" class="mensaje-admin" hidden></p>

        <!-- TAB: CREAR USUARIO -->
        <section class="admin-seccion" id="seccion-crear-usuario">
            <section class="panel panel-formulario">
                <h2 class="panel-titulo">Nuevo usuario</h2>
                <p class="panel-descripcion">Completa los datos y presiona guardar</p>

                <form id="formulario-usuario" class="formulario-cliente">
                    <div class="campo-formulario">
                        <label for="usuario-nombre">Nombre</label>
                        <input type="text" id="usuario-nombre" placeholder="Nombre del usuario" required>
                    </div>

                    <div class="campo-formulario">
                        <label for="usuario-apellido">Apellido</label>
                        <input type="text" id="usuario-apellido" placeholder="Apellido del usuario" required>
                    </div>

                    <div class="campo-formulario">
                        <label for="usuario-correo">Correo</label>
                        <input type="email" id="usuario-correo" placeholder="correo@ejemplo.com" required>
                    </div>

                    <div class="campo-formulario">
                        <label for="usuario-password">Contraseña</label>
                        <input type="password" id="usuario-password" placeholder="Mínimo 6 caracteres" minlength="6" required>
                    </div>

                    <div class="campo-formulario">
                        <label for="usuario-rol">Rol</label>
                        <select id="usuario-rol" class="filtro-estado">
                            <option value="usuario">Usuario</option>
                            <option value="admin">Administrador</option>
                        </select>
                    </div>

                    <div class="acciones-formulario">
                        <button type="submit" class="btn-guardar" id="btn-guardar-usuario">Guardar usuario</button>
                    </div>
                </form>
            </section>
        </section>

        <!-- TAB: ADMINISTRAR USUARIOS -->
        <section class="admin-seccion" id="seccion-admin-usuarios" hidden>
            <section class="historial historial-admin">
                <div class="historial-encabezado">
                    <h2>Usuarios registrados</h2>
                    <span class="contador" id="contador-usuarios">0 usuarios</span>
                </div>

                <div class="herramientas">
                    <input type="text" id="buscador-usuarios" class="campo-busqueda" placeholder="Buscar usuario...">
                </div>

                <div class="historial-tabla">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Apellido</th>
                                <th>Correo</th>
                                <th>Rol</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="cuerpo-usuarios">
                            <tr class="fila-vacia">
                                <td colspan="6">Cargando usuarios...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
        </section>

        <!-- MODAL EDITAR USUARIO -->
        <div class="modal-vista" id="modal-usuario" hidden>
            <div class="modal-contenido">
                <div class="modal-encabezado">
                    <h2 class="panel-titulo">Editar usuario</h2>
                    <button type="button" class="modal-cerrar" id="btn-cerrar-modal-usuario" aria-label="Cerrar">&times;</button>
                </div>
                <p class="panel-descripcion">Actualiza los datos y presiona guardar</p>

                <form id="formulario-usuario-editar" class="formulario-cliente">
                    <input type="hidden" id="usuario-id-editar">

                    <div class="campo-formulario">
                        <label for="usuario-nombre-editar">Nombre</label>
                        <input type="text" id="usuario-nombre-editar" placeholder="Nombre del usuario" required>
                    </div>

                    <div class="campo-formulario">
                        <label for="usuario-apellido-editar">Apellido</label>
                        <input type="text" id="usuario-apellido-editar" placeholder="Apellido del usuario" required>
                    </div>

                    <div class="campo-formulario">
                        <label for="usuario-correo-editar">Correo</label>
                        <input type="email" id="usuario-correo-editar" placeholder="correo@ejemplo.com" required>
                    </div>

                    <div class="campo-formulario">
                        <label for="usuario-password-editar">Contraseña</label>
                        <input type="password" id="usuario-password-editar" placeholder="Dejar vacío para mantener la actual" minlength="6">
                    </div>

                    <div class="campo-formulario">
                        <label for="usuario-rol-editar">Rol</label>
                        <select id="usuario-rol-editar" class="filtro-estado">
                            <option value="usuario">Usuario</option>
                            <option value="admin">Administrador</option>
                        </select>
                    </div>

                    <div class="acciones-formulario">
                        <button type="submit" class="btn-guardar" id="btn-guardar-editar-usuario">Actualizar usuario</button>
                        <button type="button" class="btn-cancelar" id="btn-cancelar-editar-usuario">Cancelar</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- TAB: ADMINISTRAR CLIENTES -->
        <section class="admin-seccion" id="seccion-admin-clientes" hidden>
            <section class="panel panel-formulario">
                <h2 class="panel-titulo">Nuevo cliente</h2>
                <p class="panel-descripcion">Completa los datos y presiona guardar</p>

                <form id="formulario-cliente" class="formulario-cliente">
                    <div class="campo-formulario">
                        <label for="cliente-nombre">Nombre completo</label>
                        <input type="text" id="cliente-nombre" placeholder="Nombre del cliente" required>
                    </div>

                    <div class="campo-formulario">
                        <label for="cliente-tipo">Tipo de cliente</label>
                        <select id="cliente-tipo" class="filtro-estado" required>
                            <option value="">Selecciona el tipo...</option>
                            <option value="Natural">Natural</option>
                            <option value="Juridico">Jurídico</option>
                        </select>
                    </div>

                    <div class="campo-formulario">
                        <label for="cliente-nit">NIT / CC</label>
                        <input type="text" id="cliente-nit" placeholder="NIT o cédula del cliente" required>
                    </div>

                    <div class="campo-formulario">
                        <label for="cliente-representante">Representante legal</label>
                        <input type="text" id="cliente-representante" placeholder="Solo para clientes jurídicos">
                    </div>

                    <div class="campo-formulario">
                        <label for="cliente-direccion">Dirección</label>
                        <input type="text" id="cliente-direccion" placeholder="Dirección del cliente">
                    </div>

                    <div class="acciones-formulario">
                        <button type="submit" class="btn-guardar" id="btn-guardar">Guardar cliente</button>
                    </div>
                </form>
            </section>

            <!-- MODAL EDITAR CLIENTE -->
            <div class="modal-vista" id="modal-cliente" hidden>
                <div class="modal-contenido">
                    <div class="modal-encabezado">
                        <h2 class="panel-titulo">Editar cliente</h2>
                        <button type="button" class="modal-cerrar" id="btn-cerrar-modal" aria-label="Cerrar">&times;</button>
                    </div>
                    <p class="panel-descripcion">Actualiza los datos y presiona guardar</p>

                    <form id="formulario-cliente-editar" class="formulario-cliente">
                        <input type="hidden" id="cliente-id-editar">

                        <div class="campo-formulario">
                            <label for="cliente-nombre-editar">Nombre completo</label>
                            <input type="text" id="cliente-nombre-editar" placeholder="Nombre del cliente" required>
                        </div>

                        <div class="campo-formulario">
                            <label for="cliente-tipo-editar">Tipo de cliente</label>
                            <select id="cliente-tipo-editar" class="filtro-estado" required>
                                <option value="">Selecciona el tipo...</option>
                                <option value="Natural">Natural</option>
                                <option value="Juridico">Jurídico</option>
                            </select>
                        </div>

                        <div class="campo-formulario">
                            <label for="cliente-nit-editar">NIT / CC</label>
                            <input type="text" id="cliente-nit-editar" placeholder="NIT o cédula del cliente" required>
                        </div>

                        <div class="campo-formulario">
                            <label for="cliente-representante-editar">Representante legal</label>
                            <input type="text" id="cliente-representante-editar" placeholder="Solo para clientes jurídicos">
                        </div>

                        <div class="campo-formulario">
                            <label for="cliente-direccion-editar">Dirección</label>
                            <input type="text" id="cliente-direccion-editar" placeholder="Dirección del cliente">
                        </div>

                        <div class="acciones-formulario">
                            <button type="submit" class="btn-guardar" id="btn-guardar-editar">Actualizar cliente</button>
                            <button type="button" class="btn-cancelar" id="btn-cancelar-editar">Cancelar</button>
                        </div>
                    </form>
                </div>
            </div>

            <section class="historial historial-admin">
                <div class="historial-encabezado">
                    <h2>Clientes registrados</h2>
                    <span class="contador" id="contador-clientes">0 clientes</span>
                </div>

                <div class="herramientas">
                    <select id="filtro-tipo-cliente" class="filtro-estado">
                        <option value="">Todos los tipos</option>
                        <option value="Natural">Natural</option>
                        <option value="Juridico">Jurídico</option>
                    </select>
                    <input type="text" id="buscador-admin" class="campo-busqueda" placeholder="Buscar cliente...">
                </div>

                <div class="historial-tabla">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Tipo</th>
                                <th>NIT / CC</th>
                                <th>Representante legal</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="cuerpo-clientes">
                            <tr class="fila-vacia">
                                <td colspan="6">Cargando clientes...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
        </section>
    `;
}

const TEMPLATES = {
    inicio: templateInicio,
    crear: templateCrear,
    historial: templateHistorial,
    admin: templateAdmin
};

function initInicio() {
}

function initCrear() {
    let clienteSeleccionado = null;
    let pasoActual = 1;

    const campoBusqueda = document.getElementById("campo-busqueda");
    const formularioBusqueda = document.getElementById("formulario-busqueda");
    const resultados = document.getElementById("resultados-clientes");
    const clienteSeleccionadoDiv = document.getElementById("cliente-seleccionado");
    const clienteSeleccionadoNombre = document.getElementById("cliente-seleccionado-nombre");
    const clienteSeleccionadoDetalle = document.getElementById("cliente-seleccionado-detalle");
    const btnCambiar = document.getElementById("btn-cambiar");
    const btnContinuar = document.getElementById("btn-continuar");

    const contratoClienteNombre = document.getElementById("contrato-cliente-nombre");
    const contratoClienteDatos = document.getElementById("contrato-cliente-datos");
    const formularioContrato = document.getElementById("formulario-contrato");
    const contratoTipo = document.getElementById("contrato-tipo");
    const contratoPlantilla = document.getElementById("contrato-plantilla");
    const contratoNumero = document.getElementById("contrato-numero");
    const contratoInicio = document.getElementById("contrato-inicio");
    const contratoVencimiento = document.getElementById("contrato-vencimiento");
    const contratoMonto = document.getElementById("contrato-monto");
    const contratoEstado = document.getElementById("contrato-estado");
    const contratoDescripcion = document.getElementById("contrato-descripcion");
    const btnObjetivoIA = document.getElementById("btn-objetivo-ia");
    const objetivoGeneralTexto = document.getElementById("objetivo-general");
    const previewTitulo = document.getElementById("preview-titulo");
    const previewHtml = document.getElementById("preview-html");
    const panelClausulas = document.getElementById("panel-clausulas");
    const clausulasLista = document.getElementById("clausulas-lista");
    const modalEditarClausula = document.getElementById("modal-editar-clausula");
    const formularioEditarClausula = document.getElementById("formulario-editar-clausula");
    const clausulaEditarTitulo = document.getElementById("clausula-editar-titulo");
    const clausulaEditarContenido = document.getElementById("clausula-editar-contenido");
    const btnCerrarEditarClausula = document.getElementById("btn-cerrar-editar-clausula");
    const btnCancelarEditarClausula = document.getElementById("btn-cancelar-editar-clausula");

    let temporizadorBusqueda = null;
    let plantillaHtmlCruda = "";
    let clausulas = [];
    let clausulaEnEdicion = null;
    let objetivoGeneral = "";

    async function buscar(termino) {
        resultados.innerHTML = '<p class="servicio-busqueda">Buscando...</p>';

        try {
            const respuesta = await fetch(
                `${API_URL}/buscar-cliente?q=${encodeURIComponent(termino)}`,
                { headers: obtenerHeaders() }
            );

            if (!respuesta.ok) {
                throw new Error("Error al obtener los clientes");
            }

            const clientes = await respuesta.json();

            if (campoBusqueda.value.trim() !== termino) return;
            renderizarResultados(clientes);

        } catch (error) {
            if (campoBusqueda.value.trim() !== termino) return;
            resultados.innerHTML = '<p class="servicio-busqueda">No se pudo conectar con el servidor</p>';
        }
    }

    campoBusqueda.addEventListener("input", () => {
        clearTimeout(temporizadorBusqueda);

        const termino = campoBusqueda.value.trim();
        if (!termino) {
            resultados.innerHTML = "";
            return;
        }

        temporizadorBusqueda = setTimeout(() => buscar(termino), 300);
    });

    formularioBusqueda.addEventListener("submit", (event) => {
        event.preventDefault();
        clearTimeout(temporizadorBusqueda);

        const termino = campoBusqueda.value.trim();
        if (!termino) {
            resultados.innerHTML = '<p class="servicio-busqueda">Escribe un término para buscar</p>';
            return;
        }

        buscar(termino);
    });

    function renderizarResultados(lista) {
        if (lista.length === 0) {
            resultados.innerHTML = '<p class="servicio-busqueda">No se encontraron clientes con ese término</p>';
            return;
        }

        resultados.innerHTML = "";

        lista.forEach((cliente) => {
            const tarjeta = document.createElement("div");
            tarjeta.className = "tarjeta-cliente";

            const info = document.createElement("div");
            info.className = "tarjeta-cliente-info";

            const nombre = document.createElement("span");
            nombre.className = "tarjeta-cliente-nombre";
            nombre.textContent = cliente.nombre;

            const detalle = document.createElement("span");
            detalle.className = "tarjeta-cliente-detalle";
            detalle.textContent = `${cliente.tipo_cliente} | ${cliente.nit_cc}`;

            info.appendChild(nombre);
            info.appendChild(detalle);

            const boton = document.createElement("button");
            boton.type = "button";
            boton.className = "btn-seleccionar";
            boton.textContent = "Seleccionar";

            tarjeta.appendChild(info);
            tarjeta.appendChild(boton);
            resultados.appendChild(tarjeta);

            tarjeta.addEventListener("click", () => seleccionarCliente(cliente));
        });
    }

    function seleccionarCliente(cliente) {
        clienteSeleccionado = cliente;
        clienteSeleccionadoNombre.textContent = cliente.nombre;

        const detalles = [`Tipo: ${cliente.tipo_cliente}`, `NIT/CC: ${cliente.nit_cc}`];
        if (cliente.representante_legal) {
            detalles.push(`Representante: ${cliente.representante_legal}`);
        }
        clienteSeleccionadoDetalle.textContent = detalles.join("   |   ");

        clienteSeleccionadoDiv.hidden = false;
        btnContinuar.disabled = false;
        resultados.innerHTML = "";

        resetearFormularioContrato();
    }

    function resetearFormularioContrato() {
        contratoTipo.value = "";
        contratoPlantilla.disabled = true;
        contratoPlantilla.innerHTML = '<option value="">Selecciona primero el tipo de contrato</option>';
        contratoNumero.value = "";
        contratoInicio.value = "";
        contratoVencimiento.value = "";
        contratoMonto.value = "";
        contratoEstado.value = "";
        contratoDescripcion.value = "";
        plantillaHtmlCruda = "";
        clausulas = [];
        objetivoGeneral = "";
        objetivoGeneralTexto.textContent = "";
        panelClausulas.hidden = true;
        clausulasLista.innerHTML = "";

        previewTitulo.textContent = "Vista previa del contrato";
        previewHtml.innerHTML = '<p class="servicio-busqueda">Selecciona una plantilla para ver su contenido</p>';
    }

    function formatearNombrePlantilla(nombre) {
        return nombre.replace(/\.(docx?|txt|rtf)$/i, "").replace(/\./g, " ");
    }

    async function cargarTiposContrato() {
        contratoTipo.innerHTML = '<option value="">Selecciona un tipo...</option>';

        try {
            const respuesta = await fetch(`${API_URL}/plantillas/tipos`, { headers: obtenerHeaders() });

            if (!respuesta.ok) {
                const error = await respuesta.json().catch(() => null);
                throw new Error(error?.mensaje || "No se pudieron obtener los tipos de contrato");
            }

            const tipos = await respuesta.json();

            tipos.forEach((tipo) => {
                const opcion = document.createElement("option");
                opcion.value = tipo.id;
                opcion.textContent = tipo.nombre;
                contratoTipo.appendChild(opcion);
            });

        } catch (error) {
            console.error(error.message);
        }
    }

    async function cargarPlantillas(tipoId) {
        previewTitulo.textContent = "Vista previa del contrato";
        previewHtml.innerHTML = '<p class="servicio-busqueda">Selecciona una plantilla para ver su contenido</p>';

        if (!tipoId) {
            contratoPlantilla.disabled = true;
            contratoPlantilla.innerHTML = '<option value="">Selecciona primero el tipo de contrato</option>';
            return;
        }

        contratoPlantilla.disabled = true;
        contratoPlantilla.innerHTML = '<option value="">Cargando plantillas...</option>';

        try {
            const respuesta = await fetch(
                `${API_URL}/plantillas?tipo=${encodeURIComponent(tipoId)}`,
                { headers: obtenerHeaders() }
            );

            if (!respuesta.ok) {
                const error = await respuesta.json().catch(() => null);
                throw new Error(error?.mensaje || "No se pudieron obtener las plantillas");
            }

            const plantillas = await respuesta.json();

            if (plantillas.length === 0) {
                contratoPlantilla.innerHTML = '<option value="">No hay plantillas para este tipo</option>';
                return;
            }

            contratoPlantilla.innerHTML = '<option value="">Selecciona una plantilla...</option>';

            plantillas.forEach((plantilla) => {
                const opcion = document.createElement("option");
                opcion.value = plantilla.id;
                opcion.textContent = formatearNombrePlantilla(plantilla.name);
                contratoPlantilla.appendChild(opcion);
            });

            contratoPlantilla.disabled = false;

        } catch (error) {
            contratoPlantilla.innerHTML = '<option value="">Error al cargar las plantillas</option>';
            previewHtml.innerHTML = `<p class="servicio-busqueda">${error.message}</p>`;
        }
    }

    function limpiarPlantilla() {
        plantillaHtmlCruda = "";
        clausulas = [];
        renderListaClausulas();
        previewTitulo.textContent = "Vista previa del contrato";
        previewHtml.innerHTML = '<p class="servicio-busqueda">Selecciona una plantilla para ver su contenido</p>';
    }

    async function cargarContenidoPlantilla(id) {
        previewHtml.innerHTML = '<p class="servicio-busqueda">Cargando contenido...</p>';

        try {
            const respuesta = await fetch(`${API_URL}/plantillas/${id}`, { headers: obtenerHeaders() });

            if (!respuesta.ok) {
                const error = await respuesta.json().catch(() => null);
                throw new Error(error?.mensaje || "No se pudo cargar la plantilla");
            }

            const contenido = await respuesta.json();
            previewTitulo.textContent = contenido.name || "Vista previa del contrato";
            plantillaHtmlCruda = contenido.html || "";
            await cargarClausulas();
            renderizarPreviewConDatos();

        } catch (error) {
            plantillaHtmlCruda = "";
            previewHtml.innerHTML = `<p class="servicio-busqueda">${error.message}</p>`;
        }
    }

    function escaparHTML(texto) {
        const div = document.createElement("div");
        div.textContent = texto ?? "";
        return div.innerHTML;
    }

    function htmlATexto(html) {
        const doc = new DOMParser().parseFromString(html, "text/html");
        doc.querySelectorAll("script, style").forEach((nodo) => nodo.remove());
        return doc.body.innerText.replace(/\n{3,}/g, "\n\n").trim();
    }

    function textoAHTML(texto) {
        const bloques = String(texto || "").split(/\n{2,}/);
        const parrafos = bloques
            .map((bloque) => bloque.replace(/\s*\n\s*/g, " ").trim())
            .filter(Boolean);
        return parrafos.map((p) => `<p>${escaparHTML(p)}</p>`).join("");
    }

    function clausulaSoportaIA(clausula) {
        return /frente|par[aá]grafo/i.test(clausula.titulo + " " + clausula.contenido);
    }

    function formatearMoneda(valor) {
        const numero = parseFloat(valor);
        if (isNaN(numero)) return "";
        return "$" + numero.toLocaleString("es-CO");
    }

    function numeroALetras(numero) {
        const UNIDADES = ["CERO", "UNO", "DOS", "TRES", "CUATRO", "CINCO", "SEIS", "SIETE", "OCHO", "NUEVE",
            "DIEZ", "ONCE", "DOCE", "TRECE", "CATORCE", "QUINCE", "DIECISÉIS", "DIECISIETE", "DIECIOCHO",
            "DIECINUEVE", "VEINTE", "VEINTIUNO", "VEINTIDÓS", "VEINTITRÉS", "VEINTICUATRO", "VEINTICINCO",
            "VEINTISÉIS", "VEINTISIETE", "VEINTIOCHO", "VEINTINUEVE"];
        const DECENAS = ["", "", "", "TREINTA", "CUARENTA", "CINCUENTA", "SESENTA", "SETENTA", "OCHENTA", "NOVENTA"];
        const CENTENAS = ["", "CIENTO", "DOSCIENTOS", "TRESCIENTOS", "CUATROCIENTOS", "QUINIENTOS",
            "SEISCIENTOS", "SETECIENTOS", "OCHOCIENTOS", "NOVECIENTOS"];

        if (numero < 30) return UNIDADES[numero];
        if (numero < 100) {
            const d = Math.floor(numero / 10);
            const u = numero % 10;
            return DECENAS[d] + (u ? " Y " + UNIDADES[u] : "");
        }
        if (numero === 100) return "CIEN";
        if (numero < 1000) {
            const c = Math.floor(numero / 100);
            const r = numero % 100;
            return CENTENAS[c] + (r ? " " + numeroALetras(r) : "");
        }
        return String(numero);
    }

    function calcularPlazo() {
        if (!contratoInicio.value || !contratoVencimiento.value) return "";
        const inicio = new Date(contratoInicio.value);
        const fin = new Date(contratoVencimiento.value);
        const dias = Math.round((fin - inicio) / 86400000);
        if (isNaN(dias) || dias < 0) return "";
        return `${numeroALetras(dias)} (${dias}) DÍAS`;
    }

    async function cargarClausulas() {
        try {
            const respuesta = await fetch(`${API_URL}/clausulas`, { headers: obtenerHeaders() });

            if (!respuesta.ok) {
                const error = await respuesta.json().catch(() => null);
                throw new Error(error?.mensaje || "No se pudieron obtener las cláusulas");
            }

            const datos = await respuesta.json();
            clausulas = datos.map((c) => ({
                id: c.id,
                titulo: c.titulo,
                contenido: c.contenido,
                seleccionada: false
            }));
            renderListaClausulas();

        } catch (error) {
            clausulas = [];
            panelClausulas.hidden = true;
            clausulasLista.innerHTML = "";
            console.error(error.message);
        }
    }

    function renderListaClausulas() {
        if (clausulas.length === 0) {
            panelClausulas.hidden = true;
            clausulasLista.innerHTML = "";
            return;
        }

        panelClausulas.hidden = false;
        clausulasLista.innerHTML = "";

        clausulas.forEach((clausula) => {
            const item = document.createElement("div");
            item.className = "clausula-item" + (clausula.seleccionada ? "" : " clausula-no-seleccionada");

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.className = "clausula-checkbox";
            checkbox.checked = clausula.seleccionada;
            checkbox.addEventListener("change", () => {
                clausula.seleccionada = checkbox.checked;
                renderListaClausulas();
                renderizarPreviewConDatos();
            });

            const titulo = document.createElement("span");
            titulo.className = "clausula-titulo";
            titulo.textContent = clausula.titulo;

            const numero = document.createElement("span");
            numero.className = "clausula-numero";
            if (!clausula.seleccionada) {
                numero.textContent = "No incluida";
            }

            const acciones = document.createElement("div");
            acciones.className = "clausula-acciones";

            if (clausulaSoportaIA(clausula)) {
                const btnIA = document.createElement("button");
                btnIA.type = "button";
                btnIA.className = "btn-accion-clausula btn-ia";
                btnIA.textContent = "IA";
                btnIA.title = "Adaptar con IA según el objetivo del contrato";
                btnIA.addEventListener("click", () => adaptarConIA(clausula, btnIA));
                acciones.appendChild(btnIA);
            }

            const btnEditar = document.createElement("button");
            btnEditar.type = "button";
            btnEditar.className = "btn-accion-clausula btn-editar";
            btnEditar.textContent = "Editar";
            btnEditar.title = "Editar el texto de la cláusula (solo para este contrato)";
            btnEditar.addEventListener("click", () => abrirEdicionClausula(clausula));
            acciones.appendChild(btnEditar);

            item.appendChild(checkbox);
            item.appendChild(titulo);
            item.appendChild(numero);
            item.appendChild(acciones);
            clausulasLista.appendChild(item);
        });
    }

    function abrirEdicionClausula(clausula) {
        clausulaEnEdicion = clausula;
        clausulaEditarTitulo.value = clausula.titulo;
        clausulaEditarContenido.value = htmlATexto(clausula.contenido);
        modalEditarClausula.hidden = false;
        modalEditarClausula.tabIndex = -1;
        modalEditarClausula.focus();
    }

    function cerrarEdicionClausula() {
        modalEditarClausula.hidden = true;
        clausulaEnEdicion = null;
    }

    formularioEditarClausula.addEventListener("submit", (e) => {
        e.preventDefault();
        if (!clausulaEnEdicion) return;

        const titulo = clausulaEditarTitulo.value.trim();
        const contenido = textoAHTML(clausulaEditarContenido.value);

        if (!titulo || !contenido) {
            mostrarToast("El título y el contenido no pueden quedar vacíos", "error");
            return;
        }

        clausulaEnEdicion.titulo = titulo;
        clausulaEnEdicion.contenido = contenido;
        cerrarEdicionClausula();
        renderListaClausulas();
        renderizarPreviewConDatos();
        mostrarToast("Cláusula editada (solo para este contrato)", "exito");
    });

    btnCerrarEditarClausula.addEventListener("click", cerrarEdicionClausula);
    btnCancelarEditarClausula.addEventListener("click", cerrarEdicionClausula);

    modalEditarClausula.addEventListener("click", (e) => {
        if (e.target === modalEditarClausula) cerrarEdicionClausula();
    });
    modalEditarClausula.addEventListener("keydown", (e) => {
        if (e.key === "Escape") cerrarEdicionClausula();
    });

    async function adaptarConIA(clausula, boton) {
        const objetivo = contratoDescripcion.value.trim();
        if (!objetivo) {
            mostrarToast("Escribe el objetivo en 'Descripción / Objeto del contrato' antes de usar la IA", "error");
            return;
        }

        const textoOriginal = boton.textContent;
        boton.disabled = true;
        boton.textContent = "Analizando...";

        try {
            const respuesta = await fetch(`${API_URL}/ia/adaptar-clausula`, {
                method: "POST",
                headers: { ...obtenerHeaders(), "Content-Type": "application/json" },
                body: JSON.stringify({
                    titulo: clausula.titulo,
                    contenido: htmlATexto(clausula.contenido),
                    objetivo
                })
            });

            if (!respuesta.ok) {
                const error = await respuesta.json().catch(() => null);
                throw new Error(error?.mensaje || "Error al adaptar la cláusula");
            }

            const datos = await respuesta.json();
            const texto = (datos.texto || "").trim();
            if (!texto) throw new Error("La IA no devolvió contenido");

            clausula.contenido = textoAHTML(texto);
            renderListaClausulas();
            renderizarPreviewConDatos();
            mostrarToast("Cláusula adaptada con IA (solo para este contrato)", "exito");

        } catch (error) {
            mostrarToast(error.message, "error");
        } finally {
            boton.disabled = false;
            boton.textContent = textoOriginal;
        }
    }

    async function generarObjetivoConIA() {
        const objetivo = contratoDescripcion.value.trim();
        if (!objetivo) {
            mostrarToast("Escribe la descripción / objeto del contrato antes de generar el título", "error");
            return;
        }

        const textoOriginal = btnObjetivoIA.textContent;
        btnObjetivoIA.disabled = true;
        btnObjetivoIA.textContent = "Generando...";

        try {
            const respuesta = await fetch(`${API_URL}/ia/objetivo-general`, {
                method: "POST",
                headers: { ...obtenerHeaders(), "Content-Type": "application/json" },
                body: JSON.stringify({ objetivo })
            });

            if (!respuesta.ok) {
                const error = await respuesta.json().catch(() => null);
                throw new Error(error?.mensaje || "Error al generar el título");
            }

            const datos = await respuesta.json();
            const texto = (datos.texto || "").trim();
            if (!texto) throw new Error("La IA no devolvió contenido");

            objetivoGeneral = texto;
            objetivoGeneralTexto.textContent = objetivoGeneral;
            renderizarPreviewConDatos();
            mostrarToast("Título generado con IA", "exito");

        } catch (error) {
            mostrarToast(error.message, "error");
        } finally {
            btnObjetivoIA.disabled = false;
            btnObjetivoIA.textContent = textoOriginal;
        }
    }

    btnObjetivoIA.addEventListener("click", generarObjetivoConIA);

    contratoDescripcion.addEventListener("input", () => {
        if (objetivoGeneral) {
            objetivoGeneral = "";
            objetivoGeneralTexto.textContent = "";
        }
    });

    function construirHtmlContrato() {
        if (!plantillaHtmlCruda) return "";

        const indiceClausulas = plantillaHtmlCruda.indexOf("<p><strong>CLÁUSULA");
        if (indiceClausulas === -1) return plantillaHtmlCruda;

        const preambulo = plantillaHtmlCruda.slice(0, indiceClausulas);
        let cuerpo = plantillaHtmlCruda.slice(indiceClausulas);

        cuerpo = cuerpo.replace(
            "<p><strong>CLÁUSULA PRIMERA. OBJETO:</strong>",
            "<p><strong>CLÁUSULA 1. OBJETO:</strong>"
        );

        let numeroFijo = 1;
        cuerpo = cuerpo.replace(/\[numero\]/g, () => String(++numeroFijo));

        const extras = clausulas.filter((c) => c.seleccionada);
        const bloqueExtras = extras.map((clausula, posicion) =>
            `<p><strong>CLÁUSULA ${numeroFijo + posicion + 1}. ${escaparHTML(clausula.titulo)}:</strong> ${clausula.contenido}`
        ).join("");

        cuerpo = cuerpo.replace(/<p><strong>\[Clausula extra\]<\/strong><\/p>/, bloqueExtras);

        return preambulo + cuerpo;
    }

    function renderizarPreviewConDatos() {
        if (!plantillaHtmlCruda) return;

        const reemplazos = {
            "[CLIENTE]": escaparHTML(clienteSeleccionado ? clienteSeleccionado.nombre : ""),
            "[NIT]": escaparHTML(clienteSeleccionado ? clienteSeleccionado.nit_cc : ""),
            "[DIRECCION]": escaparHTML(clienteSeleccionado ? clienteSeleccionado.direccion : ""),
            "[VALOR]": escaparHTML(formatearMoneda(contratoMonto.value)),
            "[PLAZO]": escaparHTML(calcularPlazo()),
            "[DESCRIPCION]": escaparHTML(contratoDescripcion.value),
            "[OBJETO]": escaparHTML(contratoDescripcion.value),
            "[contenido objeto]": escaparHTML(contratoDescripcion.value),
            "[Objetivo_general]": escaparHTML(objetivoGeneral || contratoDescripcion.value)
        };

        let resultado = construirHtmlContrato();
        Object.keys(reemplazos).forEach((marcador) => {
            const valor = reemplazos[marcador] || marcador;
            resultado = resultado.split(marcador).join(valor);
        });

        previewHtml.innerHTML = resultado;
    }

    contratoTipo.addEventListener("change", () => {
        limpiarPlantilla();
        cargarPlantillas(contratoTipo.value);
    });

    contratoPlantilla.addEventListener("change", () => {
        if (contratoPlantilla.value) cargarContenidoPlantilla(contratoPlantilla.value);
    });

    formularioContrato.addEventListener("input", renderizarPreviewConDatos);
    formularioContrato.addEventListener("change", renderizarPreviewConDatos);

    function llenarDatosCliente() {
        if (!clienteSeleccionado) return;

        contratoClienteNombre.textContent = clienteSeleccionado.nombre;

        const datos = [
            clienteSeleccionado.tipo_cliente,
            `NIT/CC ${clienteSeleccionado.nit_cc}`
        ];
        if (clienteSeleccionado.representante_legal) {
            datos.push(`Representante: ${clienteSeleccionado.representante_legal}`);
        }
        contratoClienteDatos.textContent = datos.join("   |   ");

        cargarTiposContrato();
    }

    btnCambiar.addEventListener("click", () => {
        clienteSeleccionado = null;
        clienteSeleccionadoDiv.hidden = true;
        btnContinuar.disabled = true;
        campoBusqueda.value = "";
        campoBusqueda.focus();
    });

    function irAPaso(numero) {
        if (numero > 1 && !clienteSeleccionado) numero = 1;

        pasoActual = numero;

        document.querySelectorAll(".contenido-paso").forEach((seccion) => {
            seccion.hidden = true;
        });
        document.getElementById(`paso-contenido-${numero}`).hidden = false;

        document.querySelectorAll(".paso").forEach((paso) => {
            paso.classList.remove("paso-activo");
        });
        document.getElementById(`paso-boton-${numero}`).classList.add("paso-activo");

        if (numero === 2) {
            llenarDatosCliente();
        }
    }

    document.querySelectorAll(".via-paso").forEach((paso) => {
        paso.addEventListener("click", () => irAPaso(parseInt(paso.dataset.paso, 10)));
    });

    document.querySelectorAll(".btn-return, .btn-continuar, .btn-generar").forEach((boton) => {
        if (!boton.dataset.paso) return;
        boton.addEventListener("click", () => irAPaso(parseInt(boton.dataset.paso, 10)));
    });

    btnContinuar.addEventListener("click", () => {
        if (clienteSeleccionado) irAPaso(2);
    });
}

function initHistorial() {
    const buscador = document.getElementById("buscador");
    const filtroEstado = document.getElementById("filtro-estado");
    const tablero = document.getElementById("cuerpo-contratos");

    buscador.addEventListener("input", filtrar);
    filtroEstado.addEventListener("change", filtrar);

    function filtrar() {
        const termino = buscador.value.trim().toLowerCase();
        const estadoSeleccionado = filtroEstado.value;

        const filas = tablero.querySelectorAll("tr");
        filas.forEach((fila) => {
            if (fila.classList.contains("fila-vacia")) return;

            const textoFila = fila.textContent.toLowerCase();
            const badge = fila.querySelector(".estado-badge");
            if (!badge) return;
            const estadoFila = badge.textContent;

            const coincideBusqueda = textoFila.includes(termino);
            const coincideEstado = !estadoSeleccionado || estadoFila === estadoSeleccionado;

            fila.style.display = coincideBusqueda && coincideEstado ? "" : "none";
        });
    }
}

function initAdmin() {
    const mensajeDiv = document.getElementById("mensaje-admin");
    let tabActual = "crear-usuario";
    let cargarUsuariosFn = null;

    function mostrarMensaje(texto, tipo) {
        mensajeDiv.textContent = texto;
        mensajeDiv.className = `mensaje-admin ${tipo}`;
        mensajeDiv.hidden = false;
    }

    function limpiarMensaje() {
        mensajeDiv.hidden = true;
    }

    function cambiarTab(tab) {
        tabActual = tab;
        document.querySelectorAll(".admin-seccion").forEach((s) => s.hidden = true);
        document.getElementById(`seccion-${tab}`).hidden = false;
        document.querySelectorAll(".admin-tabs .paso").forEach((p) => {
            p.classList.toggle("paso-activo", p.dataset.tab === tab);
        });
        limpiarMensaje();
    }

    document.querySelectorAll(".admin-tabs .via-paso").forEach((paso) => {
        paso.addEventListener("click", () => cambiarTab(paso.dataset.tab));
    });

    function crearUsuario() {
        const formulario = document.getElementById("formulario-usuario");
        const nombreInput = document.getElementById("usuario-nombre");
        const apellidoInput = document.getElementById("usuario-apellido");
        const correoInput = document.getElementById("usuario-correo");
        const passwordInput = document.getElementById("usuario-password");
        const rolInput = document.getElementById("usuario-rol");

        formulario.addEventListener("submit", async (event) => {
            event.preventDefault();

            const datos = {
                nombre: nombreInput.value.trim(),
                apellido: apellidoInput.value.trim(),
                correo: correoInput.value.trim(),
                password: passwordInput.value,
                rol: rolInput.value
            };

            if (!datos.nombre || !datos.apellido || !datos.correo) {
                mostrarMensaje("Nombre, apellido y correo son obligatorios.", "error");
                return;
            }

            if (!datos.password) {
                mostrarMensaje("La contraseña es obligatoria.", "error");
                return;
            }

            try {
                const respuesta = await fetch(`${API_URL}/usuarios`, {
                    method: "POST",
                    headers: obtenerHeaders(),
                    body: JSON.stringify(datos)
                });

                if (!respuesta.ok) {
                    const error = await respuesta.json();
                    mostrarMensaje(error.mensaje || "No se pudo guardar el usuario.", "error");
                    return;
                }

                mostrarToast("Usuario guardado en la base de datos.", "exito");
                formulario.reset();
                rolInput.value = "usuario";
                if (cargarUsuariosFn) await cargarUsuariosFn();
                mostrarMensaje("Usuario guardado en la base de datos.", "exito");

            } catch (error) {
                mostrarMensaje("No se pudo conectar con el servidor.", "error");
            }
        });
    }

    function adminUsuarios() {
        let usuarios = [];
        const tabla = document.getElementById("cuerpo-usuarios");
        const contador = document.getElementById("contador-usuarios");
        const buscador = document.getElementById("buscador-usuarios");
        const modalUsuario = document.getElementById("modal-usuario");
        const formularioUsuarioEditar = document.getElementById("formulario-usuario-editar");
        const usuarioIdEditar = document.getElementById("usuario-id-editar");
        const nombreEdit = document.getElementById("usuario-nombre-editar");
        const apellidoEdit = document.getElementById("usuario-apellido-editar");
        const correoEdit = document.getElementById("usuario-correo-editar");
        const passwordEdit = document.getElementById("usuario-password-editar");
        const rolEdit = document.getElementById("usuario-rol-editar");
        const btnCerrarModal = document.getElementById("btn-cerrar-modal-usuario");
        const btnCancelarEditar = document.getElementById("btn-cancelar-editar-usuario");

        async function cargarUsuarios() {
            limpiarMensaje();
            tabla.innerHTML = '<tr class="fila-vacia"><td colspan="6">Cargando usuarios...</td></tr>';

            try {
                const respuesta = await fetch(`${API_URL}/usuarios`, { headers: obtenerHeaders() });

                if (respuesta.status === 403) {
                    mostrarMensaje("No tienes permisos para administrar usuarios.", "error");
                    tabla.innerHTML = '<tr class="fila-vacia"><td colspan="6">Sin permisos</td></tr>';
                    return;
                }

                if (!respuesta.ok) {
                    throw new Error("Error al obtener los usuarios");
                }

                usuarios = await respuesta.json();
                contador.textContent = `${usuarios.length} usuario${usuarios.length === 1 ? "" : "s"}`;
                renderizarUsuarios(usuarios);

            } catch (error) {
                tabla.innerHTML = '<tr class="fila-vacia"><td colspan="6">No se pudo conectar con el servidor</td></tr>';
                mostrarMensaje(error.message, "error");
            }
        }

        cargarUsuariosFn = cargarUsuarios;

        function renderizarUsuarios(lista) {
            if (lista.length === 0) {
                tabla.innerHTML = '<tr class="fila-vacia"><td colspan="6">No hay usuarios registrados</td></tr>';
                return;
            }

            tabla.innerHTML = "";

            lista.forEach((u) => {
                const fila = document.createElement("tr");

                const celdas = [u.id, u.nombre, u.apellido, u.correo, u.rol];
                celdas.forEach((valor) => {
                    const td = document.createElement("td");
                    td.textContent = valor;
                    fila.appendChild(td);
                });

                const tdAcciones = document.createElement("td");

                const btnEditar = document.createElement("button");
                btnEditar.className = "boton-editar";
                btnEditar.textContent = "Editar";
                btnEditar.addEventListener("click", () => abrirModalUsuario(u));

                const btnEliminar = document.createElement("button");
                btnEliminar.className = "boton-eliminar";
                btnEliminar.textContent = "Eliminar";
                btnEliminar.addEventListener("click", () => eliminarUsuario(u.id));

                tdAcciones.appendChild(btnEditar);
                tdAcciones.appendChild(btnEliminar);
                fila.appendChild(tdAcciones);

                tabla.appendChild(fila);
            });
        }

        function abrirModalUsuario(u) {
            usuarioIdEditar.value = u.id;
            nombreEdit.value = u.nombre;
            apellidoEdit.value = u.apellido;
            correoEdit.value = u.correo;
            passwordEdit.value = "";
            rolEdit.value = u.rol;
            limpiarMensaje();
            modalUsuario.hidden = false;
            modalUsuario.focus();
        }

        function cerrarModalUsuario() {
            modalUsuario.hidden = true;
            formularioUsuarioEditar.reset();
        }

        modalUsuario.tabIndex = -1;
        btnCerrarModal.addEventListener("click", cerrarModalUsuario);
        btnCancelarEditar.addEventListener("click", cerrarModalUsuario);
        modalUsuario.addEventListener("keydown", (event) => {
            if (event.key === "Escape") cerrarModalUsuario();
        });
        modalUsuario.addEventListener("click", (event) => {
            if (event.target === modalUsuario) cerrarModalUsuario();
        });

        formularioUsuarioEditar.addEventListener("submit", async (event) => {
            event.preventDefault();

            const id = usuarioIdEditar.value;
            const datos = {
                nombre: nombreEdit.value.trim(),
                apellido: apellidoEdit.value.trim(),
                correo: correoEdit.value.trim(),
                rol: rolEdit.value
            };

            if (passwordEdit.value) {
                datos.password = passwordEdit.value;
            }

            if (!datos.nombre || !datos.apellido || !datos.correo) {
                mostrarMensaje("Nombre, apellido y correo son obligatorios.", "error");
                return;
            }

            try {
                const respuesta = await fetch(`${API_URL}/usuarios/${id}`, {
                    method: "PUT",
                    headers: obtenerHeaders(),
                    body: JSON.stringify(datos)
                });

                if (!respuesta.ok) {
                    const error = await respuesta.json();
                    mostrarMensaje(error.mensaje || "No se pudo actualizar el usuario.", "error");
                    return;
                }

                mostrarToast("Usuario actualizado con éxito.", "exito");
                cerrarModalUsuario();
                cargarUsuarios();
                mostrarMensaje("Usuario actualizado correctamente.", "exito");

            } catch (error) {
                mostrarMensaje("No se pudo conectar con el servidor.", "error");
            }
        });

        async function eliminarUsuario(id) {
            if (!confirm("¿Seguro que deseas eliminar este usuario?")) return;

            try {
                const respuesta = await fetch(`${API_URL}/usuarios/${id}`, {
                    method: "DELETE",
                    headers: obtenerHeaders()
                });

                if (!respuesta.ok) {
                    const error = await respuesta.json();
                    mostrarMensaje(error.mensaje || "No se pudo eliminar el usuario.", "error");
                    return;
                }

                mostrarMensaje("Usuario eliminado de la base de datos.", "exito");
                cargarUsuarios();

            } catch (error) {
                mostrarMensaje("No se pudo conectar con el servidor.", "error");
            }
        }

        buscador.addEventListener("input", () => {
            const termino = buscador.value.trim().toLowerCase();
            const filtrados = usuarios.filter((u) =>
                `${u.nombre} ${u.apellido} ${u.correo} ${u.rol}`.toLowerCase().includes(termino)
            );
            renderizarUsuarios(filtrados);
        });

        cargarUsuarios();
    }

    function adminClientes() {
        const formulario = document.getElementById("formulario-cliente");
        const nombreInput = document.getElementById("cliente-nombre");
        const tipoInput = document.getElementById("cliente-tipo");
        const nitInput = document.getElementById("cliente-nit");
        const representanteInput = document.getElementById("cliente-representante");
        const direccionInput = document.getElementById("cliente-direccion");

        const modal = document.getElementById("modal-cliente");
        const formularioEditar = document.getElementById("formulario-cliente-editar");
        const idEdicion = document.getElementById("cliente-id-editar");
        const nombreEdit = document.getElementById("cliente-nombre-editar");
        const tipoEdit = document.getElementById("cliente-tipo-editar");
        const nitEdit = document.getElementById("cliente-nit-editar");
        const representanteEdit = document.getElementById("cliente-representante-editar");
        const direccionEdit = document.getElementById("cliente-direccion-editar");
        const btnCerrarModal = document.getElementById("btn-cerrar-modal");
        const btnCancelarEditar = document.getElementById("btn-cancelar-editar");

        const tableroClientes = document.getElementById("cuerpo-clientes");
        const contadorClientes = document.getElementById("contador-clientes");
        const buscador = document.getElementById("buscador-admin");
        const filtroTipo = document.getElementById("filtro-tipo-cliente");

        let clientes = [];

        function sincronizarRepresentante(select, input) {
            input.disabled = select.value === "Natural";
            if (select.value === "Natural") input.value = "";
        }

        tipoInput.addEventListener("change", () => sincronizarRepresentante(tipoInput, representanteInput));
        tipoEdit.addEventListener("change", () => sincronizarRepresentante(tipoEdit, representanteEdit));
        sincronizarRepresentante(tipoInput, representanteInput);

        function resetearFormulario() {
            formulario.reset();
            sincronizarRepresentante(tipoInput, representanteInput);
        }

        function abrirModal(cliente) {
            idEdicion.value = cliente.id;
            nombreEdit.value = cliente.nombre;
            tipoEdit.value = cliente.tipo_cliente;
            nitEdit.value = cliente.nit_cc;
            representanteEdit.value = cliente.representante_legal || "";
            direccionEdit.value = cliente.direccion || "";
            sincronizarRepresentante(tipoEdit, representanteEdit);
            limpiarMensaje();
            modal.hidden = false;
            modal.focus();
        }

        function cerrarModal() {
            modal.hidden = true;
            formularioEditar.reset();
        }

        modal.tabIndex = -1;
        btnCerrarModal.addEventListener("click", cerrarModal);
        btnCancelarEditar.addEventListener("click", cerrarModal);
        modal.addEventListener("keydown", (event) => {
            if (event.key === "Escape") cerrarModal();
        });
        modal.addEventListener("click", (event) => {
            if (event.target === modal) cerrarModal();
        });

        async function cargarClientes() {
            limpiarMensaje();
            tableroClientes.innerHTML = '<tr class="fila-vacia"><td colspan="6">Cargando clientes...</td></tr>';

            try {
                const respuesta = await fetch(`${API_URL}/clientes`, { headers: obtenerHeaders() });

                if (respuesta.status === 403) {
                    mostrarMensaje("No tienes permisos para administrar datos.", "error");
                    tableroClientes.innerHTML = '<tr class="fila-vacia"><td colspan="6">Sin permisos</td></tr>';
                    return;
                }

                if (!respuesta.ok) {
                    throw new Error("Error al obtener los clientes");
                }

                clientes = await respuesta.json();
                contadorClientes.textContent = `${clientes.length} cliente${clientes.length === 1 ? "" : "s"}`;
                renderizarClientes(clientes);

            } catch (error) {
                tableroClientes.innerHTML = '<tr class="fila-vacia"><td colspan="6">No se pudo conectar con el servidor</td></tr>';
                mostrarMensaje(error.message, "error");
            }
        }

        function renderizarClientes(lista) {
            if (lista.length === 0) {
                tableroClientes.innerHTML = '<tr class="fila-vacia"><td colspan="6">No hay clientes registrados</td></tr>';
                return;
            }

            tableroClientes.innerHTML = "";

            lista.forEach((cliente) => {
                const fila = document.createElement("tr");

                const celdas = [
                    cliente.id,
                    cliente.nombre,
                    cliente.tipo_cliente,
                    cliente.nit_cc,
                    cliente.representante_legal || "-"
                ];

                celdas.forEach((valor) => {
                    const td = document.createElement("td");
                    td.textContent = valor;
                    fila.appendChild(td);
                });

                const tdAcciones = document.createElement("td");

                const btnEditar = document.createElement("button");
                btnEditar.className = "boton-editar";
                btnEditar.textContent = "Editar";
                btnEditar.addEventListener("click", () => abrirModal(cliente));

                const btnEliminar = document.createElement("button");
                btnEliminar.className = "boton-eliminar";
                btnEliminar.textContent = "Eliminar";
                btnEliminar.addEventListener("click", () => eliminarCliente(cliente.id));

                tdAcciones.appendChild(btnEditar);
                tdAcciones.appendChild(btnEliminar);
                fila.appendChild(tdAcciones);

                tableroClientes.appendChild(fila);
            });
        }

        formulario.addEventListener("submit", async (event) => {
            event.preventDefault();

            const datos = {
                nombre: nombreInput.value.trim(),
                tipo_cliente: tipoInput.value,
                nit_cc: nitInput.value.trim(),
                representante_legal: representanteInput.value.trim() || null,
                direccion: direccionInput.value.trim() || null
            };

            if (!datos.nombre || !datos.tipo_cliente || !datos.nit_cc) {
                mostrarMensaje("El nombre, el tipo y el NIT/CC son obligatorios.", "error");
                return;
            }

            try {
                const respuesta = await fetch(`${API_URL}/clientes`, {
                    method: "POST",
                    headers: obtenerHeaders(),
                    body: JSON.stringify(datos)
                });

                if (!respuesta.ok) {
                    const error = await respuesta.json();
                    mostrarMensaje(error.mensaje || "No se pudo guardar el cliente.", "error");
                    return;
                }

                mostrarMensaje("Cliente guardado en la base de datos.", "exito");
                resetearFormulario();
                cargarClientes();

            } catch (error) {
                mostrarMensaje("No se pudo conectar con el servidor.", "error");
            }
        });

        formularioEditar.addEventListener("submit", async (event) => {
            event.preventDefault();

            const id = idEdicion.value;

            const datos = {
                nombre: nombreEdit.value.trim(),
                tipo_cliente: tipoEdit.value,
                nit_cc: nitEdit.value.trim(),
                representante_legal: representanteEdit.value.trim() || null,
                direccion: direccionEdit.value.trim() || null
            };

            if (!datos.nombre || !datos.tipo_cliente || !datos.nit_cc) {
                mostrarMensaje("El nombre, el tipo y el NIT/CC son obligatorios.", "error");
                return;
            }

            try {
                const respuesta = await fetch(`${API_URL}/clientes/${id}`, {
                    method: "PUT",
                    headers: obtenerHeaders(),
                    body: JSON.stringify(datos)
                });

                if (!respuesta.ok) {
                    const error = await respuesta.json();
                    mostrarMensaje(error.mensaje || "No se pudo actualizar el cliente.", "error");
                    return;
                }

                mostrarMensaje("Cliente actualizado correctamente.", "exito");
                cerrarModal();
                cargarClientes();

            } catch (error) {
                mostrarMensaje("No se pudo conectar con el servidor.", "error");
            }
        });

        async function eliminarCliente(id) {
            if (!confirm("¿Seguro que deseas eliminar este cliente?")) return;

            try {
                const respuesta = await fetch(`${API_URL}/clientes/${id}`, {
                    method: "DELETE",
                    headers: obtenerHeaders()
                });

                if (!respuesta.ok) {
                    const error = await respuesta.json();
                    mostrarMensaje(error.mensaje || "No se pudo eliminar el cliente.", "error");
                    return;
                }

                mostrarMensaje("Cliente eliminado de la base de datos.", "exito");
                cargarClientes();

            } catch (error) {
                mostrarMensaje("No se pudo conectar con el servidor.", "error");
            }
        }

        function aplicarFiltros() {
            const termino = buscador.value.trim().toLowerCase();
            const tipo = filtroTipo.value;
            const filtrados = clientes.filter((cliente) => {
                const coincideTexto = `${cliente.nombre} ${cliente.tipo_cliente} ${cliente.nit_cc} ${cliente.representante_legal || ""}`.toLowerCase().includes(termino);
                const coincideTipo = !tipo || cliente.tipo_cliente === tipo;
                return coincideTexto && coincideTipo;
            });
            renderizarClientes(filtrados);
        }

        buscador.addEventListener("input", aplicarFiltros);
        filtroTipo.addEventListener("change", aplicarFiltros);

        cargarClientes();
    }

    crearUsuario();
    adminUsuarios();
    adminClientes();
}

const INITIALIZERS = {
    inicio: initInicio,
    crear: initCrear,
    historial: initHistorial,
    admin: initAdmin
};

function navegar(ruta) {
    if (!TEMPLATES[ruta]) ruta = "inicio";
    if (ruta === "admin" && (!usuario || usuario.rol !== ADMIN)) ruta = "inicio";

    rutaActual = ruta;
    contenido.innerHTML = TEMPLATES[ruta]();
    resaltarNav(ruta);
    INITIALIZERS[ruta]();
}

function obtenerRutaDesdeHash() {
    const hash = window.location.hash.replace("#/", "").replace("#", "");
    return hash || "inicio";
}

window.addEventListener("hashchange", () => {
    navegar(obtenerRutaDesdeHash());
});

navegar(obtenerRutaDesdeHash());
