import React, { useState } from "react";
import PropTypes from "prop-types";
import { formatoPrecio } from "../utils";
import { Input } from "reactstrap";
import NumberFormat from "react-number-format";
import "../../css/general.css";
import { Button, ButtonGroup } from "reactstrap";
import { IoWaterOutline } from "react-icons/io5";
import { initialCategorias } from "../../redux/reducers/categoriasReducer";
import { useSelector } from "react-redux";

function ProductoPedido({ producto, guardar, editar }) {
  const [bbq, setBbq] = useState(true);
  const [rosa, setRosa] = useState(true);
  const [pina, setPina] = useState(true);
  const categorias = useSelector(initialCategorias);
  const categoriaProducto =
    categorias.find((x) => x.id === producto.categoria.id) ||
    producto.categoria;

  //metodo para agregar un producto al pedido
  function agregarProducto(params) {
    let actual = { ...params };
    actual.cantidad = 1;
    actual.salsas = {};
    if (actual.categoria.salsas) {
      actual.salsas = {
        bbq: bbq,
        rosa: rosa,
        pina: pina,
      };
    }
    guardar(actual);
    limpiar();
  }

  function limpiar() {
    if (!bbq) {
      setBbq(true);
    }
    if (!rosa) {
      setRosa(true);
    }
    if (!pina) {
      setPina(true);
    }
  }

  function handlecantidad(e) {
    const cantidad = parseInt(e.target.value);
    producto.precio = cantidad > 0 ? cantidad : 0;
  }

  const nombre =
    producto.nombre.length >= 23
      ? producto.nombre.slice(0, 20) + "..."
      : producto.nombre;
  return (
    <div
      className={`div-productos-${!editar ? "lista" : "lista-modificar"} p-1`}
    >
      <div
        className="flex-col bg-white"
        style={{ borderWidth: !editar ? 6 : 2, borderRadius: "5%" }}
      >
        {!editar && (
          <img
            className="img-pedido"
            src={`${process.env.PUBLIC_URL}/assets/productos/${
              producto.id.split("-")[0]
            }.jpg`}
            alt="producto"
            onClick={() => agregarProducto(producto)}
          />
        )}
        <div className="p-2 flex flex-col text-left">
          <text
            className={`text-${
              !editar ? "md" : nombre.length > 15 ? "xs" : "sm"
            } text-center font-bold`}
          >
            {nombre.toUpperCase()}
          </text>
          {categoriaProducto?.salsas === true ? (
            <ButtonGroup className="mt-1">
              <Button
                onClick={() => setBbq(!bbq)}
                style={{
                  backgroundColor: bbq === true ? "#A93226" : "",
                  color: "white",
                }}
                color={bbq === true ? null : "secondary"}
              >
                <IoWaterOutline />
              </Button>
              <Button
                onClick={() => setRosa(!rosa)}
                style={{
                  backgroundColor: rosa === true ? "#FE73B9" : "",
                  color: "white",
                }}
                color={rosa === true ? null : "secondary"}
              >
                <IoWaterOutline />
              </Button>
              <Button
                onClick={() => setPina(!pina)}
                style={{ color: "white" }}
                color={pina === true ? "warning" : "secondary"}
              >
                <IoWaterOutline />
              </Button>
            </ButtonGroup>
          ) : (
            <ButtonGroup className="mt-1">
              <Button
                size="sm"
                style={{ backgroundColor: "#ed8936", color: "white" }}
                color={null}
              >
                <text className="text-xs text-center">
                  {categoriaProducto?.nombre.toUpperCase()}
                </text>
              </Button>
            </ButtonGroup>
          )}
          <div className="div-agregar">
            {producto?.modificar ? (
              <NumberFormat
                className="mr-3"
                allowNegative={false}
                customInput={Input}
                isNumericString={true}
                id="interno"
                value={producto.precio}
                onChange={handlecantidad}
              />
            ) : (
              <text
                className={`text-${
                  !editar ? "lg" : "sm"
                } font-bold text-green-600`}
              >
                {formatoPrecio(producto.precio)}
              </text>
            )}
            <Button
              size={editar ? "sm" : "md"}
              onClick={() => agregarProducto(producto)}
              color="success"
            >
              Agregar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

ProductoPedido.propTypes = {
  producto: PropTypes.object.isRequired,
  editar: PropTypes.bool.isRequired,
};

ProductoPedido.defaultProps = {
  editar: false,
  producto: {},
};

export default ProductoPedido;
