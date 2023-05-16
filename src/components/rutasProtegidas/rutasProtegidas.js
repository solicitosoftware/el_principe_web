import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import useSessionStorage from "../utils/useSessionStorage";

//componente para proteger las rutas por permisos
const ProtectedRoute = () => {
  const initialLogin = {
    token: false,
    rol: 1,
    sede: null,
  };

  const [login] = useSessionStorage("login", initialLogin);

  const blockPermiso = () => {
    if (login.rol === 2 || login.rol === 5 || login.token === false) {
      return <Navigate to={"/"} replace />;
    }
    return <Outlet />;
  };

  return blockPermiso();
};
export default ProtectedRoute;
