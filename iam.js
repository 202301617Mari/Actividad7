const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("./db");

const SECRETO = process.env.JWT_SECRETO || "clave_secreta_chat_grupo3";
const EXPIRACION = "24h";

async function registrar(nombre, password) {
    if (!nombre || !password) {
        throw new Error("Nombre y password son obligatorios");
    }
    if (db.buscarUsuario(nombre)) {
        throw new Error("El usuario ya existe");
    }
    const hash = await bcrypt.hash(password, 10);
    return db.crearUsuario(nombre, hash, false);
}

async function login(nombre, password) {
    const usuario = db.buscarUsuario(nombre);
    if (!usuario || usuario.es_temporal) {
        throw new Error("Usuario no encontrado");
    }
    const valido = await bcrypt.compare(password, usuario.password_hash);
    if (!valido) {
        throw new Error("Password incorrecta");
    }
    const token = jwt.sign(
        { id: usuario.id, nombre: usuario.nombre },
        SECRETO,
        { expiresIn: EXPIRACION }
    );
    return { token, usuario: { id: usuario.id, nombre: usuario.nombre } };
}

function verificarToken(token) {
    try {
        return jwt.verify(token, SECRETO);
    } catch (e) {
        return null;
    }
}
function generarUsuarioTemporal() {
    const numero = Math.floor(Math.random() * 1000);

    const nombre = `Usuario_${numero}`;

    const existente = db.buscarUsuario(nombre);

    if (existente) {
        return generarUsuarioTemporal();
    }

    return db.crearUsuario(nombre, null, true);
}

module.exports = {
    registrar,
    login,
    verificarToken,
    generarUsuarioTemporal
};
