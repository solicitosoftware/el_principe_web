import React from "react";
import { Button, Modal, ModalBody, ModalFooter } from "reactstrap";
import { FaUsers } from "react-icons/fa";
import { FaUsersCog } from "react-icons/fa";
import { GiReceiveMoney } from "react-icons/gi";
import { BiSupport } from "react-icons/bi";
import { GiHistogram } from "react-icons/gi";

function MenuBase({ redirect, changeModal, options, isOpen = false }) {
  const renderIcon = (key) => {
    switch (key) {
      case "clientes":
        return <FaUsers size={180} />;
      case "empleados":
        return <FaUsersCog size={180} />;
      case "punto de venta":
        return <GiReceiveMoney size={180} />;
      case "domicilios":
      case "caja domicilios":
        return <BiSupport size={180} />;
      case "historial domicilios":
        return <GiHistogram size={180} />;
      default:
        break;
    }
  };

  return (
    <Modal
      scrollable
      className="flex items-center"
      style={{ height: "90vh" }}
      isOpen={isOpen}
    >
      <ModalBody className="modal-detalle-ped">
        <table className="flex justify-center">
          <tbody>
            <tr>
              {options.map((item, index) => {
                return (
                  <td key={"menu" + index}>
                    <Button
                      className="m-1"
                      color="info"
                      onClick={() => redirect(item.ruta)}
                    >
                      {renderIcon(item.name)}
                      {item.name.toUpperCase()}
                    </Button>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </ModalBody>
      <ModalFooter className="modal-boton">
        <Button onClick={() => changeModal()}>Cerrar</Button>
      </ModalFooter>
    </Modal>
  );
}

export default MenuBase;
