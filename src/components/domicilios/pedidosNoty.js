import { formatoPrecio } from "../utils";
import ListItem from "@material-ui/core/ListItem";
import { Button } from "reactstrap";
import "moment/locale/es";

const PedidosNoty = ({ pedido, key, agregar, cancelar }) => {
  const moment = require("moment");

  const detallePedido = () => {
    const { productos } = pedido;
    let detalle = "";
    productos.map((item, index) => {
      detalle = detalle + `${item.nombre} x ${item.cantidad}`;
      if (productos.length > 1 && index + 1 < productos.length) {
        detalle = detalle + ` || `;
      }
    });
    return detalle;
  };

  //componenete para listar las notificaciones
  return (
    <ListItem className="border-t-2" key={key}>
      <div
        style={{ cursor: "pointer" }}
        className="flex flex-row justify-between items-center"
      >
        <div className="flex flex-col">
          <text className="txt-producto">
            <text className="font-weight-bold">Hora: </text>
            {moment(pedido.fecha.toDate()).format("h: mm a")}
          </text>
          <text className="txt-producto">
            <text className="font-weight-bold">Cliente: </text>
            {`${pedido.cliente.nombre} - ${pedido.cliente.telefono}`}
          </text>
          <text className="txt-producto">
            <text className="font-weight-bold">Dirección: </text>
            {`${pedido.cliente.direccion} ${pedido.cliente.barrio.nombre}-${pedido.cliente.barrio.municipio.nombre}`}
          </text>
          {pedido.observaciones && (
            <text className="txt-producto">
              <text className="font-weight-bold">Comentarios: </text>
              {pedido.observaciones}
            </text>
          )}
          <text className="txt-producto">
            <text className="font-weight-bold">Metodo Pago: </text>
            {pedido.medioPago.toUpperCase()}
          </text>
          <text className="txt-producto">
            <text className="font-weight-bold">Precio: </text>
            {formatoPrecio(pedido.total)}
          </text>
          <text className="txt-producto">
            <text className="font-weight-bold">Productos: </text>
            {detallePedido()}
          </text>

          <div className="modal-boton-noty">
            <Button onClick={() => cancelar(pedido)}>Cancelar</Button>
            <Button onClick={() => agregar(pedido)}>Agregar</Button>
          </div>
        </div>
      </div>
    </ListItem>
  );
};

export default PedidosNoty;
