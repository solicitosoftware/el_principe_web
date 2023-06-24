import React from "react";
import { Button } from "reactstrap";
import { DatePicker } from "react-rainbow-components";
import "../../css/general.css";
import { GiExitDoor } from "react-icons/gi";
import { useDispatch } from "react-redux";
import { logout } from "../../redux/reducers/loginReducer";

function ContainerBase({ children, date, handleDate, eliminar, button = [] }) {
  const dispatch = useDispatch();

  return (
    <div className="contain general">
      <div className="div-btn-inicio">
        <GiExitDoor
          className="cursor"
          size="5em"
          onClick={() => dispatch(logout())}
        />
      </div>
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
      <div className="tbl-container">{children}</div>
      {button.length > 0 && (
        <div className="div-btn-accion">
          <Button
            onClick={() => eliminar()}
          >{`Procesar Pedidos (${button.length})`}</Button>
        </div>
      )}
    </div>
  );
}

export default ContainerBase;
