import React, { useEffect } from "react";
import "../../css/general.css";
import { FormGroup, Input, Button } from "reactstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import { FaUserCircle } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useSessionStorage from "../utils/useSessionStorage";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  loginUsuarioAsync,
  estadoProceso,
  logout,
  obtenerUsuarioAsync,
} from "../../redux/reducers/usuariosReducer";
import { disenoToast } from "../dashboard/disenoToastBase";
import ReactLoading from "react-loading";
import colors from "../utils/colors";

function Login() {
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const estado = useSelector(estadoProceso);

  const initialLogin = {
    id: null,
    token: false,
    rol: 1,
    sede: null,
  };

  const [login, setLogin] = useSessionStorage("login", initialLogin);

  //metodo para calcular pagina de inicio a mostrar
  useEffect(() => {
    const pathname = window.location.pathname;
    if (login.token) {
      navigate("/inicio");
    } else {
      dispatch(logout());
      if (pathname !== "/") {
        navigate("/");
      }
    }
  }, [login, navigate]);

  const formik = useFormik({
    initialValues: {
      correo: "",
      password: "",
    },
    validationSchema: Yup.object({
      correo: Yup.string()
        .required("El correo electrónico es obligatorio")
        .email("La direccion de correo es invalida"),
      password: Yup.string().required("La contraseña es obligatoria"),
    }),
  });

  const permiso = (data) => {
    const { estado, rol } = data;
    if (estado && rol !== 2 && rol !== 5) return true;
    return false;
  };

  //Metodo submit para el formulario del formik
  const handleSubmit = async () => {
    try {
      const result = await dispatch(loginUsuarioAsync(formik.values)).unwrap();
      if (result) {
        const empleado = await dispatch(
          obtenerUsuarioAsync(result.localId)
        ).unwrap();
        if (permiso(empleado)) {
          setLogin({
            id: result.localId,
            token: result.idToken,
            rol: empleado.rol,
            sede: empleado.sede,
          });
        } else {
          toast.error(
            "El usuario no tiene permisos para esta opción",
            disenoToast
          );
        }
      }
    } catch (error) {
      toast.error("Usuario y/o contraseña incorrectos", disenoToast);
    }
    limpiarDatos();
  };

  const limpiarDatos = () => {
    setTimeout(() => {
      formik.setFieldValue("correo", "", false);
      formik.setFieldValue("password", "", false);
      formik.errors = {};
    }, 100);
  };

  return (
    <div className="contain pedidos">
      <div className="flex h-screen flex-col self-center justify-center md:w-1/4">
        <div className="flex flex-col items-center m-10">
          <FaUserCircle size={170} color="#F7DC6F" />
        </div>
        <ToastContainer />
        <FormGroup>
          <Input
            type="text"
            placeholder="Ingresa el correo"
            id="correo"
            value={formik.values.correo}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
        </FormGroup>
        {formik.touched.correo && formik.errors.correo ? (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-2">
            <p className="mb-0">{formik.errors.correo}</p>
          </div>
        ) : null}
        <FormGroup className="mt-3">
          <Input
            type="password"
            placeholder="Ingresa la contraseña"
            id="password"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
        </FormGroup>
        {formik.touched.password && formik.errors.password ? (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-2">
            <p className="mb-0">{formik.errors.password}</p>
          </div>
        ) : null}
        <div className="modal-boton self-center mt-4">
          {!estado.isLoading ? (
            <Button onClick={handleSubmit}>Ingresar</Button>
          ) : (
            <ReactLoading
              type="spinningBubbles"
              width={50}
              color={colors.secundario}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;
