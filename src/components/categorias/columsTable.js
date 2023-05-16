export const colunm = [
  {
    title: "Nombre Categoría",
    field: "nombre",
    defaultSort: "asc",
    validate: (rowData) => {
      if (rowData.nombre === "") {
        return {
          isValid: false,
          helperText: "El nombre de la categoria es obligatorio",
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
    title: "Descripción",
    field: "descripcion",
    fixedColWidth: 100,
    validate: (rowData) => {
      if (rowData.descripcion === "") {
        return {
          isValid: false,
          helperText: "La descripción de la categoria es obligatoria",
        };
      } else if (rowData.descripcion.length < 6) {
        return {
          isValid: false,
          helperText: "La descripción debe ser mas larga",
        };
      } else {
        return true;
      }
    },
  },
  {
    title: "Maneja Salsas",
    field: "salsas",
    lookup: { true: "Si", false: "No" },
  },
];
