import React from "react";
import { formatoPrecio } from "../utils/index";
import { Table } from "reactstrap";
import "moment/locale/es";

//componente para imprimir las ventas diarias
export class ComponentToPrint extends React.PureComponent {
  render() {
    const moment = require("moment");
    const datos = this.props.data.map((rowData) => {
      let total = 0;
      let ipoconsumo = 0;
      let cantidadTotal = 0;
      const { nombre, precio, categoria } = rowData[0];
      rowData.map((item) => {
        const { precio, cantidad, categoria } = item;
        cantidadTotal = cantidadTotal + cantidad;
        total += precio * cantidad;
        if (categoria === "Fritos" || categoria === "Gaseosas") {
          ipoconsumo += precio * cantidad * 0.08;
        }
      });

      if (categoria) {
        return {
          nombre,
          precio,
          cantidadTotal,
          ipoconsumo,
          total,
        };
      } else {
        return {
          nombre,
          precio: null,
          cantidadTotal,
          ipoconsumo: null,
          total,
        };
      }
    });
    const totalVd = datos.reduce(
      (sum, value) =>
        typeof value.total == "number" ? sum + value.total : sum,
      0
    );

    const IpoVd = datos.reduce(
      (sum, value) =>
        typeof value.ipoconsumo == "number" ? sum + value.ipoconsumo : sum,
      0
    );

    const totalIpo = datos.reduce(
      (sum, value) => (value.ipoconsumo > 0 ? sum + value.total : sum),
      0
    );

    let totalEfectivo = 0;
    let totalTransferencia = 0;

    this.props.ventas
      .filter((x) => x.estado != "Cancelado")
      .map((value) => {
        switch (value.medioPago) {
          case "efectivo":
            if (value?.cliente?.barrio?.valor) {
              if (value?.domiciliario?.rol !== 5) {
                totalEfectivo += value.total;
              } else {
                totalEfectivo += value.total - value?.cliente?.barrio?.valor;
              }
            } else {
              totalEfectivo += value.total;
            }
            break;
          case "transferencia":
            if (value?.cliente?.barrio?.valor) {
              if (value?.domiciliario?.rol !== 5) {
                totalTransferencia += value.total;
              } else {
                totalTransferencia +=
                  value.total - value?.cliente?.barrio?.valor;
              }
            } else {
              totalTransferencia += value.total;
            }
            break;
          default:
            if (value?.cliente?.barrio?.valor) {
              if (value?.domiciliario?.rol !== 5) {
                totalEfectivo += value.detallePago.efectivo;
                totalTransferencia += value.detallePago.transferencia;
              } else {
                totalEfectivo +=
                  value.detallePago.efectivo - value?.cliente?.barrio?.valor;
                totalTransferencia += value.detallePago.transferencia;
              }
            } else {
              totalEfectivo += value.detallePago.efectivo;
              totalTransferencia += value.detallePago.transferencia;
            }
            break;
        }
      });

    return (
      <div className="flex flex-col text-center w-1/2">
        <text className="font-bold">BOMBONES DE POLLO EL PRINCIPE</text>
        <text className="font-bold">NIT: 15.325.640</text>
        <text className="font-bold">REGIMEN COMUN</text>
        <text className="text-center">
          {moment(this.props.fecha).format("L").toUpperCase()}
        </text>
        <text>DOCUMENTO EQUIVALENTE</text>
        <text>CALLE 44 # 49-20 ITAGUI</text>
        <text>TEL: 322-91-44</text>
        <br />
        <text className="font-bold text-xl">
          CONSECUTIVO: #{this.props.consecutivo}
        </text>
        <div className="flex flex-col justify-between m-3">
          <Table striped bordered>
            <tbody>
              <td>CANTIDAD</td>
              <td>PRODUCTO</td>
              <td>IPO</td>
              <td>UND.</td>
              <td>TOTAL</td>
              {datos &&
                datos.map((item) => {
                  return (
                    <tr>
                      <td>{item.cantidadTotal}</td>
                      <td>{item.nombre}</td>
                      <td>{formatoPrecio(item.ipoconsumo)}</td>
                      <td>{formatoPrecio(item.precio)}</td>
                      <td>{formatoPrecio(item.total)}</td>
                    </tr>
                  );
                })}
            </tbody>
          </Table>
          <br />
          <div className="flex flex-row justify-between">
            <text>Total con IPO C.</text>
            <text>{formatoPrecio(totalIpo)}</text>
          </div>
          <div className="flex flex-row justify-between">
            <text>Total sin IPO C.</text>
            <text>{formatoPrecio(totalVd - totalIpo)}</text>
          </div>
          <br />

          <div className="flex flex-row justify-between">
            <text>Total Efectivo.</text>
            <text>{formatoPrecio(totalEfectivo)}</text>
          </div>
          <div className="flex flex-row justify-between">
            <text>Total Transferencia.</text>
            <text>{formatoPrecio(totalTransferencia)}</text>
          </div>
          <br />
          <div className="flex flex-row justify-between">
            <text>Subtotal</text>
            <text>{formatoPrecio(totalVd - IpoVd)}</text>
          </div>
          <div className="flex flex-row justify-between">
            <text>IPO Consumo</text>
            <text>{formatoPrecio(IpoVd)}</text>
          </div>
          <div className="flex flex-row justify-between">
            <text>TOTAL</text>
            <text className="font-bold">{formatoPrecio(totalVd)}</text>
          </div>
          <br />
        </div>
      </div>
    );
  }
}
