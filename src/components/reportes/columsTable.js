import { capitalize, formatoHora, formatoPrecio } from "../utils";

export const colunm = [
  { title: "Caja", field: "caja" },
  {
    title: "Total Vendido",
    field: "vTotal",
    render: (rowData) => formatoPrecio(rowData.vTotal),
  },
  {
    title: "Hora",
    field: "fecha",
    defaultSort: "asc",
    render: (rowData) => (rowData.fecha ? formatoHora(rowData.fecha) : null),
  },
  { title: "Vendedor", field: "usuario" },
  {
    title: "Domiciliario",
    field: "domiciliario.nombre",
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
    title: "Total Pedido",
    field: "total",
    render: (rowData) => formatoPrecio(rowData.total),
  },
];
