import React from "react";
import { Button } from "reactstrap";
import { Link } from "react-router-dom";
import { DatePicker } from "react-rainbow-components";
import PropTypes from "prop-types";
import Spinner from "../utils/spinner";
import home from "../../images/iconos/inc-home.png";
import "../../css/general.css";
import Campana from "../utils/campana";
import useUsuarioPermisos from "../utils/usuarioPermisos";

function ContainerBase({
  loading,
  modal,
  modalNoty,
  modalPen,
  modalDeudas,
  componente,
  children,
  date,
  handleDate,
  domicilios,
}) {
  const permisosRol = useUsuarioPermisos();

  const validarPermiso = (accion) => {
    const myComponent = !componente.includes("Punto Venta")
      ? `${componente.replace(" ", "").toLowerCase()}`
      : `${componente.replace(" ", "").replace(" ", "").toLowerCase()}`;
    const value =
      Object.values(permisosRol).length > 0 &&
      permisosRol[myComponent]?.[accion];
    return value;
  };

  return (
    <div className="contain general">
      <div className={`div-btn-${domicilios ? "inicio-notify" : "inicio"}`}>
        <Link to="/inicio">
          <img className="img-inicio" src={home} alt="inicio" />
        </Link>
        {domicilios && (
          <Campana
            width={35}
            color={"#122C34"}
            count={domicilios.length}
            modal={modalNoty}
          />
        )}
      </div>
      {validarPermiso("fecha") && date ? (
        <div className="div-btn-picker">
          <DatePicker
            formatStyle="large"
            value={date}
            maxDate={new Date(2030, 12, 31)}
            minDate={new Date(2018, 1, 1)}
            isCentered={true}
            selectionType="single"
            variant="double"
            onChange={(value) => handleDate(value)}
          />
        </div>
      ) : (
        <div className="div-btn-accion">
          {validarPermiso("crear") ? (
            <Button onClick={modal}>Crear {componente}</Button>
          ) : componente === "Domicilios" &&
            permisosRol?.domicilios?.pendientes ? (
            <>
              <Button onClick={modalPen}>Productos Pendientes</Button>
              {permisosRol?.deudas && (
                <Button onClick={modalDeudas} className="ml-3">
                  Deudas Domiciliarios
                </Button>
              )}
            </>
          ) : (
            <></>
          )}
        </div>
      )}

      <div className="tbl-container">{loading ? <Spinner /> : children}</div>
    </div>
  );
}

ContainerBase.propTypes = {
  loading: PropTypes.bool.isRequired,
};

export default ContainerBase;
