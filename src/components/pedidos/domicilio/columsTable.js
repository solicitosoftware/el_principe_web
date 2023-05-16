import { formatoPrecio } from "../../utils";

export const colunm = [
  {
    title: "Nombre",
    field: "nombre",
    defaultSort: "asc",
    cellStyle: { width: "20%" },
  },
  {
    title: "Teléfono Principal",
    field: "telefono",
    type: "numeric",
    cellStyle: { width: "15%" },
  },
  {
    title: "Teléfono Secundario",
    field: "telefono2",
    type: "numeric",
    cellStyle: { width: "15%" },
  },
  {
    title: "Direccion Principal",
    field: "direccion",
    cellStyle: { width: "20%" },
  },
  {
    title: "Municipio",
    field: "barrio.municipio.nombre",
    cellStyle: { width: "10%" },
  },
  {
    title: "Barrio",
    field: "barrio.nombre",
    cellStyle: { width: "10%" },
  },
  {
    title: "Punto Referencia",
    field: "puntoRef",
    cellStyle: { width: "20%" },
  },
  {
    title: "Valor Domicilio",
    field: "barrio?.valor",
    render: (rowData) => formatoPrecio(rowData?.barrio?.valor),
    cellStyle: { width: "10%" },
  },
];
