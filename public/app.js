const messages = document.getElementById('messages');
const input = document.getElementById('messageInput');
const button = document.getElementById('sendBtn');
const enterBtn = document.getElementById('enterBtn');
const nameInput = document.getElementById('nameInput');
const loginContainer = document.getElementById('loginContainer');
const chatContainer = document.getElementById('chatContainer');
const connectionStatus = document.getElementById('connectionStatus');
const errorMsg = document.getElementById('errorMsg');

let socket;

function mostrarMensaje(data) {
    const el = document.createElement('div');

    if (data.tipo === 'mensaje') {
        el.classList.add('message');
        const texto = data.mensaje || data.texto || '';
        const hora = data.hora || '';
        el.innerHTML = `<strong>${data.usuario}</strong>: ${texto} <small>(${hora})</small>`;
    }

    if (data.tipo === 'notificacion') {
        el.classList.add('notification');
        el.innerHTML = `<em>${data.mensaje}</em>`;
    }

    messages.appendChild(el);
    messages.scrollTop = messages.scrollHeight;
}

function entrarAlChat() {
    const nombre = nameInput.value.trim();
    errorMsg.textContent = ''; // limpiar error previo

    loginContainer.style.display = 'none';
    chatContainer.style.display = 'block';

    const wsUrl = nombre !== ''
        ? `ws://localhost:4000?usuario=${encodeURIComponent(nombre)}`
        : `ws://localhost:4000`;

    socket = new WebSocket(wsUrl);

    socket.onopen = () => {
        connectionStatus.textContent = '🟢 Conectado';
        connectionStatus.className = 'status-dot connected';
    };

    socket.onclose = () => {
        connectionStatus.textContent = '🔴 Desconectado';
        connectionStatus.className = 'status-dot disconnected';
    };

    socket.onerror = () => {
        connectionStatus.textContent = '🔴 Error de conexión';
        connectionStatus.className = 'status-dot disconnected';
    };

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);

        // Nombre duplicado — volver al login con mensaje de error
        if (data.tipo === 'error') {
            chatContainer.style.display = 'none';
            loginContainer.style.display = 'flex';
            errorMsg.textContent = data.mensaje;
            return;
        }

        if (data.tipo === 'historial') {
            data.mensajes.forEach(m => mostrarMensaje({ tipo: 'mensaje', ...m }));
            return;
        }

        mostrarMensaje(data);
    };
}

enterBtn.addEventListener('click', entrarAlChat);
nameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') entrarAlChat();
});

function enviarMensaje() {
    const texto = input.value.trim();
    if (texto !== '' && socket && socket.readyState === WebSocket.OPEN) {
        socket.send(texto);
        input.value = '';
    }
}

button.addEventListener('click', enviarMensaje);
input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') enviarMensaje();
});