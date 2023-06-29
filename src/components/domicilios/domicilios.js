import React, {
  useState,
  useContext,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { FirebaseContext } from "../../firebase";
import { diffMinutos, formatoPrecio } from "../utils";
import "../../css/general.css";
import { useLocation, useNavigate } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import Avatar from "@material-ui/core/Avatar";
import { BsPhone } from "react-icons/bs";
import { useReactToPrint } from "react-to-print";
import { ComponentToPrint } from "../utils/print";
import useSessionStorage from "../utils/useSessionStorage";
import "moment/locale/es";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// Notifications icon
import PedidosNoty from "./pedidosNoty";
import ContainerBase from "../dashboard/containerBase";
import TableBase from "../dashboard/tableBase";
import {
  Button,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Table,
} from "reactstrap";
import {
  initialBarrios,
  estadoProceso as estadoProcesoBarrios,
  obtenerBarrioAsync,
} from "../../redux/reducers/barriosReducer";
import { useDispatch, useSelector } from "react-redux";
import {
  initialEmpleados,
  estadoProceso as estadoProcesoEmpleados,
  obtenerEmpleadoAsync,
} from "../../redux/reducers/empleadosReducer";
import {
  actualizarEntregaPedidoAsync,
  actualizarEstadoPedidoAsync,
  actualizarDomiciliarioPedidoAsync,
  actualizarPedidoDomicilioAsync,
  cancelarPedidoAsync,
  estadoProceso,
  reiniciarEstados,
  cancelarPedidoApp,
  obtenerPedidoIdAsync,
} from "../../redux/reducers/pedidosReducer";
import { disenoToast } from "../dashboard/disenoToastBase";
import Messages from "../utils/message";
import ProductoPedido from "../pedidos/productoPedido";
import { productoInterno } from "../dashboard/productoInterno";
import PedidoActual from "../pedidos/pedidoActual";
import {
  initialProductos,
  estadoProceso as estadoProcesoProductos,
  obtenerProductoAsync,
} from "../../redux/reducers/productosReducer";
import {
  initialUsuarios,
  estadoProceso as estadoProcesoUsuario,
  obtenerUsuarioAsync,
} from "../../redux/reducers/usuariosReducer";
import PagoParcial from "../pedidos/pagoParcial";
import {
  initialUtils,
  estadoProceso as estadoProcesoUtils,
  obtenerParametrosAsync,
} from "../../redux/reducers/utilsReducer";

//Metodo para asignar estilos a los estados
const useStyles = makeStyles((theme) => ({
  pendiente: {
    backgroundColor: "#E67E22",
    marginLeft: 5,
  },
  despachado: {
    backgroundColor: "#2980B9",
    marginLeft: 5,
  },
  entregado: {
    backgroundColor: "#2ECC71",
    marginLeft: 5,
  },
  cancelado: {
    backgroundColor: "#E74C3C",
    marginLeft: 5,
  },
  impreso: {
    backgroundColor: "#2C3E50",
    marginLeft: 5,
  },
  reimpreso: {
    backgroundColor: "#A023ED",
    marginLeft: 5,
  },
  modificado: {
    backgroundColor: "#E4E324",
    marginLeft: 5,
  },
}));

function Domicilios() {
  // context de firebase desde el provider
  const { firebase } = useContext(FirebaseContext);

  const stringify = require("json-stable-stringify");

  const { state } = useLocation();

  const style = useStyles();

  const dispatch = useDispatch();

  const navigate = useNavigate();

  const moment = require("moment");

  const initialLogin = {
    id: null,
    token: false,
    rol: 1,
    sede: null,
  };

  const [login] = useSessionStorage("login", initialLogin);

  const estado = useSelector(estadoProceso);

  const estadoUtils = useSelector(estadoProcesoUtils);

  const estadoBarrios = useSelector(estadoProcesoBarrios);

  const estadoEmpleados = useSelector(estadoProcesoEmpleados);

  const estadoProductos = useSelector(estadoProcesoProductos);

  const estadoUsuario = useSelector(estadoProcesoUsuario);

  const usuario = useSelector(initialUsuarios);

  const utils = useSelector(initialUtils);

  const barrios = useSelector(initialBarrios);

  const empleados = useSelector(initialEmpleados);

  const productos = useSelector(initialProductos);

  const [domiciliarios, setDomiciliarios] = useState([]);

  const [data, setData] = useState([]);

  const [venta, setVenta] = useState({});

  const [actual, setActual] = useState([]);

  const [pendiente, setPendiente] = useState([]);

  const [pedidosApp, setPedidosApp] = useState([]);

  const [pedidoEdit, setPedidoEdit] = useState({});

  const [modal, setModal] = useState(false);

  const [modalNoty, setModalNoty] = useState(
    state?.notify ? state.notify : false
  );

  const [modalPen, setModalPen] = useState(false);

  const [modalComentario, setComentario] = useState(false);

  const [modalpago, setPago] = useState(false);

  const [colunm, setColunm] = useState([]);

  const [espera, setEspera] = useSessionStorage("espera", {
    hora: 0,
    minutos: 40,
  });

  const [total, setTotal] = useState(0);

  const [ipoconsumo, setIpoconsumo] = useState(0);

  const componentPrint = useRef();

  useEffect(() => {
    if (!estado.isLoading) {
      if (estado.success) {
        estado.success.indexOf("Exito, registro impreso") === 0 &&
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
  }, [dispatch, estado]);

  //Metodo para calcular el nombre del domiciliario
  const lookupDomiciliario = () => {
    const lookup = { undefined: "Sin Asignar" };
    domiciliarios.forEach((element) => {
      lookup[element.id] = element.nombre;
    });
    return lookup;
  };

  //Metodo para calcular el nombre del barrio
  const lookupBarrio = () => {
    const lookup = {};
    barrios.forEach((element) => {
      lookup[element.id] = `${element.municipio.nombre} (${element.nombre})`;
    });
    return lookup;
  };

  useEffect(() => {
    setColunm([
      {
        title: "id",
        field: "id",
        hidden: true,
      },
      {
        title: "Estado",
        field: "estado",
        render: (rowData) => iconoEstado(rowData),
        editable: "never",
        defaultSort: "desc",
      },
      {
        title: "Hora Pedido",
        field: "fecha",
        defaultSort: "asc",
        render: (rowData) =>
          rowData.fecha
            ? moment(rowData.fecha.toDate()).format("h: mm a")
            : null,
        editable: "never",
      },
      {
        title: "Total Venta",
        field: "total",
        render: (rowData) => formatoPrecio(rowData.total),
        editable: "never",
      },
      {
        title: "Valor Domicilio",
        field: "cliente.barrio.valor",
        render: (rowData) => formatoPrecio(rowData.cliente.barrio.valor),
        editable: "onUpdate",
        type: "numeric",
      },
      {
        title: "Medio Pago",
        field: "medioPago",
        render: (rowData) =>
          rowData.medioPago && rowData.medioPago.toUpperCase(),
        editable: "never",
      },
      {
        title: "Cliente",
        field: "cliente.nombre",
        editable: "never",
      },
      {
        title: "Dirección",
        field: "cliente.direccion",
        editable: "onUpdate",
      },
      {
        title: "Punto Ref",
        field: "cliente.puntoRef",
        editable: "onUpdate",
      },
      {
        title: "Teléfono Principal",
        field: "cliente.telefono",
        editable: "onUpdate",
        type: "numeric",
        validate: (rowData) => {
          if (!rowData.cliente.telefono) {
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
        title: "Teléfono Secundario",
        field: "cliente.telefono2",
        editable: "onUpdate",
        type: "numeric",
      },
      {
        title: "Municipio Barrio",
        field: "cliente.barrio.id",
        lookup: lookupBarrio(),
        editable: "onUpdate",
      },
      {
        title: "Domiciliario",
        field: "domiciliario.id",
        lookup: lookupDomiciliario(),
        render: (rowData) => rowData.domiciliario?.nombre,
        editable: "onUpdate",
      },
      {
        title: "Hora Despacho",
        field: "domiciliario",
        render: (rowData) =>
          rowData.domiciliario?.hora
            ? moment(rowData.domiciliario?.hora.toDate()).format("h: mm a")
            : null,
        editable: "never",
      },
      {
        title: "Comentario",
        field: "observaciones",
        editable: "onUpdate",
      },
      {
        title: "Motivo Cancelación",
        field: "comentario",
        editable: "never",
      },
      {
        title: "Modificado",
        field: "modificado",
        render: (rowData) => (rowData.modificado ? rowData.usuario : null),
        editable: "never",
      },
      {
        title: "Ultimo Movimiento",
        field: "movimiento",
        render: (rowData) =>
          rowData.movimiento
            ? moment(rowData.movimiento.toDate()).format("h: mm a")
            : null,
        editable: "never",
      },
      {
        title: "Hora Entrega",
        field: "entrega",
        render: (rowData) =>
          rowData.entrega
            ? moment(rowData.entrega.toDate()).format("h: mm a")
            : null,
        editable: "never",
      },
      {
        title: "Tiempo Entrega",
        field: "entrega",
        render: (rowData) =>
          rowData.entrega
            ? diffMinutos(
                rowData.domiciliario.hora.toDate(),
                rowData.entrega.toDate()
              )
            : null,
        editable: "never",
      },
    ]);
  }, [data]);

  useEffect(() => {
    if (Object.values(pedidoEdit).length > 0) {
      setActual([...pedidoEdit.productos]);
    }
  }, [pedidoEdit, setActual]);

  const cargarParametros = useCallback(() => {
    if (Object.values(utils.parametros).length === 0) {
      dispatch(obtenerParametrosAsync());
    }
  }, [dispatch, utils]);

  useEffect(() => {
    cargarParametros();
  }, [cargarParametros]);

  const cargarBarrios = useCallback(() => {
    if (barrios.length === 0) {
      dispatch(obtenerBarrioAsync());
    }
  }, [dispatch, barrios]);

  useEffect(() => {
    cargarBarrios();
  }, [cargarBarrios]);

  const cargarProductos = useCallback(() => {
    if (productos.length === 0) {
      dispatch(obtenerProductoAsync());
    }
  }, [dispatch, productos]);

  useEffect(() => {
    cargarProductos();
  }, [cargarProductos]);

  const cargarEmpleados = useCallback(() => {
    if (empleados.length === 0) {
      dispatch(obtenerEmpleadoAsync());
    } else {
      const newData = empleados.map(
        (item) =>
          item.estado &&
          (item.rol === 2 || item.rol === 5) && {
            id: item.id,
            nombre: item.nombre,
            rol: item.rol,
          }
      );
      setDomiciliarios(newData.filter((x) => x));
    }
  }, [dispatch, empleados]);

  useEffect(() => {
    cargarEmpleados();
  }, [cargarEmpleados]);

  const obtenerUsuario = useCallback(() => {
    if (Object.values(usuario).length === 0) {
      dispatch(obtenerUsuarioAsync(login.id));
    }
  }, [dispatch, usuario, login.id]);

  useEffect(() => {
    obtenerUsuario();
  }, [obtenerUsuario]);

  const manejarSnapshotPedidos = (values) => {
    const pedidos = values.docs
      .map((doc) => {
        return {
          id: doc.id,
          ...doc.data(),
        };
      })
      .filter((e) => {
        if (e.cliente) {
          return e;
        }
      });
    const pedidosWeb = pedidos.filter((e) => e.estado !== "Pendiente aprobar");
    const pedidosApp = pedidos.filter((e) => e.estado === "Pendiente aprobar");

    setData(pedidosWeb);
    setPedidosApp(pedidosApp);
  };

  const validarPedidoApp = async (values, datos) => {
    const result = await dispatch(obtenerPedidoIdAsync(values.id)).unwrap();
    if (result.estado !== "Pendiente aprobar") {
      return false;
    }
    dispatch(
      cancelarPedidoApp({
        ...values,
        ...datos,
        comentario: "El restaurante no recibió su pedido",
      })
    );
  };

  useEffect(() => {
    const datos = {
      estado: "Cancelado",
      deuda: false,
      total: 0,
      ipoconsumo: 0,
    };

    pedidosApp.map((item) => {
      const barrioSelect = barrios.find((x) => x.id === item.cliente.barrio.id);
      if (barrioSelect && barrioSelect.valor !== item.cliente.barrio.valor) {
        dispatch(
          cancelarPedidoApp({
            ...item,
            ...datos,
            comentario: `Es necesario actualizar la aplicación en su última versión ${utils.parametros[0]?.appClientes.android}. Y recuerda realizar nuevamente tu pedido`,
          })
        );
      } else {
        const timer = setTimeout(async () => {
          validarPedidoApp(item, datos);
        }, 15 * 60 * 1000);

        return () => {
          clearTimeout(timer);
        };
      }
    });
  }, [pedidosApp]);

  //Metodo para pobtener los pedidos desde el componente de fechas
  useEffect(() => {
    const startOfToday = moment(new Date()).startOf("day").toDate();

    const obtenerPedidos = () => {
      firebase.db
        .collection("pedidos")
        .where("fecha", ">=", startOfToday)
        .onSnapshot(manejarSnapshotPedidos);
    };

    obtenerPedidos();
  }, []);

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
    const domicilio = pedidoEdit?.cliente?.barrio?.valor || 0;
    setTotal(suma + domicilio);
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

  //Metodo para retornar los iconos de estado por color
  const iconoEstado = (value) => {
    switch (value.estado) {
      case "Pendiente":
        return (
          <Avatar className={style.pendiente}>
            {value.sede !== 3 ? "P" : <BsPhone />}
          </Avatar>
        );
      case "Cancelado":
        return (
          <Avatar className={style.cancelado}>
            {value.sede !== 3 ? "C" : <BsPhone />}
          </Avatar>
        );
      case "Entregado":
        return (
          <Avatar className={style.entregado}>
            {value.sede !== 3 ? "E" : <BsPhone />}
          </Avatar>
        );
      case "Impreso":
        return (
          <Avatar className={style.impreso}>
            {value.sede !== 3 ? "I" : <BsPhone />}
          </Avatar>
        );
      case "Reimpreso":
        return (
          <Avatar className={style.reimpreso}>
            {value.sede !== 3 ? "R" : <BsPhone />}
          </Avatar>
        );
      case "Modificado":
        return (
          <Avatar className={style.modificado}>
            {value.sede !== 3 ? "M" : <BsPhone />}
          </Avatar>
        );
      default:
        return (
          <Avatar className={style.despachado}>
            {value.sede !== 3 ? "D" : <BsPhone />}
          </Avatar>
        );
    }
  };

  //metodo para actualizar estados
  const actualizarEstado = (value) => {
    if (value.estado !== "Cancelado") {
      if (value.estado === "Entregado" || value.estado === "Despachado") {
        handlePrint();
        return limpiarState();
      } else {
        let estado = "Impreso";
        if (value.estado === "Pendiente aprobar") {
          estado = "Pendiente";
        }
        if (value.estado === estado || value.estado === "Reimpreso") {
          estado = "Reimpreso";
        }
        dispatch(actualizarEstadoPedidoAsync({ ...value, estado }));
      }
    } else {
      toast.error("No es posible imprimir un pedido cancelado", disenoToast);
    }
  };

  //metodo para actualizar estados
  const cancelarPedido = (comentario) => {
    const datos = {
      ...pedidoEdit,
      comentario,
      estado: "Cancelado",
      deuda: false,
      total: 0,
      ipoconsumo: 0,
    };
    dispatch(cancelarPedidoAsync(datos));
  };

  const handleEspera = ({ target }) => {
    setEspera({
      ...espera,
      [target.name]: target.value ? parseInt(target.value) : 0,
    });
  };

  //Metodo para imprimir
  const handlePrint = useReactToPrint({
    content: () => componentPrint.current,
  });

  const handlePendientes = () => {
    const estados = ["Pendiente", "Impreso", "Reimpreso"];
    const group = data.reduce((result, item) => {
      if (estados.includes(item.estado)) {
        item.productos.map((value) => {
          result[value.id] = [
            ...(result[value.id] || []),
            {
              nombre: value.nombre,
              cantidad: value.cantidad,
            },
          ];
        });
      }
      return result;
    }, {});

    setPendiente(Object.values(group));
    setModalPen(true);
  };

  const cerraModalNoty = () => {
    if (state?.notify) {
      return navigate("/pedidos");
    }
    setModalNoty(false);
  };

  const compararPedidos = (newValue, oldValue, domiciliario) => {
    delete oldValue.domiciliario;
    delete newValue.domiciliario;
    const pedidoInicialString = stringify(oldValue);
    const pedidoFinalString = stringify(newValue);
    if (pedidoInicialString === pedidoFinalString && domiciliario) {
      return undefined;
    }
    return true;
  };

  const actualizarPedido = (value, oldValue) => {
    const domiciliarioSelect =
      value.domiciliario &&
      domiciliarios.find((x) => x.id === value.domiciliario.id);
    const modificaDomiciliario =
      value.domiciliario?.nombre !== domiciliarioSelect?.nombre;
    value.movimiento = compararPedidos(value, oldValue, modificaDomiciliario);
    const valor = value.cliente.barrio.valor;
    const barrioSelect = barrios.find((x) => x.id === value.cliente.barrio.id);
    if (modificaDomiciliario) {
      if (domiciliarioSelect) {
        value.domiciliario = domiciliarioSelect;
        value.estado = "Despachado";
      } else {
        value.domiciliario = null;
        value.estado = "Pendiente";
      }
      dispatch(actualizarDomiciliarioPedidoAsync(value));
    } else if (value.estado === "Impreso") {
      value.estado = "Modificado";
    }
    if (barrioSelect.nombre === value.cliente.barrio.nombre) {
      value.cliente.barrio = { ...barrioSelect, valor };
    } else {
      value.cliente.barrio = barrioSelect;
    }
    value.total = value.productos.reduce(
      (sum, value) =>
        typeof value.cantidad == "number"
          ? sum + value.cantidad * value.precio
          : sum,
      value.cliente.barrio.valor
    );
    dispatch(actualizarPedidoDomicilioAsync(value));
  };

  const pedidoActual = async (value, indice) => {
    const pedido = JSON.parse(JSON.stringify(value));
    switch (indice) {
      case "imprimir":
        const estados = ["Cancelado", "Despachado", "Entregado"];
        if (!pedido.estado.includes(estados)) {
          await setVenta(pedido);
          actualizarEstado(pedido);
        }
        break;
      case "entregar":
        dispatch(
          actualizarEntregaPedidoAsync({ ...pedido, estado: "Entregado" })
        );
        break;
      case "editar":
        setPedidoEdit(pedido);
        setModal(true);
        break;
      case "cancelar":
        setPedidoEdit(pedido);
        setComentario(true);
        break;
      case "agregar":
        setPedidoEdit(pedido);
        dispatch(
          actualizarEstadoPedidoAsync({
            ...pedido,
            estado: "Pendiente",
            deuda: true,
            espera,
          })
        );
        break;
    }
  };

  const ordenarProductos = useCallback((values) => {
    return values.sort((a, b) => a.orden - b.orden);
  }, []);

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
    if (pedidoEdit.estado === "Impreso" || pedidoEdit.estado === "Reimpreso") {
      pedidoEdit.estado = "Modificado";
    }
    const values = {
      ...pedidoEdit,
      ipoconsumo,
      total,
      medioPago,
      detallePago,
      usuario: usuario.nombre,
      productos: [...actual],
      recibido: null,
    };
    setVenta(values);
    dispatch(actualizarPedidoDomicilioAsync(values));
  };

  const limpiarState = () => {
    setModal(false);
    setModalPen(false);
    setComentario(false);
    setPago(false);
    setPedidoEdit({});
    setVenta({});
    setActual([]);
    setTotal(0);
    setIpoconsumo(0);
    cerraModalNoty();
  };

  const abrirModalPago = () => {
    setModal(false);
    setPago(true);
  };

  const cargarComponente = () => {
    if (modalNoty) {
      return (
        <Modal
          scrollable
          className="flex items-center"
          style={{ height: "90vh" }}
          isOpen={modalNoty}
        >
          <ModalHeader className="modal-header">
            Pedidos Clientes App
          </ModalHeader>
          <div className="flex flex-col m-3 ">
            <Label for="espera">Tiempo de Entrega (HH:mm)</Label>
            <div className=" flex flex-row w-1/3">
              <Input
                className="mr-2"
                id="hora"
                name="hora"
                placeholder="0"
                type="number"
                value={espera.hora}
                onChange={handleEspera}
                min={0}
                max={9}
              />
              <Input
                id="minutos"
                name="minutos"
                placeholder="0"
                type="number"
                value={espera.minutos}
                onChange={handleEspera}
                min={0}
                max={59}
              />
            </div>
          </div>
          <ModalBody>
            {pedidosApp.map((value) => {
              return (
                <PedidosNoty
                  key={value.id}
                  pedido={value}
                  agregar={(oldData) => pedidoActual(oldData, "agregar")}
                  cancelar={(oldData) => pedidoActual(oldData, "cancelar")}
                />
              );
            })}
          </ModalBody>
          <ModalFooter>
            <div className="modal-boton">
              <Button onClick={() => cerraModalNoty()}>Cerrar</Button>
            </div>
          </ModalFooter>
        </Modal>
      );
    }
    if (modalPen) {
      return (
        <Modal
          scrollable
          className="flex items-center"
          style={{ height: "90vh" }}
          isOpen={modalPen}
        >
          <ModalHeader className="modal-header">
            Pendientes Por Despachar
          </ModalHeader>
          <ModalBody>
            <Table striped bordered>
              <thead>
                <tr>
                  <th>PRODUCTO</th>
                  <th>CANTIDAD</th>
                </tr>
              </thead>
              <tbody>
                {pendiente &&
                  pendiente.map((item) => {
                    return (
                      <tr>
                        <td>{item[0].nombre.toUpperCase()}</td>
                        <td>
                          {item.reduce(
                            (sum, value) =>
                              typeof value.cantidad == "number"
                                ? sum + value.cantidad
                                : sum,
                            0
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </Table>
          </ModalBody>
          <ModalFooter>
            <div className="modal-boton">
              <Button onClick={() => setModalPen(false)}>Cerrar</Button>
            </div>
          </ModalFooter>
        </Modal>
      );
    }
    if (modal) {
      return (
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
                disabled={actual.length > 0 ? false : true}
                onClick={abrirModalPago}
              >
                Actualizar
              </Button>
            </div>
          </ModalFooter>
        </Modal>
      );
    }
    if (modalpago) {
      return (
        <PagoParcial
          modal={modalpago}
          total={total}
          medioPago={pedidoEdit.medioPago}
          guardar={actualizarProductos}
          detallePago={pedidoEdit.detallePago}
        />
      );
    }
    return (
      <TableBase
        componente="Domicilios"
        datos={data}
        columnas={colunm}
        editar={(oldData) => pedidoActual(oldData, "editar")}
        eliminar={(oldData) => pedidoActual(oldData, "cancelar")}
        entregar={(oldData) => pedidoActual(oldData, "entregar")}
        actualizar={(newData, oldData) => actualizarPedido(newData, oldData)}
        imprimir={(oldData) => pedidoActual(oldData, "imprimir")}
      />
    );
  };

  return (
    <ContainerBase
      componente="Domicilios"
      domicilios={pedidosApp}
      loading={
        estado.isLoading ||
        estadoProductos.isLoading ||
        estadoBarrios.isLoading ||
        estadoUtils.isLoading ||
        estadoEmpleados.isLoading ||
        estadoUsuario.isLoading
      }
      modal={true}
      modalNoty={() => setModalNoty(true)}
      modalPen={handlePendientes}
      modalDeudas={() => navigate("/deudas")}
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
      {cargarComponente()}
    </ContainerBase>
  );
}
export default Domicilios;
