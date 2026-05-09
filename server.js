const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const url = require("url");

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

    const nombreUsuario = parametros.usuario || "Usuario sin identificar";

    console.log(`${nombreUsuario} se conectó al chat`);

    enviarATodos({
        tipo: "notificacion",
        mensaje: `${nombreUsuario} se unió al chat`
    });

    ws.on("message", (data) => {
        const texto = data.toString();

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