import React from "react";
import PropTypes from "prop-types";
import MaterialTable from "@material-table/core";
import "../../css/general.css";

function TableBase({
  componente,
  columnas,
  datos,
  obtener,
  detalle,
  loading,
  exportModal,
  exportPdf,
  exportCsv,
}) {
  return (
    <MaterialTable
      isLoading={loading}
      responsive={true}
      columns={columnas}
      data={datos}
      title={componente.toUpperCase()}
      parentChildData={(row, rows) => rows.find((a) => a.id === row.parentId)}
      actions={[
        {
          icon: "refresh",
          tooltip: `Cargar ${componente}`,
          isFreeAction: true,
          onClick: () => obtener(),
        },
        {
          icon: "download Reporte",
          tooltip: "Descargar",
          isFreeAction: true,
          onClick: () => exportModal("Descarga"),
        },
        {
          icon: "print",
          tooltip: "Boleta",
          isFreeAction: true,
          onClick: () => exportModal("Boleta"),
        },
        (rowData) =>
          rowData.productos && {
            icon: "visibility",
            tooltip: "Ver Detalle",
            onClick: () => detalle(rowData),
          },
        (rowData) =>
          !rowData.productos && {
            icon: "picture_as_pdf",
            tooltip: "PDF",
            onClick: () =>
              exportPdf(
                rowData.id === "Domicilios"
                  ? datos.filter((x) => x.cliente)
                  : datos.filter((x) => !x.cliente && x.productos)
              ),
          },
        (rowData) =>
          !rowData.productos && {
            icon: "difference",
            tooltip: "Excel",
            onClick: () =>
              exportCsv(
                rowData.id === "Domicilios"
                  ? datos.filter((x) => x.cliente)
                  : datos.filter((x) => !x.cliente && x.productos)
              ),
          },
      ]}
      options={{
        sorting: true,
        maxColumnSort: 2,
        pageSizeOptions: [5, 10, 20, 50],
        actionsColumnIndex: -1,
        minBodyHeight: 260,
        headerStyle: {
          backgroundColor: "#FFF1E0",
          color: "#ff9100",
          fontSize: 16,
        },
      }}
      localization={{
        header: {
          actions: "Acciones",
        },
        toolbar: {
          searchPlaceholder: "Buscar",
          searchTooltip: "Buscar",
        },
        pagination: {
          labelDisplayedRows: "{from}-{to} de {count}",
          labelRowsSelect: "Registros",
          firstTooltip: "Ir al inicio",
          lastTooltip: "Ir al final",
          nextTooltip: "Página siguiente",
          previousTooltip: "Página anterior",
        },
        body: {
          editRow: {
            saveTooltip: "Guardar",
            cancelTooltip: "Cancelar",
            deleteText: "¿Desea eliminar el registro?",
          },
          emptyDataSourceMessage: "No hay datos para mostrar",
          deleteTooltip: "Eliminar",
          editTooltip: "Editar",
        },
      }}
    />
  );
}

TableBase.propTypes = {
  componente: PropTypes.string.isRequired,
  columnas: PropTypes.array.isRequired,
  datos: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
};

TableBase.defaultProps = {
  datos: [],
  loading: false,
};

export default TableBase;
