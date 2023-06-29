import { capitalize, formatoFecha, formatoPrecio } from "../utils";

export const colunm = [
  {
    title: "Hora",
    field: "fecha",
    defaultSort: "asc",
    render: (rowData) => (rowData.fecha ? formatoFecha(rowData.fecha) : null),
  },
  {
    title: "Medio Pago",
    field: "medioPago",
    render: (rowData) => capitalize(rowData?.medioPago),
  },
  {
    title: "Transferencia",
    field: "detallePago",
    render: (rowData) => formatoPrecio(rowData?.detallePago?.transferencia),
  },
  {
    title: "Efectivo",
    field: "detallePago",
    render: (rowData) => formatoPrecio(rowData?.detallePago?.efectivo),
  },
  {
    title: "IPO Consumo",
    field: "ipoconsumo",
    render: (rowData) => formatoPrecio(rowData.ipoconsumo),
  },
  {
    title: "Total",
    field: "total",
    render: (rowData) => formatoPrecio(rowData.total),
  },
];
