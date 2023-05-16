import { formatoFecha, formatoPrecio } from "../utils";

export const colunm = [
  {
    title: "Domiciliario",
    field: "nombre",
    defaultSort: "asc",
    render: (rowData) => rowData.nombre,
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
    field: "cliente.barrio",
    render: (rowData) => formatoPrecio(rowData.cliente?.barrio.valor),
    editable: "never",
  },
  {
    title: "Medio Pago",
    field: "medioPago",
    render: (rowData) => rowData.medioPago && rowData.medioPago.toUpperCase(),
    editable: "never",
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
    title: "Municipio Barrio",
    field: "cliente.barrio",
    render: (rowData) =>
      rowData.cliente &&
      `${rowData.cliente?.barrio.municipio.nombre} (${rowData.cliente?.barrio.nombre})`,
    editable: "never",
  },
  {
    title: "Deuda",
    field: "deudaTotal",
    render: (rowData) =>
      formatoPrecio(rowData.deudaTotal || calcularDeuda(rowData)),
    editable: "never",
  },
];

const calcularDeuda = (item) => {
  let deuda = item.total;
  if (item.medioPago === "parcial") {
    deuda -= item.detallePago.transferencia;
  }
  if (item.domiciliario && item.domiciliario.rol === 5) {
    deuda -= item.cliente.barrio.valor;
  }
  return deuda;
};
