import React, { useState, useEffect, useCallback, useContext } from "react";
import { Modal } from "reactstrap";
import MaterialTable from "material-table";
import "../../../css/general.css";
import { IoSend } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import "moment/locale/es";
import {
  agregarPedidos,
  initialApp,
} from "../../../redux/reducers/pedidosAppReducer";
import {
  initialBarrios,
  obtenerBarrioAsync,
  estadoProceso as estadoProcesoBarrios,
} from "../../../redux/reducers/barriosReducer";
import { useSelector, useDispatch } from "react-redux";
import { FirebaseContext } from "../../../firebase";
import { formatoPrecio } from "../../utils";

//componente del buscador de clientes
function Buscador({
  abrir,
  cargando,
  clientes,
  obtener,
  seleccionar,
  crear,
  actualizar,
}) {
  const { firebase } = useContext(FirebaseContext);

  const dispatch = useDispatch();

  const navigate = useNavigate();

  const pedidosApp = useSelector(initialApp);

  const barrios = useSelector(initialBarrios);

  const estadoBarrios = useSelector(estadoProcesoBarrios);

  const [modal, setModal] = useState(abrir);

  const [colunm, setColunm] = useState([]);

  const moment = require("moment");

  useEffect(() => {
    setColunm([
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
        title: "Municipio Barrio",
        field: "barrio.id",
        lookup: lookupBarrio(),
        cellStyle: { width: "20%" },
      },
      {
        title: "Punto Referencia",
        field: "puntoRef",
        cellStyle: { width: "20%" },
      },
      {
        title: "Valor Domicilio",
        field: "barrio?.id",
        render: (rowData) => calcularValor(rowData),
        cellStyle: { width: "10%" },
      },
    ]);
  }, [clientes, barrios]);

  const mostrarModal = useCallback(() => {
    setModal(abrir);
  }, [abrir]);

  useEffect(() => {
    mostrarModal();
  }, [mostrarModal]);

  const cargarBarrios = useCallback(() => {
    if (barrios.length === 0) {
      dispatch(obtenerBarrioAsync());
    }
  }, [dispatch, barrios]);

  useEffect(() => {
    cargarBarrios();
  }, [cargarBarrios]);

  const manejarSnapshotPedidosApp = useCallback(
    (values) => {
      const pedidos = values.docs.map((doc) => {
        return {
          id: doc.id,
          ...doc.data(),
        };
      });
      dispatch(agregarPedidos(pedidos));
    },
    [dispatch]
  );

  const obtenerPedidosApp = useCallback(() => {
    const startOfToday = moment(new Date()).startOf("day").toDate();

    firebase.db
      .collection("pedidos")
      .where("fecha", ">=", startOfToday)
      .where("estado", "==", "Pendiente aprobar")
      .onSnapshot(manejarSnapshotPedidosApp);
  }, [manejarSnapshotPedidosApp, firebase]);

  useEffect(() => {
    obtenerPedidosApp();
  }, [obtenerPedidosApp]);

  //Metodo para calcular el nombre del barrio
  const lookupBarrio = () => {
    const lookup = {};
    barrios.forEach((element) => {
      lookup[element.id] = `${element.municipio.nombre} (${element.nombre})`;
    });
    return lookup;
  };

  //Metodo para calcular el nombre del barrio
  const calcularValor = (values) => {
    const { barrio } = values;
    const data = barrios && barrio && barrios.find((x) => x.id === barrio?.id);
    return formatoPrecio(data?.valor);
  };

  //Metodo para mostrar las direcciones de los clientes
  const direccionesCliente = (value) => {
    let data = [];
    for (let index = 2; index <= 4; index++) {
      data.push({
        direccion: value["direccion" + index],
        barrio: barrios.find((x) => x.id === value["barrio" + index].id),
        puntoRef: value["puntoRef" + index],
      });
    }
    const detalle = data.map((item) => {
      const validarCampos = (element, index) =>
        (element === "" || element === undefined) && index !== 2;
      return (
        !Object.values(item).some(validarCampos) && (
          <div className="flex p-1 justify-end bg-gray-600 text-white border-b-2">
            <div className="flex w-2/3 justify-between mr-15">
              <text className="w-4/5 text-base">
                {`${item.direccion} `}
                {`${item.barrio.municipio.nombre} - ${item.barrio.nombre}`}
                {item.puntoRef && ` (${item.puntoRef})`}
                {` ${formatoPrecio(item.barrio.valor)}`}
              </text>
              <div className="w-1/5 self-center cursor-pointer">
                <IoSend onClick={() => seleccionar(value, item)} size={20} />
              </div>
            </div>
          </div>
        )
      );
    });
    return detalle;
  };

  return (
    <Modal className="flex items-center h-screen" size="xl" isOpen={modal}>
      <MaterialTable
        isLoading={cargando || estadoBarrios.isLoading}
        responsive={true}
        columns={colunm}
        data={clientes}
        title={"CLIENTES"}
        detailPanel={direccionesCliente}
        options={{
          detailPanelType: "single",
          sorting: true,
          maxBodyHeight: 400,
          actionsColumnIndex: -1,
          headerStyle: {
            backgroundColor: "#FFF1E0",
            color: "#ff9100",
            fontSize: 16,
          },
        }}
        actions={[
          {
            icon: "send",
            tooltip: "Seleccionar",
            onClick: (event, rowData) =>
              seleccionar(rowData, {
                direccion: rowData.direccion,
                barrio: barrios.find((x) => x.id === rowData.barrio.id),
                puntoRef: rowData.puntoRef,
              }),
          },
          {
            icon: "edit",
            tooltip: "Actualizar",
            onClick: (event, rowData) => actualizar(rowData),
          },
          {
            icon: "refresh",
            tooltip: `Cargar Clientes`,
            isFreeAction: true,
            onClick: () => obtener(),
          },
          {
            icon: "add_box",
            tooltip: "Agregar Usuario",
            isFreeAction: true,
            onClick: () => crear(),
          },
          {
            icon: "notifications_active",
            tooltip: "Pedidos",
            isFreeAction: true,
            hidden: !pedidosApp.length > 0,
            iconProps: { style: { color: "red" } },
            onClick: () => navigate("/domicilios", { state: { notify: true } }),
          },
          {
            icon: "home",
            tooltip: "Inicio",
            isFreeAction: true,
            onClick: () => navigate("/inicio"),
          },
        ]}
        localization={{
          header: {
            actions: "",
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
            emptyDataSourceMessage: "No hay datos para mostrar",
          },
        }}
      />
    </Modal>
  );
}

export default Buscador;
