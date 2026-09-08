const nombreUsuario = document.getElementById("nombre-usuario");
const botonCerrarSesion = document.getElementById("btn-cerrar-sesion");

const usuario = JSON.parse(localStorage.getItem("usuario"));

if (usuario && usuario.nombre) {
    const nombreCompleto = [usuario.nombre, usuario.apellido].filter(Boolean).join(" ");
    nombreUsuario.textContent = nombreCompleto;
} else {
    nombreUsuario.textContent = "Usuario";
}

botonCerrarSesion.addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    window.location.href = "login.html";
});