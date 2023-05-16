import React from "react";
import "react-toastify/dist/ReactToastify.css";
import { formatoFecha, formatoPrecio } from "../../utils";
import { makeStyles } from "@material-ui/core/styles";
import Avatar from "@material-ui/core/Avatar";

const useStyles = makeStyles((theme) => ({
  cancelado: {
    backgroundColor: "#E74C3C",
    marginLeft: 5,
  },
  impreso: {
    backgroundColor: "#23ED84",
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
      title: "Estado",
      field: "estado",
      render: (rowData) => estado(rowData),
      defaultSort: "desc",
      editable: "never",
    },
    {
      title: "Hora Pedido",
      field: "fecha",
      defaultSort: "asc",
      render: (rowData) => (rowData.fecha ? formatoFecha(rowData.fecha) : null),
      editable: "never",
    },
    {
      title: "Turno",
      field: "turno",
      defaultSort: "asc",
      editable: "never",
    },
    {
      title: "Total Venta",
      field: "total",
      render: (rowData) => formatoPrecio(rowData.total),
      editable: "never",
    },
    {
      title: "Medio Pago",
      field: "medioPago",
      render: (rowData) => rowData.medioPago && rowData.medioPago.toUpperCase(),
      editable: "never",
    },
    {
      title: "Observaciones",
      field: "observaciones",
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
  ];

  //metodo para cargar iconos de estados
  const estado = (data) => {
    switch (data.estado) {
      case "Cancelado":
        return <Avatar className={style.cancelado}>C</Avatar>;
      case "Impreso":
        return <Avatar className={style.impreso}>I</Avatar>;
      case "Reimpreso":
        return <Avatar className={style.reimpreso}>R</Avatar>;
      default:
        break;
    }
  };

  return { colunm };
};

export default useColumsTable;
