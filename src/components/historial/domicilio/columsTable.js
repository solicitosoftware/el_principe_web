import React from "react";
import "react-toastify/dist/ReactToastify.css";
import {
  diffMinutos,
  formatearTimestamp,
  formatoFecha,
  formatoPrecio,
} from "../../utils";
import { makeStyles } from "@material-ui/core/styles";
import { BsPhone } from "react-icons/bs";
import Avatar from "@material-ui/core/Avatar";

//Metodo para asignar estilos a los estados
const useStyles = makeStyles((theme) => ({
  pendiente: {
    backgroundColor: "#E67E22",
    marginLeft: 5,
  },
  despachado: {
    backgroundColor: "#2980B9",
    marginLeft: 5,
  },
  entregado: {
    backgroundColor: "#2ECC71",
    marginLeft: 5,
  },
  cancelado: {
    backgroundColor: "#E74C3C",
    marginLeft: 5,
  },
  impreso: {
    backgroundColor: "#2C3E50",
    marginLeft: 5,
  },
  reimpreso: {
    backgroundColor: "#A023ED",
    marginLeft: 5,
  },
}));

const useColumsTable = () => {
  const style = useStyles();

  const colunm = [
    {
      title: "id",
      field: "id",
      hidden: true,
    },
    {
      title: "Estado",
      field: "estado",
      render: (rowData) => estado(rowData),
      editable: "never",
    },
    {
      title: "Hora Pedido",
      field: "fecha",
      render: (rowData) => (rowData.fecha ? formatoFecha(rowData.fecha) : null),
      editable: "never",
    },
    {
      title: "Total Venta",
      field: "total",
      render: (rowData) => formatoPrecio(rowData.total),
      editable: "never",
    },
    {
      title: "Valor Domicilio",
      field: "cliente.barrio.valor",
      render: (rowData) => formatoPrecio(rowData.cliente?.barrio.valor),
      editable: "never",
      type: "numeric",
    },
    {
      title: "Medio Pago",
      field: "medioPago",
      render: (rowData) => rowData.medioPago && rowData.medioPago.toUpperCase(),
      editable: "never",
      lookup: { efectivo: "Efectivo", transferencia: "Transferencia" },
    },
    {
      title: "Cliente",
      field: "cliente.nombre",
      editable: "never",
    },
    {
      title: "Dirección",
      field: "cliente.direccion",
      editable: "never",
    },
    {
      title: "Punto Ref",
      field: "cliente.puntoRef",
      editable: "never",
    },
    {
      title: "Teléfono Principal",
      field: "cliente.telefono",
      editable: "never",
      type: "numeric",
      validate: (rowData) => {
        if (!rowData.cliente.telefono) {
          return {
            isValid: false,
            helperText: "El número de teléfono es obligatorio",
          };
        } else {
          return true;
        }
      },
    },
    {
      title: "Teléfono Secundario",
      field: "cliente.telefono2",
      editable: "never",
      type: "numeric",
    },
    {
      title: "Municipio Barrio",
      field: "cliente.barrio.id",
      render: (rowData) =>
        rowData.cliente &&
        `${rowData.cliente.barrio.municipio.nombre} (${rowData.cliente.barrio.nombre})`,
      editable: "never",
    },
    {
      title: "Domiciliario",
      field: "domiciliario.nombre",
      render: (rowData) => rowData.domiciliario?.nombre,
      editable: "never",
    },
    {
      title: "Hora Despacho",
      field: "domiciliario",
      render: (rowData) =>
        rowData.domiciliario?.hora
          ? formatoFecha(rowData.domiciliario?.hora)
          : null,
      editable: "never",
    },
    {
      title: "Comentario",
      field: "observaciones",
      editable: "never",
    },
    {
      title: "Motivo Cancelación",
      field: "comentario",
      editable: "never",
    },
    {
      title: "Modificado",
      field: "modificado",
      render: (rowData) => (rowData.modificado ? rowData.usuario : null),
      editable: "never",
    },
    {
      title: "Ultimo Movimiento",
      field: "movimiento",
      render: (rowData) =>
        rowData.movimiento ? formatoFecha(rowData.movimiento) : null,
      editable: "never",
    },
    {
      title: "Hora Entrega",
      field: "entrega",
      render: (rowData) =>
        rowData.entrega ? formatoFecha(rowData.entrega) : null,
      editable: "never",
    },
    {
      title: "Tiempo Entrega",
      field: "entrega",
      render: (rowData) =>
        rowData.entrega
          ? diffMinutos(
              formatearTimestamp(rowData.domiciliario.hora),
              formatearTimestamp(rowData.entrega)
            )
          : null,
      editable: "never",
    },
  ];

  //Metodo para retornar los iconos de estado por color
  const estado = (data) => {
    switch (data.estado) {
      case "Pendiente":
        return (
          <Avatar className={style.pendiente}>
            {data.sede !== 3 ? "P" : <BsPhone />}
          </Avatar>
        );
      case "Cancelado":
        return (
          <Avatar className={style.cancelado}>
            {data.sede !== 3 ? "C" : <BsPhone />}
          </Avatar>
        );
      case "Entregado":
        return (
          <Avatar className={style.entregado}>
            {data.sede !== 3 ? "E" : <BsPhone />}
          </Avatar>
        );
      case "Impreso":
        return (
          <Avatar className={style.impreso}>
            {data.sede !== 3 ? "I" : <BsPhone />}
          </Avatar>
        );
      case "Reimpreso":
        return (
          <Avatar className={style.reimpreso}>
            {data.sede !== 3 ? "R" : <BsPhone />}
          </Avatar>
        );
      default:
        return (
          <Avatar className={style.despachado}>
            {data.sede !== 3 ? "D" : <BsPhone />}
          </Avatar>
        );
    }
  };

  return { colunm };
};

export default useColumsTable;
