import React, { useCallback, useContext, useEffect, useState } from "react";
import "../../css/general.css";
import { GiExitDoor } from "react-icons/gi";
import { FcApproval } from "react-icons/fc";
import { FirebaseContext } from "../../firebase";
//Imagenes
import pedido from "../../images/iconos/btn-caja.png";
import domicilio from "../../images/iconos/btn-domicilios.png";
import producto from "../../images/iconos/btn-productos.png";
import categoria from "../../images/iconos/btn-categoria.png";
import reporte from "../../images/iconos/btn-reportes.png";
import cliente from "../../images/iconos/btn-usuarios.png";
import MenuBase from "../dashboard/menuBase";
import useSessionStorage from "../utils/useSessionStorage";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { obtenerBarrioAsync } from "../../redux/reducers/barriosReducer";
import { obtenerCategoriaAsync } from "../../redux/reducers/categoriasReducer";
import { obtenerEmpleadoAsync } from "../../redux/reducers/empleadosReducer";
import { obtenerMunicipioAsync } from "../../redux/reducers/municipiosReducer";
import { obtenerProductoAsync } from "../../redux/reducers/productosReducer";
import { Modal, ModalBody, ModalHeader } from "reactstrap";
import ReactLoading from "react-loading";
import { obtenerUsuarioAsync } from "../../redux/reducers/usuariosReducer";
import useUsuarioPermisos from "../utils/usuarioPermisos";

function Home() {
  const { firebase } = useContext(FirebaseContext);

  const dispatch = useDispatch();

  const navigate = useNavigate();

  const initialLogin = {
    id: null,
    token: false,
    rol: 1,
    sede: null,
  };

  const [login, setLogin] = useSessionStorage("login", initialLogin);

  const permisosRol = useUsuarioPermisos();

  const generalState = useSelector((state) => state);

  const [modal, setModal] = useState(false);

  const [modalData, setModalData] = useState(false);

  const [data, setData] = useState([]);

  const [menu, setMenu] = useState([]);

  useEffect(() => {
    const { barrios, categorias, empleados, municipios, productos, usuarios } =
      generalState;
    setData(
      Object.entries({
        barrios,
        categorias,
        empleados,
        municipios,
        productos,
        usuarios,
      })
    );
    if (barrios.value.length === 0 && barrios.estado.isLoading === false) {
      dispatch(obtenerBarrioAsync());
    }
    if (
      categorias.value.length === 0 &&
      categorias.estado.isLoading === false
    ) {
      dispatch(obtenerCategoriaAsync());
    }
    if (empleados.value.length === 0 && empleados.estado.isLoading === false) {
      dispatch(obtenerEmpleadoAsync());
    }
    if (
      municipios.value.length === 0 &&
      municipios.estado.isLoading === false
    ) {
      dispatch(obtenerMunicipioAsync());
    }
    if (productos.value.length === 0 && productos.estado.isLoading === false) {
      dispatch(obtenerProductoAsync());
    }
    if (
      Object.values(usuarios.value).length === 0 &&
      usuarios.estado.isLoading === false
    ) {
      dispatch(obtenerUsuarioAsync(login.id));
    }
  }, [generalState, dispatch]);

  const ocultarModalDatos = useCallback(() => {
    const ocultar = data.some((x) => x[1].estado.isLoading === true);
    setModalData(ocultar);
  }, [data]);

  useEffect(() => {
    ocultarModalDatos();
  }, [ocultarModalDatos]);

  //Metodo para cerrar sesión
  const logout = () => {
    firebase.auth.signOut().then(() => {
      setLogin(initialLogin);
      navigate("/");
    });
  };

  const handleModal = () => {
    setModal(!modal);
  };

  const handleRedirect = (value) => {
    handleModal();
    navigate(`/${value}`);
  };

  const handleOptionMenu = (key) => {
    switch (key) {
      case "usuarios":
        setMenu([
          {
            name: "clientes",
            ruta: "clientes",
          },
          {
            name: "empleados",
            ruta: "empleados",
          },
        ]);
        break;
      case "pedidos":
        setMenu([
          {
            name: "punto de venta",
            ruta: "puntoVenta",
          },
          {
            name: "caja domicilios",
            ruta: "pedidos",
          },
        ]);
        break;
      case "domicilios":
        setMenu([
          {
            name: "domicilios",
            ruta: "domicilios",
          },
          {
            name: "historial domicilios",
            ruta: "historialDomicilios",
          },
        ]);
        break;
      default:
        setMenu([]);
        break;
    }
    handleModal();
  };

  const renderDatos = () => {
    return (
      <table className="flex flex-col m-2">
        <tbody>
          {data.map((item, index) => {
            return (
              <tr key={"campo_" + index} className="flex justify-between mb-3">
                <>
                  <div>
                    <h5>{item[0].toUpperCase()}</h5>
                    <p style={{ fontSize: 14 }}>
                      {`${Intl.NumberFormat("es-CO").format(
                        item[1].value.length || 0
                      )}
                    Registros`}
                    </p>
                  </div>
                  {!item[1]?.estado.isLoading && item[1].value.length > 0 ? (
                    <FcApproval size={30} />
                  ) : (
                    <ReactLoading
                      width={30}
                      height={30}
                      type="spinningBubbles"
                      color="#ed8936"
                    />
                  )}
                </>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  return (
    <div className="contain home">
      <div className="p-4 cursor-pointer logout md:h-screen">
        <GiExitDoor size="5em" onClick={() => logout()} />
      </div>
      <div className="logo" />
      <div className="div-block">
        {permisosRol?.pedidos && (
          <img
            src={pedido}
            alt="pedidos"
            onClick={() =>
              permisosRol.pedidos?.puntoVenta
                ? permisosRol.pedidos?.domicilios
                  ? handleOptionMenu("pedidos")
                  : handleRedirect("puntoVenta")
                : handleRedirect("pedidos")
            }
          />
        )}

        {(permisosRol?.domicilios || permisosRol?.historialdomicilios) && (
          <img
            src={domicilio}
            alt="domicilios"
            onClick={() =>
              permisosRol?.domicilios
                ? permisosRol?.historialdomicilios
                  ? handleOptionMenu("domicilios")
                  : handleRedirect("domicilios")
                : handleRedirect("historialDomicilios")
            }
          />
        )}

        {permisosRol?.productos && (
          <img
            src={producto}
            alt="productos"
            onClick={() => handleRedirect("productos")}
          />
        )}
      </div>

      <div className="div-block-1">
        {permisosRol?.categorias && (
          <img
            src={categoria}
            alt="categorias"
            onClick={() => handleRedirect("categorias")}
          />
        )}

        {permisosRol?.reportes && (
          <img
            src={reporte}
            alt="reportes"
            onClick={() => handleRedirect("reportes")}
          />
        )}

        {(permisosRol?.clientes || permisosRol?.empleados) && (
          <img
            src={cliente}
            alt="clientes"
            onClick={() =>
              permisosRol?.clientes
                ? permisosRol?.empleados
                  ? handleOptionMenu("usuarios")
                  : handleRedirect("clientes")
                : handleRedirect("empleados")
            }
          />
        )}
      </div>
      {modalData ? (
        <Modal
          scrollable
          className="flex items-center"
          style={{ height: "90vh" }}
          isOpen={modalData}
        >
          <ModalHeader className="modal-header">DATOS DEL SISTEMA</ModalHeader>
          <ModalBody className="modal-detalle-ped">{renderDatos()}</ModalBody>
        </Modal>
      ) : (
        <MenuBase
          isOpen={modal}
          changeModal={handleModal}
          options={menu}
          redirect={handleRedirect}
        />
      )}
    </div>
  );
}
export default Home;
