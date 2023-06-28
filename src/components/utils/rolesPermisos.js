export const roles = [
  {
    sede: 1,
    value: 1,
    rol: "Cajero Punto de Venta",
    permisos: {
      historialpuntoventa: {
        cargar: true,
        editar: true,
        modificar: true,
        imprimir: true,
      },
      pedidos: {
        puntoVenta: true,
      },
      productos: {
        cargar: true,
        crear: true,
        editarModal: true,
      },
    },
  },
  {
    sede: 1,
    value: 2,
    rol: "Domiciliario Interno",
    permisos: {},
  },
  {
    sede: 4,
    value: 3,
    rol: "Administrador",
    permisos: {
      barrios: {
        cargar: true,
        crear: true,
        editar: true,
        eliminar: true,
      },
      categorias: {
        cargar: true,
        crear: true,
        editar: true,
        eliminar: true,
      },
      deudas: {
        cargar: true,
        pagoTotal: true,
        abono: true,
      },
      domicilios: {
        editar: true,
        modificar: true,
        eliminar: true,
        imprimir: true,
        entregar: true,
        pendientes: true,
      },
      historialpuntoventa: {
        cargar: true,
        editar: true,
        modificar: true,
        eliminar: true,
        imprimir: true,
        fecha: false,
      },
      historialdomicilios: {
        cargar: true,
        imprimir: true,
        fecha: true,
      },
      pedidos: {
        puntoVenta: true,
        domicilios: true,
      },
      productos: {
        cargar: true,
        crear: true,
        editarModal: true,
        eliminar: true,
        precio: true,
      },
      reportes: {
        cargar: true,
        fecha: true,
        boleta: true,
      },
      clientes: {
        cargar: true,
        crear: true,
        editarModal: true,
        eliminar: true,
      },
      empleados: {
        cargar: true,
        crear: true,
        editarModal: true,
        eliminar: true,
      },
    },
  },
  {
    sede: 2,
    value: 4,
    rol: "Vendedor Call Center",
    permisos: {
      domicilios: {
        editar: true,
        modificar: true,
        eliminar: true,
        imprimir: true,
      },
      pedidos: {
        domicilios: true,
      },
      productos: {
        cargar: true,
        crear: true,
        editarModal: true,
      },
      clientes: {
        cargar: true,
        crear: true,
        editarModal: true,
        eliminar: true,
      },
    },
  },
  {
    sede: 1,
    value: 5,
    rol: "Domiciliario Externo",
    permisos: {},
  },
  {
    sede: 4,
    value: 6,
    rol: "Cajero Administrador",
    permisos: {
      deudas: {
        cargar: true,
        pagoTotal: true,
        abono: true,
      },
      domicilios: {
        editar: true,
        modificar: true,
        eliminar: true,
        imprimir: true,
        entregar: true,
        pendientes: true,
      },
      historialpuntoventa: {
        cargar: true,
        editar: true,
        modificar: true,
        eliminar: true,
        imprimir: true,
        fecha: false,
      },
      historialdomicilios: {
        cargar: true,
        imprimir: true,
        fecha: true,
      },
      pedidos: {
        puntoVenta: true,
        domicilios: true,
      },
      productos: {
        cargar: true,
        crear: true,
        editarModal: true,
        eliminar: true,
        precio: true,
      },
      clientes: {
        cargar: true,
        crear: true,
        editarModal: true,
        eliminar: true,
      },
    },
  },
  {
    sede: 1,
    value: 7,
    rol: "Cajero Domicilios",
    permisos: {
      deudas: {
        cargar: true,
        pagoTotal: true,
        abono: true,
      },
      domicilios: {
        editar: true,
        modificar: true,
        eliminar: true,
        imprimir: true,
        entregar: true,
        pendientes: true,
      },
      pedidos: {
        domicilios: true,
      },
      productos: {
        cargar: true,
        crear: true,
        editarModal: true,
      },
      clientes: {
        cargar: true,
        crear: true,
        editarModal: true,
        eliminar: true,
      },
    },
  },
];
