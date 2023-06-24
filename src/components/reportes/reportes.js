import React, { useState, useEffect, useRef, useCallback } from "react";
import "../../css/general.css";
import ContainerBase from "../dashboard/containerBase";
import TableBase from "../dashboard/tableBase";
import { capitalize, formatoHora, formatoPrecio } from "../utils";
import { CsvBuilder } from "filefy";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { useReactToPrint } from "react-to-print";
import { ComponentToPrint } from "./ventasDiarias";
import { colunm } from "./columsTable";
import {
  Button,
  Badge,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ListGroupItem,
} from "reactstrap";
import { AiOutlineFilePdf } from "react-icons/ai";
import { TiPrinter } from "react-icons/ti";
import { SiMicrosoftexcel } from "react-icons/si";
import "moment/locale/es";
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import {
  obtenerPedidoAsync,
  estadoProceso,
  initialPedidos,
  eliminarPedidoAsync,
} from "../../redux/reducers/pedidosReducer";
import { disenoToast, disenoToastConfirm } from "../dashboard/disenoToastBase";
import {
  initialUtils,
  obtenerConsecutivoAsync,
} from "../../redux/reducers/utilsReducer";

function Reportes() {
  const moment = require("moment");

  const dispatch = useDispatch();

  const [date, setDate] = useState(new Date());

  const estado = useSelector(estadoProceso);

  const pedidos = useSelector(initialPedidos);

  const utils = useSelector(initialUtils);

  const [pedidosPv, setPedidosPv] = useState([]);

  const [data, setData] = useState([]);

  const [vendidos, setVendidos] = useState([]);

  const [venta, setVenta] = useState([]);

  const [modal, setModal] = useState(false);

  const [report, setReport] = useState("Boleta");

  const [modalReport, setModalReport] = useState(false);

  const componentPrint = useRef();

  const handlePrint = useReactToPrint({
    content: () => componentPrint.current,
  });

  const showToast = () => {
    toast.warning(
      <>
        <div>¿Estás seguro de realizar este proceso?</div>
        <div className="modal-boton">
          <Button
            onClick={() =>
              toast.error("Eliminación de archivo cancelada", disenoToast)
            }
          >
            Cancelar
          </Button>
          <Button
            onClick={() =>
              dispatch(eliminarPedidoAsync(pedidosPv.map((item) => item.id)))
            }
          >
            Continuar
          </Button>
        </div>
      </>,
      disenoToastConfirm
    );
  };

  useEffect(() => {
    if (!estado.isLoading) {
      if (estado.success) {
        toast.success(estado.success, disenoToast);
        cargarPedidos();
      } else if (estado.error) {
        toast.error(estado.error, disenoToast);
      }
    }
  }, [dispatch, estado]);

  const cargarPedidos = useCallback(() => {
    const startOfToday = moment(date).startOf("day");
    const endOfToday = moment(date).endOf("day");
    dispatch(obtenerPedidoAsync({ startOfToday, endOfToday }));
  }, [dispatch, date]);

  useEffect(() => {
    cargarPedidos();
  }, [cargarPedidos]);

  const cargarConsecutivo = useCallback(() => {
    if (utils.consecutivo === 0) {
      dispatch(obtenerConsecutivoAsync());
    }
  }, [dispatch, utils]);

  useEffect(() => {
    cargarConsecutivo();
  }, [cargarConsecutivo]);

  useEffect(async () => {
    setPedidosPv(pedidos.filter((x) => !x.cliente));
    obtenerProductosVendidos();
    const pedidosCaja = await agruparPedidos();
    cargarPediddosCaja(pedidosCaja);
  }, [pedidos]);

  const agruparPedidos = async () => {
    const group = pedidos.reduce((result, item) => {
      const id = item.cliente ? "Domicilios" : "PuntoVenta";
      result[id] = [...(result[id] || []), { ...item, parentId: id }];
      return result;
    }, {});

    return Object.values(group);
  };

  const cargarPediddosCaja = (values) => {
    const newData = [];
    const totalCaja = values.map((item) => {
      let total = 0;
      let registro = {};
      return (registro.index = item.reduce((result, item) => {
        total += item.total;
        result.id = item.cliente ? "Domicilios" : "PuntoVenta";
        result.caja = item.cliente ? "Domicilios" : "PuntoVenta";
        result.vTotal = total;
        newData.push(item);
        return result;
      }, {}));
    });

    setData([...totalCaja, ...newData]);
  };

  const ordenarProductos = useCallback((values) => {
    return values.sort((a, b) => a[0].nombre.localeCompare(b[0].nombre));
  }, []);

  const obtenerProductosVendidos = () => {
    let id_domicilio = Math.random().toString().replace(".", "");
    let group = pedidos.reduce((result, item) => {
      let domicilioTotal = 0;
      let contadorDom = 0;
      if (item.estado !== "Cancelado") {
        if (
          item.cliente?.barrio.valor &&
          (!item.domiciliario || item.domiciliario.rol !== 5)
        ) {
          domicilioTotal = domicilioTotal + item.cliente?.barrio.valor;
          contadorDom = contadorDom + 1;
        }
        item.productos.map((value) => {
          result[value.id] = [
            ...(result[value.id] || []),
            {
              id: value.id,
              nombre: value.nombre,
              precio: value.precio,
              cantidad: value.cantidad,
              categoria: value.categoria.nombre,
            },
          ];
        });
      }
      result[id_domicilio] = [
        ...(result[id_domicilio] || []),
        {
          id: item.domiciliario ? item.domiciliario.id : "Sin Asignar",
          nombre: "Domicilios",
          domiciliario: item.domiciliario
            ? item.domiciliario.nombre
            : "Sin Asignar",
          precio: domicilioTotal,
          cantidad: contadorDom,
        },
      ];
      return result;
    }, {});

    setVendidos(ordenarProductos(Object.values(group)));
  };

  //metodo para cargar el detalle de un pedido
  const consultarPedido = (value) => {
    setVenta(value.productos);
    setModal(true);
  };

  //metodo para cargar el detalle de un pedido
  const consultarReporte = (value) => {
    setReport(value);
    setModalReport(true);
  };

  const exportVendidosCsv = () => {
    setModalReport(false);
    new CsvBuilder(`Productos-vendidos-${moment().format("MMMM-DD-YYYY")}.csv`)
      .setDelimeter(";")
      .setColumns(exportColumnsVendidos)
      .addRows(bodyColumnsVendidos())
      .exportFile();
  };

  const exportVendidosPdf = (data) => {
    setModalReport(false);
    const doc = new jsPDF("l", "px", "a4");
    const startY = 40;
    const pageWidth = doc.internal.pageSize.getWidth();
    const columnWidth = pageWidth / exportColumns.length;
    const fontSize = 6;
    const columnStyles = { columnWidth, fontSize };

    doc.text(
      `Productos Vendidos ${moment().format("DD/MM/YY")}`,
      doc.internal.pageSize.getWidth() / 2,
      20,
      {
        align: "center",
      }
    );

    doc.autoTable({
      startY,
      styles: { backgroundColor: "0xFF525659", fontSize },
      columnStyles,
      head: [exportColumnsVendidos],
      body: bodyColumnsVendidos(),
    });

    doc.save(`Productos-vendidos-${moment().format("MMMM-DD-YYYY")}.pdf`);
  };

  const exportColumnsVendidos = [
    "Producto",
    "Valor",
    "Cantidad",
    "IPO Consumo",
    "Total",
  ];

  const bodyColumnsVendidos = () => {
    const exportedData = vendidos.map((rowData) => {
      let total = 0;
      let ipoconsumo = 0;
      let cantidadTotal = 0;
      const { nombre, precio, categoria } = rowData[0];
      rowData.map((item) => {
        const { precio, cantidad, categoria } = item;
        cantidadTotal += cantidad;
        total += precio * cantidad;
        if (categoria === "Fritos" || categoria === "Gaseosas") {
          ipoconsumo += precio * cantidad * 0.08;
        }
      });

      if (categoria) {
        return [
          nombre,
          formatoPrecio(precio),
          cantidadTotal,
          formatoPrecio(ipoconsumo),
          formatoPrecio(total),
        ];
      } else {
        return ["Domicilios", null, cantidadTotal, null, formatoPrecio(total)];
      }
    });
    return exportedData;
  };

  //metodo para exportar a excel el formato csv
  const exportCsv = (data) => {
    setModalReport(false);
    new CsvBuilder(`Reporte-${moment().format("MMMM-DD-YYYY")}.csv`)
      .setDelimeter(";")
      .setColumns(exportColumns)
      .addRows(bodyColumns(data))
      .exportFile();
  };

  const exportPdf = (data) => {
    setModalReport(false);
    const doc = new jsPDF("l", "px", "a4");
    const startY = 40;
    const pageWidth = doc.internal.pageSize.getWidth();
    const columnWidth = pageWidth / exportColumns.length;
    const fontSize = 5;
    const columnStyles = { columnWidth, fontSize };

    doc.text(
      `Reporte de Ventas ${moment().format("DD/MM/YY")}`,
      doc.internal.pageSize.getWidth() / 2,
      20,
      {
        align: "center",
      }
    );

    doc.autoTable({
      startY,
      styles: { backgroundColor: "0xFF525659", fontSize },
      columnStyles,
      head: [exportColumns],
      body: bodyColumns(data),
    });

    doc.save(`Reporte-${moment().format("MMMM-DD-YYYY")}.pdf`);
  };

  //columnas a mostrar en el archivo exportado
  const exportColumns = [
    "Hora",
    "Caja",
    "Vendedor",
    "Medio Pago",
    "Transferencia",
    "Efectivo",
    "Turno Caja",
    "Turno Domicilio",
    "Cliente",
    "Municipio",
    "Barrio",
    "Direccion",
    "Punto Referencia",
    "Teléfono Principal",
    "Teléfono Secundario",
    "Domiciliario",
    "Valor Domicilio",
    "Ipo C.",
    "Total",
    "Comentarios",
    "Estado",
    "Ultimo Movimiento",
    "Hora de Entrega",
  ];

  //metodo para calcular los valores de cada columna
  const bodyColumns = (values) => {
    const exportedData = values.map((rowData) => {
      const {
        fecha,
        usuario,
        ipoconsumo,
        total,
        detallePago,
        medioPago,
        turno,
        turnoDomicilio,
        domiciliario,
        cliente,
        observaciones,
        estado,
        movimiento,
        entrega,
      } = rowData;
      return [
        formatoHora(fecha),
        !cliente ? "Punto de Venta" : "Domicilios",
        usuario,
        capitalize(medioPago),
        detallePago
          ? formatoPrecio(detallePago.transferencia)
          : medioPago === "transferencia"
          ? formatoPrecio(total)
          : formatoPrecio(0),
        detallePago
          ? formatoPrecio(detallePago.efectivo)
          : medioPago === "efectivo"
          ? formatoPrecio(total)
          : formatoPrecio(0),
        turno,
        turnoDomicilio,
        cliente ? cliente.nombre : null,
        cliente ? cliente.barrio.municipio.nombre : null,
        cliente ? cliente.barrio.nombre : null,
        cliente ? cliente.direccion : null,
        cliente ? cliente.puntoRef : null,
        cliente ? cliente.telefono : null,
        cliente ? cliente.telefono2 : null,
        domiciliario ? domiciliario.nombre : null,
        cliente ? formatoPrecio(cliente.barrio.valor) : null,
        formatoPrecio(ipoconsumo),
        formatoPrecio(total),
        observaciones,
        estado,
        movimiento && formatoHora(movimiento),
        entrega && formatoHora(entrega),
      ];
    });
    return exportedData;
  };

  const imprmirBoleta = () => {
    setModalReport(false);
    handlePrint();
  };

  function salsas(producto) {
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
  }

  //metodo para mostrar el detalle de una venta
  const detalleVenta = () => {
    var detalle = venta.map((item) => {
      const total = item.cantidad * item.precio;
      const salsa = salsas(item);
      return (
        <ListGroupItem>
          <div className="flex flex-row justify-between items-center">
            <div className="flex flex-col">
              <text className="text-lg">
                {`${item.nombre} `}
                <Badge color="success" pill>
                  x{item.cantidad}
                </Badge>
              </text>
              {item.categoria.salsas && (
                <text>
                  {salsa.length > 0 ? `Salsas:${salsa}` : "Sin salsas"}
                </text>
              )}
              <text>Precio: {formatoPrecio(total)}</text>
            </div>
          </div>
        </ListGroupItem>
      );
    });
    return detalle;
  };

  return (
    <ContainerBase
      date={date}
      button={pedidosPv}
      handleDate={(value) => setDate(value)}
      eliminar={showToast}
    >
      <ToastContainer />
      <div className="hidden">
        <ComponentToPrint
          ref={componentPrint}
          data={vendidos}
          ventas={pedidos}
          fecha={date}
          consecutivo={utils.tirilla.consecutivo || utils.consecutivo}
        />
      </div>
      <TableBase
        loading={estado.isLoading}
        componente="Reporte Pedidos"
        datos={data}
        columnas={colunm}
        obtener={() => cargarPedidos()}
        detalle={(oldData) => consultarPedido(oldData)}
        exportPdf={(newData) => exportPdf(newData)}
        exportCsv={(newData) => exportCsv(newData)}
        exportModal={consultarReporte}
      />
      <Modal className="flex items-center h-screen" isOpen={modal}>
        <ModalHeader className="modal-header">Detalle Pedido</ModalHeader>
        <ModalBody className="modal-detalle-ped">{detalleVenta()}</ModalBody>
        <ModalFooter className="modal-boton">
          <Button onClick={() => setModal(false)}>Cerrar</Button>
        </ModalFooter>
      </Modal>
      <Modal className="flex items-center h-screen" isOpen={modalReport}>
        <ModalBody className="modal-detalle-ped">
          <table className="flex justify-center">
            <tbody>
              {report === "Boleta" ? (
                <tr>
                  <td>
                    <Button
                      className="m-1"
                      color="info"
                      onClick={() => imprmirBoleta()}
                    >
                      <TiPrinter size="md" />
                    </Button>
                  </td>
                  <td>
                    <Button
                      className="m-1"
                      color="danger"
                      onClick={() => exportVendidosPdf()}
                    >
                      <AiOutlineFilePdf size="md" />
                    </Button>
                  </td>
                  <td>
                    <Button
                      className="m-1"
                      color="success"
                      onClick={() => exportVendidosCsv()}
                    >
                      <SiMicrosoftexcel size="md" />
                    </Button>
                  </td>
                </tr>
              ) : (
                <tr>
                  <td>
                    <Button
                      className="m-1"
                      color="danger"
                      onClick={() => exportPdf(pedidos)}
                    >
                      <AiOutlineFilePdf size="md" />
                    </Button>
                  </td>
                  <td>
                    <Button
                      className="m-1"
                      color="success"
                      onClick={() => exportCsv(pedidos)}
                    >
                      <SiMicrosoftexcel size="md" />
                    </Button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </ModalBody>
        <ModalFooter className="modal-boton">
          <Button onClick={() => setModalReport(false)}>Cerrar</Button>
        </ModalFooter>
      </Modal>
    </ContainerBase>
  );
}
export default Reportes;
