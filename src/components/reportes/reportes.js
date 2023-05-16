import React, {
  useState,
  useEffect,
  useContext,
  useRef,
  useCallback,
} from "react";
import "../../css/general.css";
import MaterialTable from "material-table";
import { FirebaseContext } from "../../firebase";
import { formatearTimestamp, formatoPrecio } from "../utils";
import { Link } from "react-router-dom";
import home from "../../images/iconos/inc-home.png";
import { DatePicker } from "react-rainbow-components";
import { CsvBuilder } from "filefy";
import { jsPDF } from "jspdf";
import { applyPlugin } from "jspdf-autotable";
import { useReactToPrint } from "react-to-print";
import { ComponentToPrint } from "./ventasDiarias";
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
import stringify from "json-stable-stringify";
import { useDispatch, useSelector } from "react-redux";
import {
  estadoProceso,
  initialUtils,
  obtenerTirillaAsync,
  obtenerConsecutivoAsync,
} from "../../redux/reducers/utilsReducer";

function Reportes() {
  const moment = require("moment");

  const [date, setDate] = useState(new Date());

  const { firebase } = useContext(FirebaseContext);

  const dispatch = useDispatch();

  const estado = useSelector(estadoProceso);

  const utils = useSelector(initialUtils);

  const [domiciliarios, setDataDomiciliario] = useState([]);

  const [colunm, setColunm] = useState([]);

  const [data, setData] = useState([]);

  const [vendidos, setVendidos] = useState([]);

  const [venta, setVenta] = useState([]);

  const [newData, setNewData] = useState();

  const [modal, setModal] = useState(false);

  const [report, setReport] = useState(false);

  const componentPrint = useRef();

  useEffect(() => {
    setColunm([
      { title: "Sede", field: "pVenta" },
      {
        title: "Fecha",
        field: "fecha",
        defaultSort: "asc",
        render: (rowData) =>
          rowData.fecha
            ? moment(rowData.fecha.toDate()).format("MMMM-DD-YYYY, h: mm a")
            : null,
      },
      { title: "Vendedor", field: "usuario" },
      { title: "Medio de Pago", field: "medioPago" },
      {
        title: "Transferencia",
        field: "detallePago",
        render: (rowData) => formatoPrecio(rowData?.detallePago?.transferencia),
      },
      {
        title: "Efectivo",
        field: "detallePago",
        render: (rowData) => formatoPrecio(rowData?.detallePago?.efectivo),
      },
      {
        title: "Turno",
        field: "turno",
        render: (rowData) =>
          rowData.turno ? (
            <a
              onClick={() => consultarPedido(rowData)}
              className="cursor-pointer"
            >
              Turno #{rowData.turno}
            </a>
          ) : rowData.turnoDomicilio ? (
            <a
              onClick={() => consultarPedido(rowData)}
              className="cursor-pointer"
            >
              Turno #{rowData.turnoDomicilio}
            </a>
          ) : null,
      },
      {
        title: "Domiciliario",
        field: "domiciliario.nombre",
      },
      {
        title: "IPO Consumo",
        field: "ipoconsumo",
        render: (rowData) => formatoPrecio(rowData.ipoconsumo),
      },
      {
        title: "Total",
        field: "total",
        render: (rowData) => formatoPrecio(rowData.total),
      },
      {
        title: "Total Vendido",
        field: "vTotal",
        render: (rowData) => formatoPrecio(rowData.vTotal),
      },
    ]);
  }, [domiciliarios]);

  const cargarConsecutivo = useCallback(() => {
    if (utils.consecutivo === 0) {
      dispatch(obtenerConsecutivoAsync());
    }
  }, [dispatch, utils]);

  useEffect(() => {
    cargarConsecutivo();
  }, [cargarConsecutivo]);

  const ordenarProductos = useCallback((values) => {
    return values.sort((a, b) => a[0].nombre.localeCompare(b[0].nombre));
  }, []);

  useEffect(() => {
    const obtenerDomiciliarios = () => {
      firebase.db
        .collection("empleados")
        .where("rol", "in", [2, 5])
        .onSnapshot(manejarSnapshotDimiciliarios);
    };
    obtenerDomiciliarios();
  }, []);

  useEffect(() => {
    const obtenerPedidos = async () => {
      const startOfToday = moment(date).startOf("day").toDate();
      const endOfToday = moment(date).endOf("day").toDate();
      const result = await firebase.db
        .collection("pedidos")
        .where("fecha", ">=", startOfToday)
        .where("fecha", "<=", endOfToday)
        .get();
      const pedidos = result.docs.map((doc) => {
        return {
          id: doc.id,
          ...doc.data(),
        };
      });
      setData(pedidos.filter((x) => x.estado !== "Pendiente aprobar"));
    };

    obtenerPedidos();
    dispatch(obtenerTirillaAsync(date));
  }, [date]);

  useEffect(() => {
    const filtrarDatos = () => {
      const totalPv = data.reduce(
        (sum, value) =>
          typeof value.total == "number" && value.sede === 1
            ? sum + value.total
            : sum,
        0
      );
      const totalOf = data.reduce(
        (sum, value) =>
          typeof value.total == "number" && value.sede === 2
            ? sum + value.total
            : sum,
        0
      );

      let newData = [
        {
          vTotal: totalPv,
          pVenta: "Punto de Venta",
          id: 1,
        },
        {
          vTotal: totalOf,
          pVenta: "Domicilios",
          id: 2,
        },
        ...data,
      ];

      setNewData(newData);
    };

    function obtenerProductosVendidos() {
      let id_domicilio = Math.random().toString().replace(".", "");
      let group = data.reduce((result, item) => {
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
    }

    //metodos para calcular los totales por sede y productos vendidos
    obtenerProductosVendidos();
    filtrarDatos();
  }, [data]);

  function manejarSnapshotDimiciliarios(values) {
    const domiciliarios = values.docs.map((doc) => {
      return {
        id: doc.id,
        nombre: doc.data().nombre,
      };
    });
    setDataDomiciliario(domiciliarios);
  }

  const handlePrint = useReactToPrint({
    content: () => componentPrint.current,
  });

  //metodo para cargar el detalle de un pedido
  const consultarPedido = (value) => {
    setVenta(value.productos);
    setModal(true);
  };

  //columnas a mostrar en el archivo exportado
  const exportColumns = [
    "Id",
    "Fecha y Hora",
    "Sede",
    "Vendedor",
    "IPO C.",
    "Transferencia",
    "Efectivo",
    "Total Venta",
    "Medio de Pago",
    "Turno Caja",
    "Turno Domicilio",
    "Domiciliario",
    "Valor Domicilio",
    "Cliente",
    "Municipio",
    "Barrio",
    "Direccion",
    "Punto Referencia",
    "Teléfono Principal",
    "Teléfono Secundario",
    "Comentarios",
    "Motivo Cancelación",
    "Estado",
    "Ultimo Movimiento",
    "Hora de Entrega",
  ];

  const exportColumnsVendidos = [
    "Producto",
    "Valor",
    "Cantidad",
    "IPO Consumo",
    "Total",
  ];

  //metodo para calcular los valores de cada columna
  function bodyColumns() {
    const exportedData = data.map((rowData) => {
      const {
        id,
        fecha,
        sede,
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
        comentario,
        estado,
        movimiento,
        entrega,
      } = rowData;
      return [
        id,
        moment(fecha.toDate()).format("MMMM-DD-YYYY, h: mm a"),
        sede === 1 ? "Punto de Venta" : "Domicilios",
        usuario,
        ipoconsumo,
        detallePago
          ? detallePago.transferencia
          : medioPago === "transferencia"
          ? total
          : 0,
        detallePago
          ? detallePago.efectivo
          : medioPago === "efectivo"
          ? total
          : 0,
        total,
        medioPago,
        turno,
        turnoDomicilio,
        domiciliario ? domiciliario.nombre : null,
        cliente ? cliente.barrio.valor : null,
        cliente ? cliente.nombre : null,
        cliente ? cliente.barrio.municipio.nombre : null,
        cliente ? cliente.barrio.nombre : null,
        cliente ? cliente.direccion : null,
        cliente ? cliente.puntoRef : null,
        cliente ? cliente.telefono : null,
        cliente ? cliente.telefono2 : null,
        observaciones,
        comentario,
        estado,
        movimiento &&
          moment(movimiento.toDate()).format("MMMM-DD-YYYY, h: mm a"),
        entrega && moment(entrega.toDate()).format("MMMM-DD-YYYY, h: mm a"),
      ];
    });
    return exportedData;
  }

  function bodyColumnsVendidos() {
    const exportedData = vendidos.map((rowData) => {
      let total = 0;
      let ipoconsumo = 0;
      let cantidadTotal = 0;
      const { nombre, precio, categoria } = rowData[0];
      rowData.map((item) => {
        const { precio, cantidad, categoria } = item;
        cantidadTotal = cantidadTotal + cantidad;
        total = total + precio * cantidad;
        if (categoria === "Fritos" || categoria === "Gaseosas") {
          ipoconsumo = ipoconsumo + precio * cantidad * 0.08;
        }
      });

      if (categoria) {
        return [nombre, precio, cantidadTotal, ipoconsumo, total];
      } else {
        return ["Domicilios", null, cantidadTotal, null, total];
      }
    });
    return exportedData;
  }

  //metodo para exportar a excel el formato csv
  const exportCsv = () => {
    new CsvBuilder("Reporte-" + moment().format("MMMM-DD-YYYY") + ".csv")
      .setDelimeter(";")
      .setColumns(exportColumns)
      .addRows(bodyColumns())
      .exportFile();
  };

  const exportFileCsv = () => {
    new CsvBuilder(
      "Productos_Vendidos-" + moment().format("MMMM-DD-YYYY") + ".csv"
    )
      .setDelimeter(";")
      .setColumns(exportColumnsVendidos)
      .addRows(bodyColumnsVendidos())
      .exportFile();
  };

  //metodo para exportar en pdf
  const exportFilePDF = () => {
    new applyPlugin(jsPDF);
    const doc = new jsPDF("p", "px", "a4");
    doc.autoTable({
      styles: { backgroundColor: "0xFF525659", fontSize: 5 },
      columnStyles: {
        0: { columnWidth: 100, fontSize: 5 }, // Producto
        1: { columnWidth: 30, fontSize: 5 }, // Valor
        2: { columnWidth: 30, fontSize: 5 }, // Cantidad
        3: { columnWidth: 30, fontSize: 5 }, // IPO Consumo
        4: { columnWidth: 30, fontSize: 5 }, // Total
      },
      head: [exportColumnsVendidos],
      body: bodyColumnsVendidos(),
    });

    doc.save("Productos_Vendidos-" + moment().format("MMMM-DD-YYYY") + ".pdf");
  };

  const exportPdf = () => {
    new applyPlugin(jsPDF);
    const doc = new jsPDF("l", "px", "a4");
    doc.autoTable({
      styles: { backgroundColor: "0xFF525659", fontSize: 4 },
      columnStyles: {
        0: { columnWidth: 20, fontSize: 4 }, // Id
        1: { columnWidth: 24, fontSize: 4 }, // Fecha y Hora
        2: { columnWidth: 24, fontSize: 4 }, // Sede
        3: { columnWidth: 27, fontSize: 4 }, // Vendedor
        4: { columnWidth: 18, fontSize: 4 }, // IPO C.
        5: { columnWidth: 20, fontSize: 4 }, // Transferencia
        6: { columnWidth: 20, fontSize: 4 }, // Efectivo
        7: { columnWidth: 20, fontSize: 4 }, // Total Venta
        8: { columnWidth: 29, fontSize: 4 }, // Medio de Pago
        9: { columnWidth: 20, fontSize: 4 }, // Turno Caja
        10: { columnWidth: 22, fontSize: 4 }, // Turno Domicilio
        11: { columnWidth: 30, fontSize: 4 }, // Domiciliario
        12: { columnWidth: 22, fontSize: 4 }, // Valor Domicilio
        13: { columnWidth: 27, fontSize: 4 }, // Cliente
        14: { columnWidth: 25, fontSize: 4 }, // Municipio
        15: { columnWidth: 28, fontSize: 4 }, // Barrio
        16: { columnWidth: 30, fontSize: 4 }, // Direccion
        17: { columnWidth: 30, fontSize: 4 }, // Punto Referencia
        18: { columnWidth: 28, fontSize: 4 }, // Telefono
        19: { columnWidth: 28, fontSize: 4 }, // Telefono2
        20: { columnWidth: 30, fontSize: 4 }, // Comentarios
        21: { columnWidth: 30, fontSize: 4 }, // Motivo cancelación
        22: { columnWidth: 28, fontSize: 4 }, // Estado
        23: { columnWidth: 24, fontSize: 4 }, // Ultimo Movimiento
        24: { columnWidth: 24, fontSize: 4 }, // Hora de Entrega
      },
      head: [exportColumns],
      body: bodyColumns(),
    });

    doc.save("Reporte-" + moment().format("MMMM-DD-YYYY") + ".pdf");
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

  //opciones de impresión
  const imprimirReporte = async (key) => {
    switch (key) {
      case 1:
        const productos = bodyColumnsVendidos();
        try {
          if (
            productos.length > 0 &&
            (!utils.tirilla ||
              formatearTimestamp(utils.tirilla.fecha).getDate() !=
                date.getDate())
          ) {
            await firebase.db.collection("informes").add({
              fecha: date,
              productos: stringify(productos),
              consecutivo: utils.consecutivo,
            });
          }
        } finally {
          handlePrint();
        }
        break;
      case 2:
        exportFileCsv();
        break;
      case 3:
        exportFilePDF();
        break;
    }
    setReport(false);
  };

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
                {item.nombre}{" "}
                <Badge color="success" pill>
                  x{item.cantidad}
                </Badge>
              </text>
              {item.categoria !== "Crudos" && (
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
    <div className="contain reporte">
      <div className="div-btn-inicio">
        <Link to="/inicio">
          <img className="img-inicio" src={home} alt="inicio" />
        </Link>
      </div>
      <div className="div-btn-accion filter-fechas">
        <div className="w-64">
          <DatePicker
            label="FILTRO DE FECHAS"
            value={date}
            maxDate={new Date(2030, 12, 31)}
            minDate={new Date(2018, 1, 1)}
            isCentered={true}
            selectionType="single"
            variant="double"
            onChange={(value) => setDate(value)}
          />
        </div>
      </div>
      <div className="hidden">
        <ComponentToPrint
          ref={componentPrint}
          data={vendidos}
          ventas={data}
          fecha={date}
          consecutivo={utils.tirilla.consecutivo || utils.consecutivo}
        />
      </div>
      <Modal className="flex items-center h-screen" isOpen={modal}>
        <ModalHeader className="modal-header">Detalle Pedido</ModalHeader>
        <ModalBody className="modal-detalle-ped">{detalleVenta()}</ModalBody>
        <ModalFooter className="modal-boton">
          <Button onClick={() => setModal(false)}>Cerrar</Button>
        </ModalFooter>
      </Modal>
      <Modal className="flex items-center h-screen" isOpen={report}>
        <ModalBody className="modal-detalle-ped">
          <table className="flex justify-center">
            <tbody>
              <tr>
                <td>
                  <Button
                    className="m-1"
                    color="info"
                    onClick={() => imprimirReporte(1)}
                  >
                    <TiPrinter size="md" />
                  </Button>
                </td>
                <td>
                  <Button
                    className="m-1"
                    color="success"
                    onClick={() => imprimirReporte(2)}
                  >
                    <SiMicrosoftexcel size="md" />
                  </Button>
                </td>
                <td>
                  <Button
                    className="m-1"
                    color="danger"
                    onClick={() => imprimirReporte(3)}
                  >
                    <AiOutlineFilePdf size="md" />
                  </Button>
                </td>
              </tr>
            </tbody>
          </table>
        </ModalBody>
        <ModalFooter className="modal-boton">
          <Button onClick={() => setReport(false)}>Cerrar</Button>
        </ModalFooter>
      </Modal>
      <div className="tbl-container">
        <MaterialTable
          responsive={true}
          columns={colunm}
          data={newData}
          title={"REPORTES"}
          parentChildData={(row, rows) => rows.find((a) => a.id === row.sede)}
          actions={[
            {
              icon: "print",
              tooltip: "Reporte Por Productos",
              isFreeAction: true,
              onClick: () => setReport(true),
            },
          ]}
          options={{
            exportButton: true,
            exportCsv,
            exportPdf,
            sorting: true,
            minBodyHeight: 360,
            // maxBodyHeight: 470,
            headerStyle: {
              backgroundColor: "#FFF1E0",
              color: "#ff9100",
              fontSize: 16,
            },
          }}
          localization={{
            toolbar: {
              searchPlaceholder: "Buscar",
              searchTooltip: "Buscar",
              exportCSVName: "Exportar a CSV",
              exportPDFName: "Exportar a PDF",
              exportTitle: "Exportar",
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
      </div>
    </div>
  );
}
export default Reportes;
