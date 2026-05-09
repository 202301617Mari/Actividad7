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