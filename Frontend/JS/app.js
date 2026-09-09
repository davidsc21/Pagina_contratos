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
                <p class="panel-descripcion">Escribe el nombre, documento o correo del cliente</p>

                <form id="formulario-busqueda" class="buscador-clientes">
                    <input type="text" id="campo-busqueda" class="campo-busqueda-cliente"
                           placeholder="Buscar cliente..." autocomplete="off">
                    <button type="submit" class="btn-buscar">Buscar</button>
                </form>

                <div class="resultados-clientes" id="resultados-clientes"></div>
            </div>

            <div class="cliente-seleccionado" id="cliente-seleccionado" hidden>
                <div>
                    <span class="etiqueta-seleccionado">Cliente seleccionado</span>
                    <p class="cliente-seleccionado-nombre" id="cliente-seleccionado-nombre"></p>
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
            <div class="panel">
                <h2 class="panel-titulo">Datos del contrato</h2>
                <p class="panel-descripcion">Los campos de este paso se habilitarán próximamente</p>
                <div class="construccion">
                    <span class="construccion-icono">&#9888;</span>
                    <p>Esta sección está en construcción</p>
                </div>
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
                    <input type="hidden" id="usuario-id">

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
                        <button type="button" class="btn-cancelar" id="btn-cancelar-usuario" hidden>Cancelar</button>
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

        <!-- TAB: ADMINISTRAR CLIENTES -->
        <section class="admin-seccion" id="seccion-admin-clientes" hidden>
            <section class="panel panel-formulario">
                <h2 class="panel-titulo" id="titulo-formulario">Nuevo cliente</h2>
                <p class="panel-descripcion">Completa los datos y presiona guardar</p>

                <form id="formulario-cliente" class="formulario-cliente">
                    <input type="hidden" id="cliente-id">

                    <div class="campo-formulario">
                        <label for="cliente-nombre">Nombre completo</label>
                        <input type="text" id="cliente-nombre" placeholder="Nombre del cliente" required>
                    </div>

                    <div class="campo-formulario">
                        <label for="cliente-documento">Documento / RFC</label>
                        <input type="text" id="cliente-documento" placeholder="Documento o RFC" required>
                    </div>

                    <div class="campo-formulario">
                        <label for="cliente-correo">Correo</label>
                        <input type="email" id="cliente-correo" placeholder="correo@ejemplo.com">
                    </div>

                    <div class="campo-formulario">
                        <label for="cliente-telefono">Teléfono</label>
                        <input type="tel" id="cliente-telefono" placeholder="+52 55 0000 0000">
                    </div>

                    <div class="acciones-formulario">
                        <button type="submit" class="btn-guardar" id="btn-guardar">Guardar cliente</button>
                        <button type="button" class="btn-cancelar" id="btn-cancelar" hidden>Cancelar</button>
                    </div>
                </form>
            </section>

            <section class="historial historial-admin">
                <div class="historial-encabezado">
                    <h2>Clientes registrados</h2>
                    <span class="contador" id="contador-clientes">0 clientes</span>
                </div>

                <div class="herramientas">
                    <input type="text" id="buscador-admin" class="campo-busqueda" placeholder="Buscar cliente...">
                </div>

                <div class="historial-tabla">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Documento</th>
                                <th>Correo</th>
                                <th>Teléfono</th>
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
    const CLIENTES = [
        { id: 1, nombre: "María López García", documento: "GUTL800101MNG", correo: "maria.lopez@correo.com", telefono: "+52 55 1234 5678" },
        { id: 2, nombre: "Carlos Pérez Mendoza", documento: "PEMC850622XKL", correo: "carlos.perez@correo.com", telefono: "+52 33 8765 4321" },
        { id: 3, nombre: "Ana Torres Ruiz", documento: "TORA920310NJS", correo: "ana.torres@correo.com", telefono: "+52 81 5566 7788" },
        { id: 4, nombre: "Jorge Hernández Cruz", documento: "HECJ750515QWE", correo: "jorge.hernandez@correo.com", telefono: "+52 44 9988 1122" }
    ];

    let clienteSeleccionado = null;
    let pasoActual = 1;

    const campoBusqueda = document.getElementById("campo-busqueda");
    const formularioBusqueda = document.getElementById("formulario-busqueda");
    const resultados = document.getElementById("resultados-clientes");
    const clienteSeleccionadoDiv = document.getElementById("cliente-seleccionado");
    const clienteSeleccionadoNombre = document.getElementById("cliente-seleccionado-nombre");
    const btnCambiar = document.getElementById("btn-cambiar");
    const btnContinuar = document.getElementById("btn-continuar");

    formularioBusqueda.addEventListener("submit", (event) => {
        event.preventDefault();
        const termino = campoBusqueda.value.trim().toLowerCase();

        if (!termino) {
            resultados.innerHTML = '<p class="servicio-busqueda">Escribe un término para buscar</p>';
            return;
        }

        const coincidencias = CLIENTES.filter((cliente) => {
            const texto = `${cliente.nombre} ${cliente.documento} ${cliente.correo}`.toLowerCase();
            return texto.includes(termino);
        });

        renderizarResultados(coincidencias);
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
            detalle.textContent = `${cliente.documento} | ${cliente.correo}`;

            info.appendChild(nombre);
            info.appendChild(detalle);

            const boton = document.createElement("button");
            boton.type = "button";
            boton.className = "btn-seleccionar";
            boton.textContent = "Seleccionar";
            boton.addEventListener("click", () => seleccionarCliente(cliente));

            tarjeta.appendChild(info);
            tarjeta.appendChild(boton);
            resultados.appendChild(tarjeta);
        });
    }

    function seleccionarCliente(cliente) {
        clienteSeleccionado = cliente;
        clienteSeleccionadoNombre.textContent = cliente.nombre;
        clienteSeleccionadoDiv.hidden = false;
        btnContinuar.disabled = false;
        resultados.innerHTML = "";
    }

    btnCambiar.addEventListener("click", () => {
        clienteSeleccionado = null;
        clienteSeleccionadoDiv.hidden = true;
        btnContinuar.disabled = true;
        campoBusqueda.value = "";
        campoBusqueda.focus();
    });

    function irAPaso(numero) {
        pasoActual = numero;

        document.querySelectorAll(".contenido-paso").forEach((seccion) => {
            seccion.hidden = true;
        });
        document.getElementById(`paso-contenido-${numero}`).hidden = false;

        document.querySelectorAll(".paso").forEach((paso) => {
            paso.classList.remove("paso-activo");
        });
        document.getElementById(`paso-boton-${numero}`).classList.add("paso-activo");
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
        const usuarioId = document.getElementById("usuario-id");
        const nombreInput = document.getElementById("usuario-nombre");
        const apellidoInput = document.getElementById("usuario-apellido");
        const correoInput = document.getElementById("usuario-correo");
        const passwordInput = document.getElementById("usuario-password");
        const rolInput = document.getElementById("usuario-rol");
        const btnGuardar = document.getElementById("btn-guardar-usuario");
        const btnCancelar = document.getElementById("btn-cancelar-usuario");

        function cancelarEdicion() {
            usuarioId.value = "";
            formulario.reset();
            rolInput.value = "usuario";
            btnGuardar.textContent = "Guardar usuario";
            btnCancelar.hidden = true;
            passwordInput.required = true;
            limpiarMensaje();
        }

        btnCancelar.addEventListener("click", cancelarEdicion);

        formulario.addEventListener("submit", async (event) => {
            event.preventDefault();

            const datos = {
                nombre: nombreInput.value.trim(),
                apellido: apellidoInput.value.trim(),
                correo: correoInput.value.trim(),
                rol: rolInput.value
            };

            if (usuarioId.value) {
                if (passwordInput.value) {
                    datos.password = passwordInput.value;
                }
            } else {
                datos.password = passwordInput.value;
            }

            if (!datos.nombre || !datos.apellido || !datos.correo) {
                mostrarMensaje("Nombre, apellido y correo son obligatorios.", "error");
                return;
            }

            if (!usuarioId.value && !datos.password) {
                mostrarMensaje("La contraseña es obligatoria.", "error");
                return;
            }

            const esEdicion = usuarioId.value !== "";

            try {
                const respuesta = await fetch(
                    esEdicion ? `${API_URL}/usuarios/${usuarioId.value}` : `${API_URL}/usuarios`,
                    {
                        method: esEdicion ? "PUT" : "POST",
                        headers: obtenerHeaders(),
                        body: JSON.stringify(datos)
                    }
                );

                if (!respuesta.ok) {
                    const error = await respuesta.json();
                    mostrarMensaje(error.mensaje || "No se pudo guardar el usuario.", "error");
                    return;
                }

                mostrarToast(esEdicion ? "Usuario actualizado con éxito." : "Usuario guardado en la base de datos.", "exito");
                cancelarEdicion();
                if (cargarUsuariosFn) await cargarUsuariosFn();
                mostrarMensaje(esEdicion ? "Usuario actualizado correctamente." : "Usuario guardado en la base de datos.", "exito");

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
                btnEditar.addEventListener("click", () => comenzarEdicion(u));

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

        function comenzarEdicion(u) {
            cambiarTab("crear-usuario");
            document.getElementById("usuario-id").value = u.id;
            document.getElementById("usuario-nombre").value = u.nombre;
            document.getElementById("usuario-apellido").value = u.apellido;
            document.getElementById("usuario-correo").value = u.correo;
            document.getElementById("usuario-rol").value = u.rol;
            document.getElementById("usuario-password").value = "";
            document.getElementById("usuario-password").required = false;
            document.getElementById("btn-guardar-usuario").textContent = "Actualizar usuario";
            document.getElementById("btn-cancelar-usuario").hidden = false;
        }

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
        const clienteId = document.getElementById("cliente-id");
        const nombreInput = document.getElementById("cliente-nombre");
        const documentoInput = document.getElementById("cliente-documento");
        const correoInput = document.getElementById("cliente-correo");
        const telefonoInput = document.getElementById("cliente-telefono");
        const btnGuardar = document.getElementById("btn-guardar");
        const btnCancelar = document.getElementById("btn-cancelar");
        const tituloFormulario = document.getElementById("titulo-formulario");
        const tableroClientes = document.getElementById("cuerpo-clientes");
        const contadorClientes = document.getElementById("contador-clientes");
        const buscador = document.getElementById("buscador-admin");

        let clientes = [];

        function cancelarEdicion() {
            clienteId.value = "";
            formulario.reset();
            tituloFormulario.textContent = "Nuevo cliente";
            btnGuardar.textContent = "Guardar cliente";
            btnCancelar.hidden = true;
        }

        btnCancelar.addEventListener("click", cancelarEdicion);

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
                    cliente.documento,
                    cliente.correo || "-",
                    cliente.telefono || "-"
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
                btnEditar.addEventListener("click", () => comenzarEdicion(cliente));

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

        function comenzarEdicion(cliente) {
            clienteId.value = cliente.id;
            nombreInput.value = cliente.nombre;
            documentoInput.value = cliente.documento;
            correoInput.value = cliente.correo || "";
            telefonoInput.value = cliente.telefono || "";
            tituloFormulario.textContent = "Editar cliente";
            btnGuardar.textContent = "Actualizar cliente";
            btnCancelar.hidden = false;
            limpiarMensaje();
        }

        formulario.addEventListener("submit", async (event) => {
            event.preventDefault();

            const datos = {
                nombre: nombreInput.value.trim(),
                documento: documentoInput.value.trim(),
                correo: correoInput.value.trim(),
                telefono: telefonoInput.value.trim()
            };

            if (!datos.nombre || !datos.documento) {
                mostrarMensaje("El nombre y el documento son obligatorios.", "error");
                return;
            }

            const idEdicion = clienteId.value;
            const esEdicion = idEdicion !== "";

            try {
                const respuesta = await fetch(
                    esEdicion ? `${API_URL}/clientes/${idEdicion}` : `${API_URL}/clientes`,
                    {
                        method: esEdicion ? "PUT" : "POST",
                        headers: obtenerHeaders(),
                        body: JSON.stringify(datos)
                    }
                );

                if (!respuesta.ok) {
                    const error = await respuesta.json();
                    mostrarMensaje(error.mensaje || "No se pudo guardar el cliente.", "error");
                    return;
                }

                mostrarMensaje(esEdicion ? "Cliente actualizado correctamente." : "Cliente guardado en la base de datos.", "exito");
                cancelarEdicion();
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

        buscador.addEventListener("input", () => {
            const termino = buscador.value.trim().toLowerCase();
            const filtrados = clientes.filter((cliente) =>
                `${cliente.nombre} ${cliente.documento} ${cliente.correo} ${cliente.telefono}`.toLowerCase().includes(termino)
            );
            renderizarClientes(filtrados);
        });

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
