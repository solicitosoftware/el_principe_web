import { formatoPrecio } from "../utils";

export const column = [
  {
    title: "Nombre",
    field: "nombre",
    defaultSort: "asc",
  },
  {
    title: "Valor",
    field: "valor",
    render: (rowData) => formatoPrecio(rowData.valor),
    type: "numeric",
  },
  {
    title: "Municipio",
    field: "municipio.nombre",
    editable: "never",
  },
];
