import React from "react";
import { formatearTimestamp, formatoPrecio } from "./";
import "moment/locale/es";

//componente para imprimir las facturas
export class ComponentToPrint extends React.PureComponent {
  renderSalsas(value) {
    if (value) {
      let detalle = [];
      if (value.some((x) => x.salsas.bbq)) {
        detalle.push(" Bbq");
      }
      if (value.some((x) => x.salsas.rosa)) {
        detalle.push(" Rosada");
      }
      if (value.some((x) => x.salsas.pina)) {
        detalle.push(" Piña");
      }
      return [...detalle];
    }
  }

  render() {
    const moment = require("moment");
    const {
      fecha,
      productos,
      total,
      turno,
      turnoDomicilio,
      usuario,
      cliente,
      observaciones,
      ipoconsumo,
      recibido,
      detallePago,
      medioPago,
    } = this.props.data;
    let formatFecha = new Date();
    let subtotal = total - ipoconsumo;
    if (cliente) {
      subtotal -= cliente.barrio.valor;
    }
    let salsas = this.renderSalsas(productos);
    let validarSalsas = productos && productos.some((x) => x.categoria.salsas);
    if (fecha && (fecha.seconds || fecha._seconds)) {
      formatFecha = formatearTimestamp(fecha);
    }
    return (
      <div className="flex flex-col text-center w-1/3">
        <text className="font-bold">BOMBONES DE POLLO EL PRINCIPE</text>
        <text className="font-bold">NIT: 15.325.640</text>
        <text className="font-bold">REGIMEN COMUN</text>
        <text className="text-center">
          REG: {moment(formatFecha).format("LLL").toUpperCase()}
        </text>
        <text>DOCUMENTO EQUIVALENTE</text>
        <text>CALLE 44 # 49-20 ITAGUI</text>
        <text>TEL: 322-91-44</text>
        <br />
        {(turno || turnoDomicilio) && (
          <text className="font-bold text-xl">
            TURNO: #{cliente ? turnoDomicilio : turno}
          </text>
        )}
        <div className="flex flex-col justify-between text-left m-3">
          {cliente && (
            <div className="flex flex-col">
              <text>Cajero: {usuario}</text>
              <text>Cliente: {cliente && cliente.nombre}</text>
              <text>
                Dirección:{" "}
                <text className="font-bold text-lg">
                  {cliente && cliente.direccion}{" "}
                  {cliente && cliente.barrio.nombre}-
                  {cliente && cliente.barrio.municipio.nombre}
                </text>
              </text>
              <text>
                Punto de Referencia:{" "}
                <text className="font-bold text-lg">
                  {cliente && cliente.puntoRef}
                </text>
              </text>
              <text>
                Teléfono:{" "}
                <text className="font-bold text-lg">
                  {cliente && cliente.telefono}
                </text>
              </text>
              {cliente && cliente.telefono2 && (
                <text>
                  Teléfono Secundario:{" "}
                  <text className="font-bold text-lg">{cliente.telefono2}</text>
                </text>
              )}
              {/* <text>Comentarios: <text className="font-bold text-lg">{observaciones}</text></text> */}
            </div>
          )}
          <br />
          <table>
            <thead>
              <tr>
                <th>CANTIDAD</th>
                <th className="text-center">PRODUCTO</th>
                <th className="text-right">UND.</th>
                <th className="text-right">TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {productos &&
                productos.map((item) => {
                  const salsasProd = this.renderSalsas([item]);
                  return (
                    <>
                      <tr>
                        <td className="text-center">{item.cantidad}</td>
                        <td>{item.nombre}</td>
                        <td className="text-right">
                          {formatoPrecio(item.precio)}
                        </td>
                        <td className="text-right">
                          {formatoPrecio(item.precio * item.cantidad)}
                        </td>
                      </tr>
                      <tr>
                        {item.categoria.salsas && (
                          <td colspan="4" className="pl-24 pb-2">
                            {salsasProd.length > 0
                              ? `Salsa: ${salsasProd}`
                              : "Sin Salsas"}
                          </td>
                        )}
                      </tr>
                    </>
                  );
                })}
            </tbody>
          </table>
          <br />
          {cliente && (
            <div className="flex flex-row justify-between">
              <text>Domicilio</text>
              <text>{formatoPrecio(cliente && cliente.barrio.valor)}</text>
            </div>
          )}
          <div className="flex flex-row justify-between">
            <text>Subtotal</text>
            <text>{formatoPrecio(subtotal)}</text>
          </div>
          <div className="flex flex-row justify-between">
            <text>IPO Consumo</text>
            <text>{formatoPrecio(ipoconsumo)}</text>
          </div>
          <div className="font-bold flex flex-row justify-between">
            <text>Total</text>
            <text>{formatoPrecio(total)}</text>
          </div>
          <text className="text-lg text-right mt-3">
            {medioPago === "parcial" &&
              detallePago &&
              detallePago.efectivo > 0 && (
                <div className="flex flex-row justify-between">
                  <text>EFECTIVO</text>
                  <text>{formatoPrecio(detallePago.efectivo)}</text>
                </div>
              )}
            {detallePago
              ? medioPago !== "efectivo" &&
                detallePago.transferencia > 0 && (
                  <div className="flex flex-row justify-between font-bold">
                    <text>TRANSFERENCIA</text>
                    <text>{formatoPrecio(detallePago.transferencia)}</text>
                  </div>
                )
              : medioPago === "transferencia" && (
                  <div className="flex flex-row justify-between font-bold">
                    <text>TRANSFERENCIA</text>
                    <text>{formatoPrecio(total)}</text>
                  </div>
                )}
          </text>
          {recibido && (
            <div>
              <br />
              <div className="flex flex-row justify-between">
                <text>Recibido</text>
                <text>{formatoPrecio(recibido)}</text>
              </div>
              <div className="flex flex-row justify-between">
                <text>Devuelta</text>
                <text>{formatoPrecio(recibido - detallePago.efectivo)}</text>
              </div>
            </div>
          )}
          {cliente && validarSalsas && (
            <div>
              <br />
              <div className="flex flex-row justify-between">
                <text>Salsas:</text>
                <text className="font-bold text-lg">
                  {salsas.length > 0 ? salsas : "Sin Salsas"}
                </text>
              </div>
            </div>
          )}
          {cliente && (
            <div className="flex flex-row justify-between">
              <text>Comentarios:</text>
              <text className="font-bold text-lg">{observaciones}</text>
            </div>
          )}
          <br />
          <text className="text-center">siguenos en nuestras redes</text>
          <text className="text-center">Facebook: bomboneselprincipe</text>
          <text className="text-center">Instagram: @bomboneselprincipe</text>
        </div>
      </div>
    );
  }
}
