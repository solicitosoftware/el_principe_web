import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import store from "./redux/store";
import firebase, { FirebaseContext } from "./firebase";
import "./css/main.css";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css"; // Archivo CSS de Bootstrap 4
import "../node_modules/bootstrap/dist/js/bootstrap.min.js"; // Archivo Javascript de Bootstrap 4
// Se Cargan todos los screen para la navegación
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Categorias from "./components/categorias/categorias";
import Reportes from "./components/reportes/reportes";
import Empleados from "./components/usuarios/empleados/empleado";
import Clientes from "./components/usuarios/clientes/cliente";
import Domicilios from "./components/domicilios/domicilios";
import Productos from "./components/productos/productos";
import Home from "./components/home/home";
import Login from "./components/login/login";
import ProtectedRoute from "./components/rutasProtegidas/rutasProtegidas";
import PuntoVenta from "./components/pedidos/puntoVenta/puntoVenta";
import Domicilio from "./components/pedidos/domicilio/domicilio";
import HistorialPV from "./components/historial/puntoVenta/historialPV";
import HistorialDom from "./components/historial/domicilio/historialDom";
import Deudas from "./components/deudas/deudas";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";
import Barrios from "./components/barrios/barrios";

ReactDOM.render(
  <React.StrictMode>
    {/* Context de la BD Firebase */}
    <FirebaseContext.Provider value={{ firebase }}>
      <Provider store={store}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} index />
            <Route element={<ProtectedRoute />}>
              <Route path="inicio" element={<Home />} />
              <Route path="/barrios" element={<Barrios />} />
              <Route path="/categorias" element={<Categorias />} />
              <Route path="/reportes" element={<Reportes />} />
              <Route path="/empleados" element={<Empleados />} />
              <Route path="/clientes" element={<Clientes />} />
              <Route path="/domicilios" element={<Domicilios />} />
              <Route path="/productos" element={<Productos />} />
              <Route path="/pedidos" element={<Domicilio />} />
              <Route path="/puntoVenta" element={<PuntoVenta />} />
              <Route path="/historialPuntoVenta" element={<HistorialPV />} />
              <Route path="/historialDomicilios" element={<HistorialDom />} />
              <Route path="/deudas" element={<Deudas />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </Provider>
    </FirebaseContext.Provider>
  </React.StrictMode>,
  document.getElementById("root")
);

// serviceWorkerRegistration.register({
//   onUpdate: async (registration) => {
//     if (registration && registration.waiting) {
//       await registration.unregister();
//       registration.waiting.postMessage({ type: "SKIP_WAITING" });
//       window.location.reload();
//     }
//   },
// });
