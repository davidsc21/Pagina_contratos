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
        const estadoFila = fila.querySelector(".estado-badge").textContent;

        const coincideBusqueda = textoFila.includes(termino);
        const coincideEstado = !estadoSeleccionado || estadoFila === estadoSeleccionado;

        fila.style.display = coincideBusqueda && coincideEstado ? "" : "none";
    });
}