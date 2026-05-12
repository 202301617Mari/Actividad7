require("dotenv").config();

const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const url = require("url");
const path = require("path");

const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const jwt = require("jsonwebtoken");

const db = require("./db");

const app = express();
const server = http.createServer(app);

app.use(express.static("public"));

const PUERTO = 4000;
const SECRETO_JWT = process.env.JWT_SECRETO || "clave_secreta_chat";

app.use(express.static(path.join(__dirname, "public")));

app.use(session({
    secret: process.env.SESSION_SECRET || "clave_session_chat",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((usuario, done) => {
    done(null, usuario);
});

passport.deserializeUser((usuario, done) => {
    done(null, usuario);
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
}, (accessToken, refreshToken, profile, done) => {
    const usuario = {
        id: profile.id,
        nombre: profile.displayName,
        email: profile.emails[0].value
    };

    done(null, usuario);
}));

app.get("/auth/google",
    passport.authenticate("google", {
        scope: ["profile", "email"]
    })
);

app.get("/auth/google/callback",
    passport.authenticate("google", {
        failureRedirect: "/"
    }),
    (req, res) => {
        res.redirect("/");
    }
);

app.get("/api/token", (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            mensaje: "No autenticado"
        });
    }

    const token = jwt.sign(
        {
            nombre: req.user.nombre,
            email: req.user.email
        },
        SECRETO_JWT,
        { expiresIn: "24h" }
    );

    res.json({ token });
});

app.get("/logout", (req, res) => {
    req.logout(() => {
        res.redirect("/");
    });
});

const wss = new WebSocket.Server({ server });

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

    let nombreBase = "";

    if (parametros.token) {
        try {
            const usuarioGoogle = jwt.verify(parametros.token, SECRETO_JWT);
            nombreBase = usuarioGoogle.nombre;
        } catch (error) {
            ws.send(JSON.stringify({
                tipo: "error",
                mensaje: "Token de Google inválido"
            }));
            ws.close();
            return;
        }
    } else {
        nombreBase = (parametros.usuario || "").trim();
    }

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

        nombresActivos.delete(nombreUsuario);

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