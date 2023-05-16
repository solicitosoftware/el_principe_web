import React, { useState } from "react";
import { ListGroupItem, Input } from "reactstrap";
import NumberFormat from "react-number-format";
import { BsTrash } from "react-icons/bs";
import { formatoPrecio } from "../utils";
import Messages from "../utils/message";

function PedidoActual({ producto, eliminar, modificarCantidad }) {
  const [open, setOpen] = useState(false);

  const [error, setError] = useState("");

  //Metodo para seleccionar una salsa
  function salsas() {
    const { bbq, rosa, pina } = producto.salsas;
    let detalle = [];
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

  //Metodo para eliminar un producto de la caja
  function eliminarProducto() {
    setError(`¿Desea eliminar este producto, ${producto.nombre}?`);
    setOpen(true);
  }

  function handleClose() {
    setOpen(false);
  }

  function handleProcesar() {
    eliminar(producto);
    setOpen(false);
  }

  //Metodo para modificar las cantidades
  function handlecantidad(e) {
    const cantidad = parseInt(e.target.value);
    if (cantidad === 0) {
      eliminar(producto);
    } else if (cantidad) {
      modificarCantidad(producto, cantidad);
    }
  }

  function validarCantidad(e) {
    if (!e.target.value) {
      e.target.value = producto.cantidad;
    }
  }

  let total = producto.cantidad * producto.precio;
  let salsa = salsas();
  return (
    <ListGroupItem>
      <div className="flex flex-row justify-between items-center">
        <div className="flex flex-col">
          <text className="txt-producto">{producto.nombre}</text>
          {producto.categoria.salsas && (
            <text className="txt-producto">
              {salsa.length > 0 ? `Salsas:${salsa}` : "Sin salsas"}
            </text>
          )}
          <text className="txt-producto">Precio: {formatoPrecio(total)}</text>
        </div>
        <div className="div-pedido-cantidad">
          <div className="flex-grow">
            <NumberFormat
              allowNegative={false}
              customInput={Input}
              isNumericString={true}
              id="cantidad"
              value={producto.cantidad}
              onChange={handlecantidad}
              onBlur={validarCantidad}
            />
          </div>
          <div className="flex-grow ml-1">
            <BsTrash onClick={eliminarProducto} size={30} color="red" />
          </div>
        </div>
      </div>
      <div>
        <Messages
          abrir={open}
          title="PRODUCTOS"
          mensaje={error}
          cerrar={handleClose}
          procesar={handleProcesar}
          confirmar={true}
        />
      </div>
    </ListGroupItem>
  );
}

export default PedidoActual;
