import jwt from "jwt-simple";

const secret = "12345789";
export function codificarDatos(key, data) {
  const dataEncode = jwt.encode({ [key]: data }, secret);
  return dataEncode;
}

//metodo para cifrar el token
export function decodificarDatos(key, data) {
  try {
    const decoded = jwt.decode(data, secret);
    return decoded[key];
  } catch (err) {
    return null;
  }
}
