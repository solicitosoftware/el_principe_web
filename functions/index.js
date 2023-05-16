const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");

const app = express();
app.use(
  cors({
    methods: ["GET", "PUT", "POST", "DELETE"],
  })
);
app.use(require("./routes/categorias.routes"));
app.use(require("./routes/productos.routes"));
app.use(require("./routes/clientes.routes"));
app.use(require("./routes/empleados.routes"));
app.use(require("./routes/pedidos.routes"));
app.use(require("./routes/deudas.routes"));
app.use(require("./routes/barrios.routes"));
app.use(require("./routes/municipio.routes"));
app.use(require("./routes/usuarios.routes"));
app.use(require("./routes/utils.routes"));

exports.categorias = functions.https.onRequest(app);
exports.productos = functions.https.onRequest(app);
exports.clientes = functions.https.onRequest(app);
exports.empleados = functions.https.onRequest(app);
exports.pedidos = functions.https.onRequest(app);
exports.deudas = functions.https.onRequest(app);
exports.barrios = functions.https.onRequest(app);
exports.municipios = functions.https.onRequest(app);
exports.usuarios = functions.https.onRequest(app);
exports.utils = functions.https.onRequest(app);
