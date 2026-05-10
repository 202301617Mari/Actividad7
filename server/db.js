const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.join(__dirname, "chat.db"));

db.exec(`
    CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT UNIQUE NOT NULL,
        password_hash TEXT,
        es_temporal INTEGER NOT NULL DEFAULT 0,
        creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS mensajes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_id INTEGER NOT NULL,
        texto TEXT NOT NULL,
        fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    );
`);

function crearUsuario(nombre, passwordHash, esTemporal = false) {
    const stmt = db.prepare(
        "INSERT INTO usuarios (nombre, password_hash, es_temporal) VALUES (?, ?, ?)"
    );
    const info = stmt.run(nombre, passwordHash, esTemporal ? 1 : 0);
    return { id: info.lastInsertRowid, nombre, esTemporal };
}

function buscarUsuario(nombre) {
    return db.prepare("SELECT * FROM usuarios WHERE nombre = ?").get(nombre);
}

function guardarMensaje(usuarioId, texto) {
    const stmt = db.prepare(
        "INSERT INTO mensajes (usuario_id, texto) VALUES (?, ?)"
    );
    const info = stmt.run(usuarioId, texto);
    return info.lastInsertRowid;
}

function obtenerHistorial(limite = 50) {
    return db.prepare(`
        SELECT m.id, u.nombre AS usuario, m.texto, m.fecha
        FROM mensajes m
        JOIN usuarios u ON u.id = m.usuario_id
        ORDER BY m.id DESC
        LIMIT ?
    `).all(limite).reverse();
}

module.exports = {
    crearUsuario,
    buscarUsuario,
    guardarMensaje,
    obtenerHistorial
};
