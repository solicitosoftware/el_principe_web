import "moment/locale/es";
const moment = require("moment");

//Agrega simbolo de peso y decimales
export const formatoPrecio = (val) => {
  try {
    if (val > 0) {
      const valueStr = "$" + parseFloat(val).toFixed(0);
      const value = valueStr.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
      return value;
    } else if (val === 0) {
      return "$" + val;
    } else if (val === "") {
      return val;
    }
    return null;
  } catch (error) {
    console.error(error);
  }
};

export const formatoHora = (date) => {
  const { _seconds } = date;
  const fecha = new Date(_seconds * 1000);
  return moment(fecha).format("h: mm a");
};

export const formatoFecha = (date) => {
  const { _seconds } = date;
  const fecha = new Date(_seconds * 1000);
  return moment(fecha).format("MMMM-DD-YYYY, h: mm a");
};

export const capitalize = (val) => {
  if (val) {
    let palabra = val
      .toLowerCase()
      .split(" ")
      .map((frase) => {
        if (frase != "") {
          return frase[0].trim().toUpperCase() + frase.slice(1);
        }
      });
    return palabra.join(" ");
  }
  return val;
};
