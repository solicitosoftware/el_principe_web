import React, { useState, useEffect, useRef, useCallback } from "react";
import PropTypes from "prop-types";
import useSessionStorage from "../utils/useSessionStorage";
import "../../css/general.css";
import { formatoPrecio } from "../utils";
import {
  Button,
  ButtonGroup,
  Modal,
  ModalBody,
  Input,
  ModalFooter,
} from "reactstrap";
import { Link } from "react-router-dom";
import home from "../../images/iconos/inc-home.png";
import { useReactToPrint } from "react-to-print";
import { ComponentToPrint } from "../utils/print";
import Messages from "../utils/message";
import { FaEquals } from "react-icons/fa";
import { RiDeleteBack2Fill } from "react-icons/ri";
import { BsClockHistory } from "react-icons/bs";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PedidoActual from "../pedidos/pedidoActual";
import ProductoPedido from "../pedidos/productoPedido";
import {
  initialUsuarios,
  estadoProceso as estadoProcesoUsuario,
  obtenerUsuarioAsync,
} from "../../redux/reducers/usuariosReducer";
import Spinner from "../utils/spinner";
import { useDispatch, useSelector } from "react-redux";
import { disenoToast } from "./disenoToastBase";
import "moment/locale/es";
import {
  initialProductos,
  estadoProceso as estadoProcesoProductos,
  obtenerProductoAsync,
} from "../../redux/reducers/productosReducer";
import {
  initialUtils,
  estadoProceso as estadoProcesoTurno,
  obtenerTurnoCajaAsync,
  obtenerTurnoDomicilioAsync,
} from "../../redux/reducers/utilsReducer";
import {
  crearPedidoAsync,
  estadoProceso,
  reiniciarEstados,
} from "../../redux/reducers/pedidosReducer";
import { productoInterno } from "./productoInterno";
import PagoParcial from "../pedidos/pagoParcial";
import useUsuarioPermisos from "../utils/usuarioPermisos";

const moment = require("moment");

function CajaBase({ imprimir, domicilio, reiniciar, children }) {
  const stringify = require("json-stable-stringify");

  const dispatch = useDispatch();

  const usuario = useSelector(initialUsuarios);

  const productos = useSelector(initialProductos);

  const estado = useSelector(estadoProceso);

  const estadoUsuario = useSelector(estadoProcesoUsuario);

  const estadoProductos = useSelector(estadoProcesoProductos);

  const estadoTurno = useSelector(estadoProcesoTurno);

  const utils = useSelector(initialUtils);

  const initialLogin = {
    id: null,
    token: false,
    rol: 1,
    sede: null,
  };

  const [login] = useSessionStorage("login", initialLogin);

  const [actual, setActual] = useState([]);

  const [total, setTotal] = useState(0);

  const [detallePago, setDetallePago] = useState({});

  const [recibido, setRecibido] = useState("");

  const [ipoconsumo, setIpoconsumo] = useState(0);

  const [medioPago, setMedioPago] = useState("efectivo");

  const [modalComentario, setComentario] = useState(false);

  const [modalCalculadora, setCalculadora] = useState(false);

  const [modalpago, setPago] = useState(false);

  const [venta, setVenta] = useState([]);

  const componentPrint = useRef();

  const permisosRol = useUsuarioPermisos();

  //Metodo para imprimir
  const handlePrint = useReactToPrint({
    content: () => componentPrint.current,
  });

  useEffect(() => {
    if (!estado.isLoading) {
      if (estado.success) {
        imprimir && handlePrint();
        toast.success(estado.success, disenoToast);
        limpiarState();
      } else if (estado.error) {
        toast.error(estado.error, disenoToast);
        limpiarState();
      }
    }
  }, [dispatch, estado]);

  const obtenerUsuario = useCallback(() => {
    if (Object.values(usuario).length === 0) {
      dispatch(obtenerUsuarioAsync(login.id));
    }
  }, [dispatch, usuario, login.id]);

  const cargarProductos = useCallback(() => {
    if (productos.length === 0) {
      dispatch(obtenerProductoAsync());
    }
  }, [dispatch, productos]);

  const calcularTotal = useCallback(() => {
    let suma =
      actual.length > 0 &&
      actual.reduce(
        (sum, value) =>
          typeof value.cantidad == "number"
            ? sum + value.cantidad * value.precio
            : sum,
        0
      );
    if (Object.values(domicilio).length > 0) {
      suma += domicilio.barrio.valor;
    }

    setTotal(suma);
  }, [actual, domicilio]);

  const calcularIpoConsumo = useCallback(() => {
    let suma =
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
    obtenerUsuario();
  }, [obtenerUsuario]);

  useEffect(() => {
    cargarProductos();
  }, [cargarProductos]);

  useEffect(() => {
    calcularTotal();
  }, [calcularTotal]);

  useEffect(() => {
    calcularIpoConsumo();
  }, [calcularIpoConsumo]);

  useEffect(() => {
    const { turno, turnoDomicilio } = utils;
    if (Object.values(venta).length > 0) {
      if (turno) {
        setVenta((data) => ({ ...data, turno }));
        dispatch(crearPedidoAsync({ ...venta, turno }));
      }
      if (turnoDomicilio) {
        setVenta((data) => ({ ...data, turnoDomicilio }));
        dispatch(crearPedidoAsync({ ...venta, turnoDomicilio, deuda: true }));
      }
    }
  }, [utils]);

  const ordenarProductos = useCallback((values) => {
    return values.sort((a, b) => a.orden - b.orden);
  }, []);

  //Metodo para guardar un pedido
  const guardarPedido = (observaciones) => {
    const endOfToday = moment(new Date()).endOf("day");
    let values = {
      ipoconsumo,
      medioPago,
      observaciones,
      sede: usuario.sede,
      total,
      detallePago,
      usuario: usuario.nombre,
      productos: [...actual],
      estado: imprimir ? "Impreso" : "Pendiente",
    };
    if (Object.values(domicilio).length > 0) {
      dispatch(obtenerTurnoDomicilioAsync(endOfToday));
      const { id, nombre, direccion, barrio, puntoRef, telefono, telefono2 } =
        domicilio;
      values.cliente = {
        id,
        nombre,
        direccion,
        puntoRef,
        barrio,
        telefono: parseInt(telefono),
        telefono2: telefono2 ? parseInt(telefono2) : null,
      };
    } else {
      const validate = actual.every((x) => x.categoria.nombre === "Crudos");
      if (validate) {
        dispatch(
          crearPedidoAsync({
            ...values,
            recibido: recibido ? parseInt(recibido) : null,
          })
        );
      } else {
        dispatch(obtenerTurnoCajaAsync(endOfToday));
      }
    }
    setVenta({ ...values, recibido: recibido ? parseInt(recibido) : null });
  };

  //metodo para volver las variables a sus estados iniciales
  const limpiarState = () => {
    if (Object.values(domicilio).length > 0) {
      reiniciar();
    }
    setActual([]);
    setVenta([]);
    setTotal(0);
    setDetallePago({});
    setIpoconsumo(0);
    setRecibido("");
    setMedioPago("efectivo");
    setComentario(false);
    setCalculadora(false);
    setPago(false);
    dispatch(reiniciarEstados());
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

  //Metodo para calcular el valor a devolver
  const handleCalcular = () => {
    if (recibido && parseInt(recibido) >= detallePago.efectivo) {
      setCalculadora(false);
      setComentario(true);
    }
  };

  const handleBorrar = () => {
    if (recibido.length === 1) {
      setRecibido("");
    } else {
      setRecibido(recibido.slice(0, recibido.length - 1));
    }
  };

  const handlePagoParcial = (values) => {
    const { efectivo, transferencia } = values;
    setDetallePago(values);
    setPago(false);
    if (efectivo === total) {
      setMedioPago("efectivo");
    } else if (transferencia === total) {
      setMedioPago("transferencia");
    } else {
      setMedioPago("parcial");
    }
    efectivo > 0 && Object.values(domicilio).length === 0
      ? setCalculadora(true)
      : setComentario(true);
  };

  return (
    <div className="contain pedidos">
      {estado.isLoading ||
      estadoUsuario.isLoading ||
      estadoProductos.isLoading ||
      estadoTurno.isLoading ? (
        <Spinner />
      ) : (
        <div className="min-h-screen flex flex-row">
          {/* productos activos */}
          <div className="div-pedido-productos">
            <div className="flex flex-row mb-4">
              <div className="div-btn-inicio-ped">
                <Link to="/inicio">
                  <img className="img-inicio" src={home} alt="inicio" />
                </Link>
              </div>
              <ToastContainer />
              <text className="txt-titulo font-bold text-center text-white">
                {Object.values(domicilio).length === 0
                  ? "PUNTO DE VENTA"
                  : "DOMICILIOS"}
              </text>
              {permisosRol?.historialpuntoventa && (
                <div className="div-btn-domicilios">
                  <Link to="/historialPuntoVenta">
                    <Button size="sm" className="mr-3" color={"info"}>
                      <div className="flex flex-row items-center">
                        <BsClockHistory />
                        <text className="ml-2">Historial</text>
                      </div>
                    </Button>
                  </Link>
                </div>
              )}
            </div>
            <div className="text-center flex flex-col">
              <div className="lista-productos">
                {ordenarProductos([
                  ...productos.filter((x) => x.estado === true),
                  productoInterno,
                ]).map((value, index) => {
                  return (
                    <ProductoPedido
                      key={"Producto_" + index}
                      producto={value}
                      guardar={agregarPedido}
                    />
                  );
                })}
              </div>
            </div>
          </div>
          {/* pedido actual */}
          <div className="div-pedido-actual">
            <text className="text-xl p-2 bg-yellow-500 text-white text-center">
              PEDIDO ACTUAL
            </text>
            <text className="p-2 bg-white text-gray-700 text-xs text-center">
              Vendedor: {usuario.nombre}
            </text>
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
            <div>
              <Input
                type="select"
                id="medioPago"
                value={medioPago}
                onChange={(e) => setMedioPago(e.target.value)}
              >
                <option value="efectivo">EFECTIVO</option>
                <option value="transferencia">TRANSFERENCIA</option>
              </Input>
            </div>
            <div className="flex flex-row justify-between items-center pt-2 pb-2 pr-3 pl-3 bg-yellow-500">
              <text className="text-lg font-semibold text-white">TOTAL:</text>
              <text className="text-lg font-semibold text-white">
                {formatoPrecio(total)}
              </text>
            </div>
            <ButtonGroup>
              <Button onClick={limpiarState} color="danger">
                {" "}
                Cancelar Pedido
              </Button>
              <Button
                onClick={() => setPago(true)}
                disabled={actual.length > 0 ? false : true}
                color="success"
              >
                Confirmar Pedido
              </Button>
            </ButtonGroup>
          </div>
          <div className="hidden">
            <ComponentToPrint ref={componentPrint} data={venta} />
          </div>
          <Messages
            abrir={modalComentario}
            title="Comentarios del Pedido"
            mensaje={"Agregue un comentario"}
            comentario={true}
            confirmar={true}
            procesar={guardarPedido}
            cerrar={() => setComentario(false)}
          />
        </div>
      )}
      {/* Modal calculadora */}
      <Modal
        className="flex items-center h-screen"
        isOpen={modalCalculadora}
        size="sm"
      >
        <ModalBody>
          <Input
            size="lg"
            placeholder="Valor Recibido"
            className="mb-3"
            disabled
            type="text"
            value={formatoPrecio(recibido)}
          />
          <table className="flex justify-center">
            <tbody>
              <tr>
                <td>
                  <Button
                    onClick={() => setRecibido(recibido + "1")}
                    color="info"
                    style={{ fontSize: 30 }}
                    className="w-20 h-20"
                  >
                    1
                  </Button>
                </td>
                <td>
                  <Button
                    onClick={() => setRecibido(recibido + "2")}
                    color="info"
                    style={{ fontSize: 30 }}
                    className="w-20 h-20"
                  >
                    2
                  </Button>
                </td>
                <td>
                  <Button
                    onClick={() => setRecibido(recibido + "3")}
                    color="info"
                    style={{ fontSize: 30 }}
                    className="w-20 h-20"
                  >
                    3
                  </Button>
                </td>
              </tr>
              <tr>
                <td>
                  <Button
                    onClick={() => setRecibido(recibido + "4")}
                    color="info"
                    style={{ fontSize: 30 }}
                    className="w-20 h-20"
                  >
                    4
                  </Button>
                </td>
                <td>
                  <Button
                    onClick={() => setRecibido(recibido + "5")}
                    color="info"
                    style={{ fontSize: 30 }}
                    className="w-20 h-20"
                  >
                    5
                  </Button>
                </td>
                <td>
                  <Button
                    onClick={() => setRecibido(recibido + "6")}
                    color="info"
                    style={{ fontSize: 30 }}
                    className="w-20 h-20"
                  >
                    6
                  </Button>
                </td>
              </tr>
              <tr>
                <td>
                  <Button
                    onClick={() => setRecibido(recibido + "7")}
                    color="info"
                    style={{ fontSize: 30 }}
                    className="w-20 h-20"
                  >
                    7
                  </Button>
                </td>
                <td>
                  <Button
                    onClick={() => setRecibido(recibido + "8")}
                    color="info"
                    style={{ fontSize: 30 }}
                    className="w-20 h-20"
                  >
                    8
                  </Button>
                </td>
                <td>
                  <Button
                    onClick={() => setRecibido(recibido + "9")}
                    color="info"
                    style={{ fontSize: 30 }}
                    className="w-20 h-20"
                  >
                    9
                  </Button>
                </td>
              </tr>
              <tr>
                <td>
                  <Button
                    onClick={() => handleBorrar()}
                    color="info"
                    style={{ fontSize: 25 }}
                    className="w-20 h-20"
                  >
                    <RiDeleteBack2Fill className="ml-3" />
                  </Button>
                </td>
                <td>
                  <Button
                    onClick={() => setRecibido(recibido + "0")}
                    color="info"
                    style={{ fontSize: 30 }}
                    className="w-20 h-20"
                  >
                    0
                  </Button>
                </td>
                <td>
                  <Button
                    disabled={recibido < detallePago.efectivo}
                    onClick={() => handleCalcular()}
                    color="info"
                    style={{ fontSize: 25 }}
                    className="w-20 h-20"
                  >
                    <FaEquals className="ml-3" />
                  </Button>
                </td>
              </tr>
            </tbody>
          </table>
        </ModalBody>
        <ModalFooter>
          <div className="modal-boton">
            <Button
              onClick={() => {
                setRecibido("");
                setCalculadora(false);
                setComentario(true);
              }}
            >
              Cerrar
            </Button>
          </div>
        </ModalFooter>
      </Modal>

      {/* Modal Pago Parcial */}
      <PagoParcial
        modal={modalpago}
        total={total}
        medioPago={medioPago}
        guardar={handlePagoParcial}
      />
      {children}
    </div>
  );
}

CajaBase.propTypes = {
  cliente: PropTypes.object.isRequired,
  domicilio: PropTypes.object.isRequired,
  imprimir: PropTypes.bool.isRequired,
};

CajaBase.defaultProps = {
  imprimir: true,
  cliente: {},
  domicilio: {},
};

export default CajaBase;
