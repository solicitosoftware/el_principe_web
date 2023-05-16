import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import "../../css/general.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ContainerBase from "../dashboard/containerBase";
import { disenoToast } from "../dashboard/disenoToastBase";
import { colunm } from "./columsTable";
import {
  actualizarDeudaAsync,
  estadoProceso,
  initialDeudas,
  obtenerDeudaAsync,
  reiniciarEstados,
} from "../../redux/reducers/deudasReducer";
import { formatoFecha } from "../utils";
import MaterialTable from "@material-table/core";
import useUsuarioPermisos from "../utils/usuarioPermisos";

function Deudas() {
  const dispatch = useDispatch();

  const permisosRol = useUsuarioPermisos();

  const deudas = useSelector(initialDeudas);

  const estado = useSelector(estadoProceso);

  const [data, setData] = useState([]);

  useEffect(() => {
    if (!estado.isLoading) {
      if (estado.success) {
        toast.success(estado.success, disenoToast);
        dispatch(reiniciarEstados());
      } else if (estado.error) {
        toast.error(estado.error, disenoToast);
        dispatch(reiniciarEstados());
      }
    }
  }, [dispatch, estado]);

  useEffect(() => {
    dispatch(obtenerDeudaAsync());
  }, [dispatch]);

  const agruparDeudas = async () => {
    const values = deudas.map((item) => ({ ...item }));
    const group = values.reduce((result, item) => {
      item.fecha = formatoFecha(item.fecha);
      const id = item.domiciliario ? item.domiciliario.id : null;
      if (item.medioPago === "parcial") {
        item.total -= item.detallePago.transferencia;
      }
      if (item.domiciliario && item.domiciliario.rol === 5) {
        item.total -= item.cliente.barrio.valor;
      }
      item.deuda = item.total;
      result[id] = [...(result[id] || []), item];
      return result;
    }, {});

    return Object.values(group);
  };

  const cargarDeudas = (values) => {
    const newData = values.map((item, index) => {
      let deuda = 0;
      let registro = [];
      return (registro[index] = item.reduce((result, item) => {
        deuda += item.deuda;
        result.id = `${item.domiciliario ? item.domiciliario.id : undefined}`;
        result.nombre = `${
          item.domiciliario ? item.domiciliario.nombre : "- Pendiente -"
        }`;
        result.deudaTotal = deuda;
        return result;
      }, []));
    });

    const datosOrdenados = newData.sort((a, b) =>
      a.nombre.localeCompare(b.nombre)
    );

    setData([...datosOrdenados, ...deudas.filter((x) => x.domiciliario)]);
  };

  useEffect(async () => {
    if (deudas.length > 0) {
      const deudasDomiciliario = await agruparDeudas();
      cargarDeudas(deudasDomiciliario);
    }
  }, [deudas]);

  const pagoTotal = (value) => {
    value.tableData.childRows.map((x) => saldarDeuda(x.id));
  };

  const saldarDeuda = (id) => {
    dispatch(actualizarDeudaAsync(id));
  };

  const validarPermiso = (accion) => {
    const value =
      Object.values(permisosRol).length > 0 && permisosRol["deudas"]?.[accion];
    return value;
  };

  return (
    <ContainerBase componente="Deudas" loading={estado.isLoading}>
      <ToastContainer />
      <MaterialTable
        responsive={true}
        columns={colunm}
        data={data}
        title="DEUDAS"
        parentChildData={(row, rows) =>
          rows.find((a) => a.id === (row?.domiciliario?.id || undefined))
        }
        actions={[
          {
            icon: "refresh",
            tooltip: `Cargar Deudas`,
            isFreeAction: true,
            hidden: !validarPermiso("cargar"),
            onClick: () => dispatch(obtenerDeudaAsync()),
          },
          (rowData) =>
            validarPermiso("pagoTotal") && {
              hidden: !rowData.nombre || rowData.id === "undefined",
              icon: "payment",
              tooltip: "Pago total",
              onClick: () => pagoTotal(rowData),
            },
          (rowData) =>
            validarPermiso("abono") && {
              hidden: !rowData.cliente,
              icon: "paid",
              tooltip: "Abonar Pedido",
              onClick: () => saldarDeuda(rowData.id),
            },
        ]}
        options={{
          maxColumnSort: 1,
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
            },
            emptyDataSourceMessage: "No hay datos para mostrar",
          },
        }}
      />
    </ContainerBase>
  );
}

export default Deudas;
