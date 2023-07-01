//producto interno solo mostrado para los empleados
export const productoInterno = {
  categoria: {
    id: Math.random().toString().replace(".", ""),
    nombre: "Interno",
    salsas: true,
    descripcion: "Interno",
  },
  id: `elprincipe-${Math.random().toString().replace(".", "")}`,
  descripcion: "Producto Interno",
  estado: true,
  imagen:
    "https://firebasestorage.googleapis.com/v0/b/elprincipe-45296.appspot.com/o/productos%2FProductoInterno.png?alt=media&token=0b68acb6-39d2-4697-bf69-4c28775cae84",
  nombre: "Producto Interno",
  orden: 100,
  precio: 0,
  modificar: true,
};
