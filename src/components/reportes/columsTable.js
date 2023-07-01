import { capitalize, formatoFecha, formatoPrecio } from "../utils";

const lookupPlataforma = (data) => {
  if (data.sede === 3) {
    return "App Clientes";
  }
  return "El Principe";
};

const lookupEstado = (data) => {
  if (data.estado !== "Cancelado") {
    if (!data.cliente) return "Entregado";
    return data.estado;
  }
  return data.estado;
};

export const colunm = [
  {
    title: "Hora",
    field: "fecha",
    render: (rowData) => (rowData.fecha ? formatoFecha(rowData.fecha) : null),
  },
  {
    title: "Plataforma",
    field: "sede",
    render: (rowData) => lookupPlataforma(rowData),
  },
  {
    title: "Medio Pago",
    field: "medioPago",
    render: (rowData) => capitalize(rowData?.medioPago),
  },
  {
    title: "Transferencia",
    field: "detallePago",
    render: (rowData) =>
      formatoPrecio(rowData?.detallePago?.transferencia ?? 0),
  },
  {
    title: "Efectivo",
    field: "detallePago",
    render: (rowData) => formatoPrecio(rowData?.detallePago?.efectivo ?? 0),
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
  {
    title: "Estado",
    field: "estado",
    render: (rowData) => lookupEstado(rowData),
  },
];
