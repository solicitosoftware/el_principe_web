import React from "react";
import PropTypes from "prop-types";
import MaterialTable from "@material-table/core";
import "../../css/general.css";
import useUsuarioPermisos from "../utils/usuarioPermisos";

function TableBase({
  componente,
  columnas,
  datos,
  obtener,
  actualizar,
  eliminar,
  editar,
  entregar,
  imprimir,
  historial,
  detailPanel,
  loading,
}) {
  const permisosRol = useUsuarioPermisos();

  const validarPermiso = (accion) => {
    const myComponent = !componente.includes("Punto Venta")
      ? `${componente.replace(" ", "").toLowerCase()}`
      : `${componente.replace(" ", "").replace(" ", "").toLowerCase()}`;
    const value =
      Object.values(permisosRol).length > 0 &&
      permisosRol[myComponent]?.[accion];
    return value;
  };

  return (
    Object.values(permisosRol).length > 0 && (
      <MaterialTable
        isLoading={loading}
        responsive={true}
        columns={columnas}
        data={datos}
        title={componente.toUpperCase()}
        detailPanel={[
          {
            disabled: !detailPanel,
            render: ({ rowData }) => detailPanel(rowData),
          },
        ]}
        actions={[
          {
            icon: "refresh",
            tooltip: `Cargar ${componente}`,
            isFreeAction: true,
            hidden: !validarPermiso("cargar"),
            onClick: () => obtener(),
          },
          {
            icon: "print",
            tooltip: `Imprimir ${componente}`,
            isFreeAction: true,
            hidden: !validarPermiso("boleta"),
            onClick: () => imprimir(),
          },
          {
            icon: "print",
            tooltip: "Imprimir",
            hidden: !validarPermiso("imprimir"),
            onClick: async (event, rowData) => imprimir(rowData),
          },
          (rowData) => ({
            icon: "app_registration_icon",
            tooltip: "Modificar Pedido",
            hidden: !validarPermiso("modificar"),
            disabled:
              rowData.estado === "Cancelado" || rowData.estado === "Entregado",
            onClick: (event, rowData) =>
              rowData.estado !== "Cancelado" && editar(rowData),
          }),
          (rowData) => ({
            icon: "history",
            tooltip: "Historial Productos",
            hidden: !validarPermiso("historial"),
            disabled:
              rowData.estado === "Cancelado" ||
              rowData.estado === "Entregado" ||
              !rowData?.historial,
            onClick: (event, rowData) =>
              rowData.estado !== "Cancelado" && historial(rowData),
          }),
          (rowData) => ({
            icon: "notifications",
            tooltip: "Pedido Entregado",
            hidden: !validarPermiso("entregar"),
            disabled: rowData.estado !== "Despachado",
            onClick: (event, rowData) =>
              rowData.estado !== "Cancelado" && entregar(rowData),
          }),
          (rowData) => ({
            icon: "edit",
            tooltip: "Editar",
            hidden: !validarPermiso("editarModal"),
            disabled:
              rowData.estado === "Cancelado" || rowData.estado === "Entregado",
            onClick: (event, rowData) =>
              rowData.estado !== "Cancelado" && editar(rowData),
          }),
        ]}
        editable={{
          isDeletable: (rowData) => {
            if (permisosRol?.domicilios || permisosRol?.historial) {
              return (
                rowData.estado !== "Cancelado" && rowData.estado !== "Entregado"
              );
            }
            return true;
          },
          isEditable: (rowData) => {
            if (permisosRol?.domicilios || permisosRol?.historial) {
              return (
                rowData.estado !== "Cancelado" && rowData.estado !== "Entregado"
              );
            }
            return true;
          },
          isEditHidden: () => !validarPermiso("editar"),
          isDeleteHidden: () => !validarPermiso("eliminar"),
          onRowUpdate: (newData, oldData) =>
            new Promise((resolve) => {
              setTimeout(() => {
                actualizar(newData, oldData);
                resolve();
              }, 1000);
            }),
          onRowDelete: (oldData) =>
            new Promise((resolve) => {
              eliminar(oldData);
              resolve();
            }),
        }}
        options={{
          sorting: true,
          maxColumnSort: 2,
          pageSizeOptions: [5, 10, 20, 50],
          actionsColumnIndex: -1,
          minBodyHeight: 360,
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
    )
  );
}

TableBase.propTypes = {
  componente: PropTypes.string.isRequired,
  columnas: PropTypes.array.isRequired,
  detailPanel: PropTypes.bool.isRequired,
  datos: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
};

TableBase.defaultProps = {
  detailPanel: false,
  datos: [],
  loading: false,
};

export default TableBase;
