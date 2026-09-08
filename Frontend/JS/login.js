const formulario = document.getElementById("login-form");
const mensajeDiv = document.getElementById("mensaje");

formulario.addEventListener("submit", async (event) => {
    event.preventDefault();

    const correoInput = document.getElementById("correo");
    const passwordInput = document.getElementById("password");

    const correo = correoInput.value.trim();
    const password = passwordInput.value;

    mensajeDiv.textContent = "";
    mensajeDiv.classList.remove("error", "exito");

    if (!correo || !password) {
        mostrarMensaje("Por favor, completa todos los campos.", "error");
        return;
    }

    try {
        const respuesta = await fetch("http://localhost:3000/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ correo, password })
        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            mostrarMensaje(datos.mensaje || "Error al iniciar sesión.", "error");
            return;
        }

        localStorage.setItem("token", datos.token);
        localStorage.setItem("usuario", JSON.stringify(datos.usuario));

        mensajeDiv.textContent = "Inicio de sesión exitoso.";
        mensajeDiv.classList.add("exito");

        setTimeout(() => {
            window.location.href = "index.html";
        }, 800);

    } catch (error) {
        mostrarMensaje("No se pudo conectar con el servidor.", "error");
    }
});

function mostrarMensaje(texto, tipo) {
    mensajeDiv.textContent = texto;
    mensajeDiv.classList.add(tipo);
}