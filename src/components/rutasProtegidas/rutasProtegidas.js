import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { initialLogin } from "../../redux/reducers/loginReducer";

//componente para proteger las rutas por permisos
const ProtectedRoute = () => {
  const login = useSelector(initialLogin);

  const blockPermiso = () => {
    if (!login) {
      return <Outlet />;

      return <Navigate to={"/"} replace />;
    }
    return <Outlet />;
  };

  return blockPermiso();
};
export default ProtectedRoute;
