const mailformat = /^[-\w.%+]{1,64}@(?:[A-Z0-9-]{1,63}\.){1,125}[A-Z]{2,63}$/i;

export const colunm = [
  {
    title: "Nombre",
    field: "nombre",
    defaultSort: "asc",
    validate: (rowData) => {
      if (rowData.nombre === "") {
        return {
          isValid: false,
          helperText: "El nombre es obligatorio",
        };
      } else if (rowData.nombre.length < 4) {
        return {
          isValid: false,
          helperText: "El nombre debe contener por lo menos 4 caracteres",
        };
      } else {
        return true;
      }
    },
  },
  {
    title: "Teléfono",
    field: "telefono",
    type: "numeric",
    validate: (rowData) => {
      if (!rowData.telefono) {
        return {
          isValid: false,
          helperText: "El número de teléfono es obligatorio",
        };
      } else {
        return true;
      }
    },
  },
  {
    title: "Correo",
    field: "correo",
    validate: (rowData) => {
      if (rowData.correo === "") {
        return {
          isValid: false,
          helperText: "La dirección de correo electrónico es obligatoria",
        };
      } else if (!mailformat.test(rowData.correo)) {
        return {
          isValid: false,
          helperText: "La direccion de correo es invalida",
        };
      } else {
        return true;
      }
    },
  },
  {
    title: "Sede",
    field: "sede",
    lookup: { 1: "Punto de Venta", 2: "Call Center", 4: "Administrativos" },
  },
  {
    title: "Cargo",
    field: "rol",
    lookup: {
      1: "Cajero Punto de Venta",
      2: "Domiciliario Interno",
      3: "Administrador",
      4: "Vendedor Call Center",
      5: "Domiciliario Externo",
      6: "Cajero Administrador",
      7: "Cajero Domicilios",
    },
  },
  {
    title: "Estado",
    field: "estado",
    lookup: { true: "Activo", false: "Inactivo" },
  },
];
