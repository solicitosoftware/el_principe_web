import React, { useState, useEffect, useCallback, useRef } from "react";
import useSessionStorage from "../../utils/useSessionStorage";
import "moment/locale/es";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useColumsTable from "./columsTable";
import ContainerBase from "../../dashboard/containerBase";
import TableBase from "../../dashboard/tableBase";
import { useReactToPrint } from "react-to-print";
import { useDispatch, useSelector } from "react-redux";
import {
  initialProductos,
  estadoProceso as estadoProcesoProductos,
  obtenerProductoAsync,
} from "../../../redux/reducers/productosReducer";
import {
  actualizarEstadoPedidoAsync,
  actualizarPedidoAsync,
  cancelarPedidoAsync,
  estadoProceso,
  initialPedidos,
  obtenerPedidoAsync,
  reiniciarEstados,
} from "../../../redux/reducers/pedidosReducer";
import { disenoToast } from "../../dashboard/disenoToastBase";
import Messages from "../../utils/message";
import PedidoActual from "../../pedidos/pedidoActual";
import {
  Badge,
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";
import { formatoPrecio } from "../../utils";
import { productoInterno } from "../../dashboard/productoInterno";
import ProductoPedido from "../../pedidos/productoPedido";
import { ComponentToPrint } from "../../utils/print";
import {
  initialUsuarios,
  estadoProceso as estadoProcesoUsuario,
  obtenerUsuarioAsync,
} from "../../../redux/reducers/usuariosReducer";
import PagoParcial from "../../pedidos/pagoParcial";

const moment = require("moment");

//componente del historial de pedidos de la caja, tiene las mismas funciones que la vista domicilios
function HistorialPV() {
  const dispatch = useDispatch();

  const stringify = require("json-stable-stringify");

  const componentPrint = useRef();

  const initialLogin = {
    id: null,
    token: false,
    rol: 1,
    sede: null,
  };

  const [login] = useSessionStorage("login", initialLogin);

  const pedidos = useSelector(initialPedidos);

  const estado = useSelector(estadoProceso);

  const productos = useSelector(initialProductos);

  const estadoProductos = useSelector(estadoProcesoProductos);

  const usuario = useSelector(initialUsuarios);

  const estadoUsuario = useSelector(estadoProcesoUsuario);

  const [date, setDate] = useState(new Date());

  const [venta, setVenta] = useState({});

  const [actual, setActual] = useState([]);

  const { colunm } = useColumsTable();

  const [data, setData] = useState([]);

  const [pedidoEdit, setPedidoEdit] = useState({});

  const [modalComentario, setComentario] = useState(false);

  const [modal, setModal] = useState(false);

  const [total, setTotal] = useState(0);

  const [ipoconsumo, setIpoconsumo] = useState(0);

  const [modalPago, setPago] = useState(false);

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
    const newData = pedidos.filter((x) => !x.cliente);
    setData(newData);
  }, [pedidos]);

  useEffect(() => {
    if (Object.values(pedidoEdit).length > 0) {
      setActual([...pedidoEdit.productos]);
    }
  }, [pedidoEdit, setActual]);

  useEffect(() => {
    if (!estado.isLoading) {
      if (estado.success) {
        estado.success.indexOf("Exito, registro cancelado") === -1 &&
          Object.values(venta).length > 0 &&
          handlePrint();
        toast.success(estado.success, disenoToast);
        dispatch(reiniciarEstados());
        limpiarState();
      } else if (estado.error) {
        toast.error(estado.error, disenoToast);
        dispatch(reiniciarEstados());
      }
    }
  }, [dispatch, estado, venta]);

  const obtenerUsuario = useCallback(() => {
    if (Object.values(usuario).length === 0) {
      dispatch(obtenerUsuarioAsync(login.id));
    }
  }, [dispatch, usuario, login.id]);

  useEffect(() => {
    obtenerUsuario();
  }, [obtenerUsuario]);

  const cargarProductos = useCallback(() => {
    if (productos.length === 0) {
      dispatch(obtenerProductoAsync());
    }
  }, [dispatch, productos]);

  useEffect(() => {
    cargarProductos();
  }, [cargarProductos]);

  const calcularTotal = useCallback(() => {
    const suma =
      actual.length > 0 &&
      actual.reduce(
        (sum, value) =>
          typeof value.cantidad == "number"
            ? sum + value.cantidad * value.precio
            : sum,
        0
      );
    setTotal(suma);
  }, [actual]);

  const calcularIpoConsumo = useCallback(() => {
    const suma =
      actual.length > 0 &&
      actual.reduce(
        (sum, value) =>
          value.categoria.nombre === "Fritos" ||
          value.categoria.nombre === "Gaseosas"
            ? sum + value.cantidad * value.precio * 0.08
            : sum,
        0
      );
    setIpoconsumo(suma);
  }, [actual]);

  useEffect(() => {
    calcularTotal();
  }, [calcularTotal]);

  useEffect(() => {
    calcularIpoConsumo();
  }, [calcularIpoConsumo]);

  const ordenarProductos = useCallback((values) => {
    return values.sort((a, b) => a.orden - b.orden);
  }, []);

  //metodo para actualizar estados
  const actualizarEstado = (value) => {
    if (value.estado !== "Cancelado") {
      let estado = "Impreso";
      if (value.estado === estado || value.estado === "Reimpreso") {
        estado = "Reimpreso";
      }
      if (value.estado === "Entregado") {
        return handlePrint();
      }
      dispatch(actualizarEstadoPedidoAsync({ ...value, estado }));
    } else {
      toast.error("No es posible imprimir un pedido cancelado", disenoToast);
    }
  };

  const actualizarProductos = (detallePago) => {
    setPago(false);
    let medioPago = pedidoEdit.medioPago;
    const { efectivo, transferencia } = detallePago;
    if (efectivo === total) {
      medioPago = "efectivo";
    } else if (transferencia === total) {
      medioPago = "transferencia";
    } else {
      medioPago = "parcial";
    }
    const values = {
      ...pedidoEdit,
      ipoconsumo,
      total,
      medioPago,
      recibido: null,
      detallePago,
      usuario: usuario.nombre,
      productos: [...actual],
    };
    setVenta(values);
    dispatch(actualizarPedidoAsync(values));
  };

  //metodo para agregar un producto al pedido
  const agregarPedido = (value) => {
    let copia = [...actual];
    let index = copia.findIndex(
      (x) =>
        x.id === value.id && stringify(x.salsas) === stringify(value.salsas)
    );
    if (index !== -1) {
      copia[index].cantidad = copia[index].cantidad + 1;
    } else {
      copia.push(value);
    }

    setActual(copia);
  };

  //metodo para modificar el pedido
  const modificarPedido = (value, cantidad) => {
    let copia = [...actual];
    let index = copia.findIndex(
      (x) =>
        x.id === value.id && stringify(x.salsas) === stringify(value.salsas)
    );
    if (index !== -1) {
      copia[index].cantidad = cantidad;
    }

    setActual(copia);
  };

  //metodo para actualizar estados
  const cancelarPedido = (comentario) => {
    const datos = {
      ...pedidoEdit,
      comentario,
      estado: "Cancelado",
      total: 0,
      ipoconsumo: 0,
    };
    dispatch(cancelarPedidoAsync(datos));
  };
  const abrirModalPago = () => {
    setModal(false);
    setPago(true);
  };

  //Metodo para eliminar un producto del pedido
  const eliminarPedido = (value) => {
    let copia = [...actual];
    let index = copia.findIndex(
      (x) =>
        x.id === value.id && stringify(x.salsas) === stringify(value.salsas)
    );
    if (index !== -1) {
      if (copia.length > 1) {
        copia.splice(index, 1);
      } else {
        copia = [];
      }
    }

    setActual(copia);
  };

  const pedidoActual = (value, indice) => {
    const pedido = JSON.parse(JSON.stringify(value));
    switch (indice) {
      case "imprimir":
        setVenta(pedido);
        actualizarEstado(pedido);
        break;
      case "cancelar":
        setPedidoEdit(pedido);
        setComentario(true);
        break;
      case "actualizar":
        setPedidoEdit(pedido);
        setModal(true);
        break;
      default:
        break;
    }
  };

  const salsas = (producto) => {
    const { bbq, rosa, pina } = producto.salsas;
    var detalle = [];
    if (bbq) {
      detalle.push(" Bbq");
    }
    if (rosa) {
      detalle.push(" Rosada");
    }
    if (pina) {
      detalle.push(" Piña");
    }
    return [...detalle];
  };

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
            {item.categoria.salsas && (
              <text>{salsa.length > 0 ? `Salsas:${salsa}` : "Sin salsas"}</text>
            )}
            <text>Pedido: {formatoPrecio(total)}</text>
          </div>
        </div>
      );
    });
    return detalle;
  };

  const limpiarState = () => {
    setModal(false);
    setPedidoEdit({});
    setActual([]);
    setTotal(0);
    setIpoconsumo(0);
    setComentario(false);
  };

  return (
    <ContainerBase
      componente="Historial Punto Venta"
      loading={
        estado.isLoading || estadoProductos.isLoading || estadoUsuario.isLoading
      }
      date={date}
      handleDate={(value) => setDate(value)}
    >
      <ToastContainer />
      <div className="hidden">
        <ComponentToPrint ref={componentPrint} data={venta} />
      </div>
      <Messages
        abrir={modalComentario}
        title="Motivo de Cancelación"
        mensaje={"Agregue un comentario"}
        comentario={true}
        confirmar={true}
        procesar={cancelarPedido}
        cerrar={() => setComentario(false)}
      />
      {modal ? (
        <Modal
          scrollable
          className="flex items-center"
          style={{ height: "90vh" }}
          isOpen={modal}
          size="lg"
        >
          <ModalHeader className="modal-header">Modificar Pedido</ModalHeader>
          <ModalBody>
            <div className="flex flex-row justify-center h-96">
              <div className="flex overflow-auto flex-wrap w-1/2 mr-3">
                {ordenarProductos([
                  ...productos.filter((x) => x.estado === true),
                  productoInterno,
                ]).map((value, index) => {
                  return (
                    <ProductoPedido
                      key={"Producto_" + index}
                      producto={value}
                      editar={true}
                      guardar={agregarPedido}
                    />
                  );
                })}
              </div>
              <div className="flex flex-col w-1/2">
                <div className="div-pedido-lista">
                  {ordenarProductos(actual).map((value, index) => {
                    return (
                      <PedidoActual
                        key={index}
                        producto={value}
                        eliminar={eliminarPedido}
                        modificarCantidad={modificarPedido}
                      />
                    );
                  })}
                </div>
                <div className="flex flex-row justify-between items-center pt-2 pb-2 pr-3 pl-3 bg-yellow-500">
                  <text className="text-lg font-semibold text-white">
                    TOTAL:
                  </text>
                  <text className="text-lg font-semibold text-white">
                    {formatoPrecio(total)}
                  </text>
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <div className="modal-boton">
              <Button onClick={limpiarState}>Cerrar</Button>
              <Button
                onClick={abrirModalPago}
                disabled={actual.length > 0 ? false : true}
                color="success"
              >
                Actualizar
              </Button>
            </div>
          </ModalFooter>
        </Modal>
      ) : (
        <TableBase
          componente="Historial Punto Venta"
          datos={data}
          columnas={colunm}
          obtener={() => cargarPedidos()}
          editar={(oldData) => pedidoActual(oldData, "actualizar")}
          actualizar={(newData) => dispatch(actualizarPedidoAsync(newData))}
          eliminar={(oldData) => pedidoActual(oldData, "cancelar")}
          imprimir={(oldData) => pedidoActual(oldData, "imprimir")}
          detailPanel={detallePedido}
        />
      )}
      <PagoParcial
        modal={modalPago}
        total={total}
        medioPago={pedidoEdit.medioPago}
        guardar={actualizarProductos}
        detallePago={pedidoEdit.detallePago}
      />
    </ContainerBase>
  );
}
export default HistorialPV;
