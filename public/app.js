const messages = document.getElementById('messages');
const input = document.getElementById('messageInput');
const button = document.getElementById('sendBtn');

// nombre temporal automático
const usuario = "Usuario_" + Math.floor(Math.random() * 1000);

// conexión websocket
const socket = new WebSocket(`ws://localhost:4000?usuario=${usuario}`);

// recibir mensajes
socket.onmessage = (event) => {
    const data = JSON.parse(event.data);

    const messageElement = document.createElement('div');

    // estilos según tipo
    if (data.tipo === 'mensaje') {
        messageElement.classList.add('message');

        messageElement.innerHTML = `
            <strong>${data.usuario}</strong>: ${data.mensaje}
            <small>(${data.hora})</small>
        `;
    }

    if (data.tipo === 'notificacion') {
        messageElement.classList.add('notification');

        messageElement.innerHTML = `
            <em>${data.mensaje}</em>
        `;
    }

    messages.appendChild(messageElement);

    // scroll automático
    messages.scrollTop = messages.scrollHeight;
};

// enviar mensajes
function enviarMensaje() {
    const mensaje = input.value;

    if (mensaje.trim() !== '') {
        socket.send(mensaje);
        input.value = '';
    }
}

// botón enviar
button.addEventListener('click', enviarMensaje);

// enviar con ENTER
input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        enviarMensaje();
    }
});