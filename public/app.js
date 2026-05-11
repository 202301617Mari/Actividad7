const messages = document.getElementById('messages');
const input = document.getElementById('messageInput');
const button = document.getElementById('sendBtn');
const enterBtn = document.getElementById('enterBtn');
const nameInput = document.getElementById('nameInput');
const loginContainer = document.getElementById('loginContainer');
const chatContainer = document.getElementById('chatContainer');

let socket;
let usuario;

function entrarAlChat() {
    const nombre = nameInput.value.trim();
    if (nombre === '') {
        nameInput.placeholder = 'El nombre no puede estar vacío';
        return;
    }

    usuario = nombre;
    loginContainer.style.display = 'none';
    chatContainer.style.display = 'block';

    // Conectar WebSocket con el nombre real
    socket = new WebSocket(`ws://localhost:4000?usuario=${encodeURIComponent(usuario)}`);

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        const el = document.createElement('div');

        if (data.tipo === 'mensaje') {
            el.classList.add('message');
            el.innerHTML = `<strong>${data.usuario}</strong>: ${data.mensaje} <small>(${data.hora})</small>`;
        }

        if (data.tipo === 'notificacion') {
            el.classList.add('notification');
            el.innerHTML = `<em>${data.mensaje}</em>`;
        }

        if (data.tipo === 'historial') {
            data.mensajes.forEach(m => {
                const h = document.createElement('div');
                h.classList.add('message');
                h.innerHTML = `<strong>${m.usuario}</strong>: ${m.mensaje} <small>(${m.hora})</small>`;
                messages.appendChild(h);
            });
            return;
        }

        messages.appendChild(el);
        messages.scrollTop = messages.scrollHeight;
    };
}

enterBtn.addEventListener('click', entrarAlChat);
nameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') entrarAlChat();
});

function enviarMensaje() {
    const mensaje = input.value;
    if (mensaje.trim() !== '' && socket && socket.readyState === WebSocket.OPEN) {
        socket.send(mensaje);
        input.value = '';
    }
}

button.addEventListener('click', enviarMensaje);
input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') enviarMensaje();
});