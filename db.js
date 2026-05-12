// Historial en memoria (últimos 50 mensajes)
const historial = [];

function guardarMensaje(usuario, texto) {
    const mensaje = {
        usuario,
        texto,
        hora: new Date().toLocaleTimeString()
    };
    historial.push(mensaje);
    // Mantener solo los últimos 50
    if (historial.length > 50) historial.shift();
}

function obtenerHistorial() {
    return historial;
}

module.exports = { guardarMensaje, obtenerHistorial };