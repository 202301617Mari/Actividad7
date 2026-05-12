# Sincrolitos Chat

Sincrolitos Chat es una aplicación de chat colaborativo en tiempo real desarrollada con Node.js, Express y WebSocket. El sistema permite múltiples usuarios conectados simultáneamente mediante una arquitectura cliente-servidor.

## Tecnologías utilizadas

### Backend
- Node.js
- Express
- WebSocket (`ws`)

### Frontend
- HTML
- CSS
- JavaScript

### Dependencias adicionales
- dotenv
- express-session
- passport
- passport-google-oauth20
- jsonwebtoken
- bcryptjs

---

# Requisitos previos

Antes de ejecutar el proyecto, asegúrese de tener instalado:

- Node.js v16 o superior
- npm

Verificar instalación:

```bash
node -v
npm -v
```

---

# Instalación

Clonar el repositorio:

```bash
git clone <URL_DEL_REPOSITORIO>
```

Ingresar al directorio del proyecto:

```bash
cd ACTIVIDAD7
```

Instalar dependencias:

```bash
npm install
```

---

# Configuración

Crear un archivo `.env` en la raíz del proyecto.

Ejemplo:

```env
JWT_SECRETO=clave_jwt
SESSION_SECRET=clave_sesion

GOOGLE_CLIENT_ID=tu_google_client_id
GOOGLE_CLIENT_SECRET=tu_google_client_secret
```

Si no se configura Google OAuth, el sistema seguirá funcionando con usuarios invitados.

---

# Ejecución del proyecto

Iniciar el servidor:

```bash
npm start
```

El servidor se ejecutará en:

```bash
http://localhost:4000
```

Abrir el navegador y acceder a:

```bash
http://localhost:4000
```

---

# Funcionalidades principales

- Comunicación en tiempo real mediante WebSocket
- Múltiples usuarios conectados simultáneamente
- Nombres personalizados
- Usuarios temporales automáticos
- Validación de nombres únicos
- Historial de mensajes
- Notificaciones de conexión y desconexión
- Indicador de estado de conexión
- Login con Google OAuth
- Autenticación con JWT

---

# Estructura del proyecto

```bash
ACTIVIDAD7/
│
├── public/
│   ├── app.js
│   ├── index.html
│   └── styles.css
│
├── .env
├── .gitignore
├── db.js
├── iam.js
├── package-lock.json
├── package.json
├── README.md
└── server.js
```

---

# Descripción de archivos principales

## server.js
Servidor principal de Express y WebSocket. Maneja conexiones, mensajes, autenticación y eventos del chat.

## db.js
Manejo del historial de mensajes en memoria.

## iam.js
Funciones relacionadas con autenticación, JWT y manejo de usuarios.

## public/app.js
Lógica del cliente y conexión WebSocket.

## public/index.html
Estructura de la interfaz del chat.

## public/styles.css
Estilos visuales de la aplicación.

---

# Uso del sistema

1. Abrir `http://localhost:4000`
2. Ingresar un nombre o dejar el campo vacío
3. Entrar al chat
4. Enviar mensajes mediante el botón o la tecla Enter

---

# Notas

- El historial de mensajes se almacena temporalmente en memoria.
- Al reiniciar el servidor, el historial se pierde.
- El sistema puede probarse abriendo múltiples pestañas del navegador.

---

# Autor

Proyecto académico desarrollado por el equipo Caracolitos.