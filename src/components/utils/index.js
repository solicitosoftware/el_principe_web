import "moment/locale/es";
const moment = require("moment");

//Retira simbolo de peso y decimales
export function formatearPrecio(val) {
  try {
    const value = val.replace("$", "").replace(/,/g, "");
    return parseInt(value ? value : 0);
  } catch (error) {
    console.error(error);
  }
}

//Agrega simbolo de peso y decimales
export function formatoPrecio(val, signo = ",") {
  try {
    if (val > 0) {
      const valueStr = "$" + parseFloat(val).toFixed(0);
      const value = valueStr.replace(/\B(?=(\d{3})+(?!\d))/g, signo);
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
}

//Transforma las fechas retornadas desde firebase
export function formatearTimestamp(time) {
  try {
    let fecha = new Date((time.seconds || time._seconds) * 1000);
    return fecha;
  } catch (error) {
    console.error(error);
  }
}

export const formatoFecha = (date) => {
  const { _seconds } = date;
  const fecha = new Date(_seconds * 1000);
  return moment(fecha).format("h: mm a");
};

export const diffMinutos = (despacho, entrega) => {
  const milisegundosPorMinuto = 60 * 1000;
  const diferencia = entrega.getTime() - despacho.getTime();
  const minutos = Math.floor(diferencia / milisegundosPorMinuto);
  const minutosRound = Math.abs(minutos) % 60;
  const horas = Math.floor(minutos / 60);
  return horas > 0
    ? minutosRound > 0
      ? `${horas} h ${minutosRound} min`
      : `${horas} h`
    : `${minutosRound} min`;
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

export const salsas = (producto) => {
  const { bbq, rosa, pina } = producto.salsas;
  var detalle = [];
  if (bbq) {
    detalle.push(" Bbq");
  }
  if (rosa) {
    detalle.push(" Rosada");
  }
  if (pina) {
    detalle.push(" Piña");
  }
  return [...detalle];
};
