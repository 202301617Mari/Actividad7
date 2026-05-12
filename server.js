const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const url = require("url");
const path = require("path");

const db = require("./db");

const app = express();
const server = http.createServer(app);

app.use(express.static(path.join(__dirname, "public")));

const wss = new WebSocket.Server({ server });

const PUERTO = 4000;

const nombresActivos = new Set();

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
    let nombreBase = (parametros.usuario || "").trim();

    if (nombreBase === "") {
        let temp;
        do {
            temp = "Caracolito_" + Math.floor(Math.random() * 1000);
        } while (nombresActivos.has(temp));
        nombreBase = temp;
    }

    if (nombresActivos.has(nombreBase)) {
        ws.send(JSON.stringify({
            tipo: "error",
            mensaje: `El nombre "${nombreBase}" ya está en uso. Elige otro.`
        }));
        ws.close();
        return;
    }

    const nombreUsuario = nombreBase;
    nombresActivos.add(nombreUsuario);

    console.log(`${nombreUsuario} se conectó`);

    ws.send(JSON.stringify({
        tipo: "historial",
        mensajes: db.obtenerHistorial()
    }));

    enviarATodos({
        tipo: "notificacion",
        mensaje: `${nombreUsuario} se unió al chat`
    });

    ws.on("message", (data) => {
        const texto = data.toString();
        console.log(`${nombreUsuario}: ${texto}`);
        db.guardarMensaje(nombreUsuario, texto);

        enviarATodos({
            tipo: "mensaje",
            usuario: nombreUsuario,
            mensaje: texto,
            hora: new Date().toLocaleTimeString()
        });
    });

    ws.on("close", () => {
        console.log(`${nombreUsuario} se desconectó`);
        nombresActivos.delete(nombreUsuario); // liberar el nombre
        enviarATodos({
            tipo: "notificacion",
            mensaje: `${nombreUsuario} se desconectó del chat`
        });
    });

    ws.on("error", (error) => {
        console.log("Error WebSocket:", error.message);
    });
});

server.listen(PUERTO, () => {
    console.log(`Servidor en http://localhost:${PUERTO}`);
});