import React, { useState, useEffect, useRef, useCallback } from "react";
import "../../css/general.css";
import ContainerBase from "../dashboard/containerBase";
import TableBase from "../dashboard/tableBase";
import { formatearTimestamp, formatoPrecio, salsas } from "../utils";
import { CsvBuilder } from "filefy";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { useReactToPrint } from "react-to-print";
import { ComponentToPrint } from "./ventasDiarias";
import { colunm } from "./columsTable";
import { Button, Badge, Modal, ModalBody, ModalFooter } from "reactstrap";
import { AiOutlineFilePdf } from "react-icons/ai";
import { TiPrinter } from "react-icons/ti";
import { SiMicrosoftexcel } from "react-icons/si";
import "moment/locale/es";
import stringify from "json-stable-stringify";
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import {
  initialPedidos,
  obtenerPedidoAsync,
} from "../../redux/reducers/pedidosReducer";
import { disenoToast } from "../dashboard/disenoToastBase";
import {
  initialUtils,
  estadoProceso,
  obtenerTirillaAsync,
  actualizarTirillaAsync,
  crearTirillaAsync,
} from "../../redux/reducers/utilsReducer";

function Reportes() {
  const moment = require("moment");

  const dispatch = useDispatch();

  const [date, setDate] = useState(new Date());

  const estado = useSelector(estadoProceso);

  const pedidos = useSelector(initialPedidos);

  const utils = useSelector(initialUtils);

  const [vendidos, setVendidos] = useState(null);

  const [consecutivo, setConsecutivo] = useState(0);

  const [modalReport, setModalReport] = useState(false);

  const componentPrint = useRef();

  const handlePrint = useReactToPrint({
    content: () => componentPrint.current,
  });

  useEffect(() => {
    if (!estado.isLoading) {
      if (estado.success) {
        obtenerTirilla();
      } else if (estado.error) {
        toast.error(estado.error, disenoToast);
      }
    }
  }, [dispatch, estado]);

  const obtenerTirilla = () => {
    const endOfToday = moment(date).endOf("day");
    dispatch(obtenerTirillaAsync(endOfToday));
  };

  const cargarPedidos = useCallback(() => {
    const startOfToday = moment(date).startOf("day");
    const endOfToday = moment(date).endOf("day");
    dispatch(obtenerPedidoAsync({ startOfToday, endOfToday }));
    obtenerTirilla();
  }, [dispatch, date]);

  useEffect(() => {
    cargarPedidos();
  }, [cargarPedidos]);

  const cargarConsecutivo = useCallback(() => {
    if (Object.values(utils.tirilla).length > 0) {
      consecutivo === 0 && setConsecutivo(utils.tirilla.consecutivo + 1);
    }
  }, [utils]);

  useEffect(() => {
    cargarConsecutivo();
  }, [cargarConsecutivo]);

  useEffect(async () => {
    obtenerProductosVendidos();
  }, [pedidos]);

  const boletaExistente = () => {
    if (Object.values(utils.tirilla).length > 0) {
      const formattedDate1 = new Date(
        formatearTimestamp(utils.tirilla.fecha)
      ).toLocaleDateString();
      const formattedDate2 = new Date(date).toLocaleDateString();
      if (formattedDate1 === formattedDate2) {
        return true;
      }
    }
    return false;
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

  const exportVendidosCsv = () => {
    setModalReport(false);
    new CsvBuilder(`Productos-vendidos-${moment().format("MMMM-DD-YYYY")}.csv`)
      .setDelimeter(";")
      .setColumns(exportColumnsVendidos)
      .addRows(bodyColumnsVendidos())
      .exportFile();
  };

  const exportVendidosPdf = () => {
    setModalReport(false);
    const doc = new jsPDF("l", "px", "a4");
    const startY = 40;
    const pageWidth = doc.internal.pageSize.getWidth();
    const columnWidth = pageWidth / exportColumnsVendidos.length;
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
          formatoPrecio(precio, "."),
          cantidadTotal,
          formatoPrecio(ipoconsumo, "."),
          formatoPrecio(total, "."),
        ];
      } else {
        return [
          "Domicilios",
          null,
          cantidadTotal,
          null,
          formatoPrecio(total, "."),
        ];
      }
    });
    return exportedData;
  };

  const imprmirBoleta = () => {
    setModalReport(false);
    handlePrint();
    if (boletaExistente()) {
      dispatch(
        actualizarTirillaAsync({
          id: utils.tirilla.id,
          productos: stringify(vendidos),
        })
      );
    } else {
      dispatch(
        crearTirillaAsync({
          productos: stringify(vendidos),
          consecutivo,
          fecha: date,
        })
      );
    }
  };

  return (
    <ContainerBase
      componente="reportes"
      loading={estado.isLoading}
      date={date}
      handleDate={(value) => setDate(value)}
    >
      <ToastContainer />
      <div className="hidden">
        {vendidos && (
          <ComponentToPrint
            ref={componentPrint}
            data={vendidos}
            fecha={date}
            ventas={pedidos}
            consecutivo={
              boletaExistente() ? utils.tirilla.consecutivo : consecutivo
            }
          />
        )}
      </div>
      <TableBase
        loading={estado.isLoading}
        componente="reportes"
        datos={pedidos}
        columnas={colunm}
        obtener={() => cargarPedidos()}
        imprimir={() => setModalReport(true)}
        // detailPanel={detallePedido}
      />
      <Modal className="flex items-center h-screen" isOpen={modalReport}>
        <ModalBody className="modal-detalle-ped">
          <table className="flex justify-center">
            <tbody>
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
