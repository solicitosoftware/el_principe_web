import { formatoPrecio } from "../utils";

export const colunm = [
  {
    title: "Imagen",
    field: "url",
    render: (rowData) => (
      <img
        alt="producto"
        src={rowData.imagen}
        style={{ width: 60, height: 60, borderRadius: "50%" }}
      />
    ),
  },
  { title: "Nombre", field: "nombre" },
  {
    title: "Precio",
    field: "precio",
    render: (rowData) => formatoPrecio(rowData.precio),
  },
  { title: "Categoría", field: "categoria.nombre" },
  {
    title: "Orden",
    field: "orden",
    type: "numeric",
    align: "center",
    defaultSort: "asc",
  },
  {
    title: "Estado",
    field: "estado",
    lookup: { true: "Disponible", false: "No Disponible" },
  },
];
