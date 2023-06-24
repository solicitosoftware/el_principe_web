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
import Reportes from "./components/reportes/reportes";
import Login from "./components/login/login";
import ProtectedRoute from "./components/rutasProtegidas/rutasProtegidas";

ReactDOM.render(
  <React.StrictMode>
    {/* Context de la BD Firebase */}
    <FirebaseContext.Provider value={{ firebase }}>
      <Provider store={store}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} index />
            <Route element={<ProtectedRoute />}>
              <Route path="/reportes" element={<Reportes />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </Provider>
    </FirebaseContext.Provider>
  </React.StrictMode>,
  document.getElementById("root")
);
