import { formatoPrecio } from "../utils";

const plataformas = (data) => {
  const { app, domicilio, caja } = data.disponible;
  var detalle = [];
  if (app) {
    detalle.push(" App Móvil");
  }
  if (domicilio) {
    detalle.push(" Domicilios");
  }
  if (caja) {
    detalle.push(" Punto Venta");
  }
  return [...detalle];
};

const lookupPlataforma = (data) => {
  if (data.disponible) {
    const valores = Object.values(data.disponible);
    if (valores.every((x) => x === true)) return "Todas";
    else {
      return plataformas(data);
    }
  }
  return "Todas";
};

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
    title: "Plataforma",
    field: "disponible",
    render: (rowData) => lookupPlataforma(rowData),
  },
  {
    title: "Estado",
    field: "estado",
    lookup: { true: "Disponible", false: "No Disponible" },
  },
];
