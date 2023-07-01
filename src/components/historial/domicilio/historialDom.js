import React, { useState, useEffect, useCallback, useRef } from "react";
import "moment/locale/es";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useColumsTable from "./columsTable";
import ContainerBase from "../../dashboard/containerBase";
import TableBase from "../../dashboard/tableBase";
import { useReactToPrint } from "react-to-print";
import { useDispatch, useSelector } from "react-redux";
import {
  estadoProceso,
  initialPedidos,
  obtenerPedidoAsync,
} from "../../../redux/reducers/pedidosReducer";
import { disenoToast } from "../../dashboard/disenoToastBase";
import { Badge } from "reactstrap";
import { formatoPrecio, salsas } from "../../utils";
import { ComponentToPrint } from "../../utils/print";

const moment = require("moment");

//componente del historial de pedidos de la caja, tiene las mismas funciones que la vista domicilios
function HistorialDom() {
  const dispatch = useDispatch();

  const componentPrint = useRef();

  const pedidos = useSelector(initialPedidos);

  const estado = useSelector(estadoProceso);

  const [date, setDate] = useState(new Date());

  const [venta, setVenta] = useState({});

  const { colunm } = useColumsTable();

  const [data, setData] = useState([]);

  //Metodo para imprimir
  const handlePrint = useReactToPrint({
    content: () => componentPrint.current,
  });

  const cargarPedidos = useCallback(() => {
    const startOfToday = moment(date).startOf("day");
    const endOfToday = moment(date).endOf("day");
    dispatch(obtenerPedidoAsync({ startOfToday, endOfToday }));
  }, [dispatch, date]);

  useEffect(() => {
    cargarPedidos();
  }, [cargarPedidos]);

  useEffect(() => {
    const newData = pedidos.filter((x) => x.cliente);
    setData(newData);
  }, [pedidos]);

  const validarEstado = useCallback(() => {
    if (venta.estado === "Cancelado") {
      return toast.error(
        "No es posible imprimir un pedido cancelado",
        disenoToast
      );
    }
    Object.values(venta).length > 0 && handlePrint();
  }, [venta]);

  useEffect(() => {
    validarEstado();
  }, [validarEstado]);

  //metodo para cargar detalle del pedido
  const detallePedido = (value) => {
    var detalle = value.productos.map((item) => {
      const total = item.cantidad * item.precio;
      const salsa = salsas(item);
      return (
        <div className="flex p-3 justify-end bg-gray-600 text-white">
          <div className="flex w-1/2 justify-between mr-24">
            <text className="w-1/3">
              {item.nombre}{" "}
              <Badge color="success" pill>
                x{item.cantidad}
              </Badge>
            </text>
            <text>{salsa.length > 0 ? `Salsas:${salsa}` : "Sin salsas"}</text>
            <text>Pedido: {formatoPrecio(total)}</text>
          </div>
        </div>
      );
    });
    return detalle;
  };

  return (
    <ContainerBase
      componente="Historial Domicilios"
      loading={estado.isLoading}
      date={date}
      handleDate={(value) => setDate(value)}
    >
      <ToastContainer />
      <div className="hidden">
        <ComponentToPrint ref={componentPrint} data={venta} />
      </div>
      <TableBase
        componente="Historial Domicilios"
        datos={data}
        columnas={colunm}
        obtener={() => cargarPedidos()}
        imprimir={(oldData) => setVenta(oldData)}
        detailPanel={detallePedido}
      />
    </ContainerBase>
  );
}
export default HistorialDom;
