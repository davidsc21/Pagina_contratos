// ============================================================
// Datos de ejemplo mientras no exista el endpoint de clientes
// en el backend. Cuando se implemente GET /clientes en la API,
// sustituye la constante CLIENTES por una llamada fetch.
// ============================================================
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
const btnCerrarSesion = document.getElementById("btn-cerrar-sesion");

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

// ============================================================
// Navegación entre pasos
// ============================================================
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

btnCerrarSesion.addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    window.location.href = "login.html";
});