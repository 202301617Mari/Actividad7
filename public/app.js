const messages = document.getElementById("messages");
const input = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

const guestBtn = document.getElementById("guestBtn");
const logoutBtn = document.getElementById("logoutBtn");

const nameInput = document.getElementById("nameInput");
const loginContainer = document.getElementById("loginContainer");
const chatContainer = document.getElementById("chatContainer");
const connectionStatus = document.getElementById("connectionStatus");
const errorMsg = document.getElementById("errorMsg");

let socket = null;

function mostrarMensaje(data) {
    const el = document.createElement("div");

    if (data.tipo === "mensaje") {
        el.classList.add("message");

        const texto = data.mensaje || data.texto || "";
        const hora = data.hora || "";

        el.innerHTML = `<strong>${data.usuario}</strong>: ${texto} <small>(${hora})</small>`;
    }

    if (data.tipo === "notificacion") {
        el.classList.add("notification");
        el.innerHTML = `<em>${data.mensaje}</em>`;
    }

    messages.appendChild(el);
    messages.scrollTop = messages.scrollHeight;
}

async function verificarSesionGoogle() {
    try {
        const respuesta = await fetch("/api/token");

        if (!respuesta.ok) {
            throw new Error("No hay sesión de Google");
        }

        const data = await respuesta.json();

        loginContainer.style.display = "none";
        chatContainer.style.display = "block";

        conectarWebSocketConToken(data.token);

    } catch (error) {
        loginContainer.style.display = "flex";
        chatContainer.style.display = "none";
    }
}

function entrarComoInvitado() {
    const nombre = nameInput.value.trim();

    errorMsg.textContent = "";

    loginContainer.style.display = "none";
    chatContainer.style.display = "block";

    conectarWebSocketInvitado(nombre);
}

function conectarWebSocketConToken(token) {
    const protocolo = window.location.protocol === "https:" ? "wss" : "ws";
    const wsUrl = `${protocolo}://${window.location.host}?token=${encodeURIComponent(token)}`;

    conectarWebSocket(wsUrl);
}

function conectarWebSocketInvitado(nombre) {
    const protocolo = window.location.protocol === "https:" ? "wss" : "ws";

    const wsUrl = nombre !== ""
        ? `${protocolo}://${window.location.host}?usuario=${encodeURIComponent(nombre)}`
        : `${protocolo}://${window.location.host}`;

    conectarWebSocket(wsUrl);
}

function conectarWebSocket(wsUrl) {
    socket = new WebSocket(wsUrl);

    socket.onopen = () => {
        connectionStatus.textContent = "🟢 Conectado";
        connectionStatus.className = "status-dot connected";
    };

    socket.onclose = () => {
        connectionStatus.textContent = "🔴 Desconectado";
        connectionStatus.className = "status-dot disconnected";
    };

    socket.onerror = () => {
        connectionStatus.textContent = "🔴 Error de conexión";
        connectionStatus.className = "status-dot disconnected";
    };

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.tipo === "error") {
            chatContainer.style.display = "none";
            loginContainer.style.display = "flex";
            errorMsg.textContent = data.mensaje;
            return;
        }

        if (data.tipo === "historial") {
            messages.innerHTML = "";

            data.mensajes.forEach(m => {
                mostrarMensaje({
                    tipo: "mensaje",
                    usuario: m.usuario,
                    mensaje: m.mensaje || m.texto,
                    hora: m.hora
                });
            });

            return;
        }

        mostrarMensaje(data);
    };
}

function enviarMensaje() {
    const texto = input.value.trim();

    if (texto !== "" && socket && socket.readyState === WebSocket.OPEN) {
        socket.send(texto);
        input.value = "";
    }
}

guestBtn.addEventListener("click", entrarComoInvitado);

nameInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        entrarComoInvitado();
    }
});

sendBtn.addEventListener("click", enviarMensaje);

input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        enviarMensaje();
    }
});

logoutBtn.addEventListener("click", () => {
    window.location.href = "/logout";
});

verificarSesionGoogle();