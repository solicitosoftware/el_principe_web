import useSessionStorage from "./useSessionStorage";
import { roles } from "./rolesPermisos";
import { useEffect, useState } from "react";

function useUsuarioPermisos() {
  const [permiso, setPermiso] = useState({});
  const initialLogin = {
    id: null,
    token: false,
    rol: 1,
    sede: null,
  };

  const [login] = useSessionStorage("login", initialLogin);

  useEffect(() => {
    const permisos = () => {
      const result = roles.find((x) => x.value === login.rol).permisos;
      setPermiso(result);
    };

    permisos();
  }, []);

  return permiso;
}

export default useUsuarioPermisos;
