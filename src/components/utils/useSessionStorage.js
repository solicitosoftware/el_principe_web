import { useState } from "react";
import { codificarDatos, decodificarDatos } from "./jwt";

//use localstorage para guardar datos de sesión
function useSessionStorage(key, initialValue) {
  const [storage, setStorage] = useState(() => {
    //devolver es valor del storage dependiendo de la key
    try {
      const item = sessionStorage.getItem(key);
      const result = item ? decodificarDatos(key, item) : initialValue;
      return result;
    } catch (error) {
      return initialValue;
    }
  });

  //set el valor con una key
  const setValue = (value) => {
    try {
      if (value === undefined) {
        sessionStorage.removeItem(key);
      } else {
        setStorage(value);
        sessionStorage.setItem(key, codificarDatos(key, value));
      }
    } catch (error) {
      console.error(error);
    }
  };

  return [storage, setValue];
}

export default useSessionStorage;
