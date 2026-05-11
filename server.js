const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const url = require("url");

const db = require("./db");
const iam = require("./iam");

const app = express();
const server = http.createServer(app);

const PUERTO = 4000;

const wss = new WebSocket.Server({ server });

function enviarATodos(datos) {
    const mensaje = JSON.stringify(datos);

    wss.clients.forEach((cliente) => {
        if (cliente.readyState === WebSocket.OPEN) {
            cliente.send(mensaje);
        }
    });
}
wss.on("connection", (ws, req) => {
    const parametros = url.parse(req.url, true).query;

    let usuario;

    if (parametros.token) {
        const datos = iam.verificarToken(parametros.token);

        if (datos) {
            usuario = {
             id: datos.id,
             nombre: datos.nombre
         };
        }
    }

if (!usuario) {
    usuario = iam.generarUsuarioTemporal();
}

const nombreUsuario = usuario.nombre;

    console.log(`${nombreUsuario} se conectó al chat`);
        const historial = db.obtenerHistorial();

            ws.send(JSON.stringify({
                tipo: "historial",
                mensajes: historial
            }));

    enviarATodos({
        tipo: "notificacion",
        mensaje: `${nombreUsuario} se unió al chat`
    });

    ws.on("message", (data) => {
        const texto = data.toString();

        db.guardarMensaje(usuario.id, texto);
        
        console.log(`${nombreUsuario}: ${texto}`);

        enviarATodos({
            tipo: "mensaje",
            usuario: nombreUsuario,
            mensaje: texto,
            hora: new Date().toLocaleTimeString()
        });
    });

    ws.on("close", () => {
        console.log(`${nombreUsuario} se desconectó del chat`);

        enviarATodos({
            tipo: "notificacion",
            mensaje: `${nombreUsuario} se desconectó del chat`
        });
    });

    ws.on("error", (error) => {
        console.log("Error en WebSocket:", error.message);
    });
});

server.listen(PUERTO, () => {
    console.log(`Servidor iniciado en http://localhost:${PUERTO}`);
    console.log(`WebSocket activo en ws://localhost:${PUERTO}`);
});