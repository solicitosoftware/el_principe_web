import React, { useEffect } from "react";
import "../../css/general.css";
import { FormGroup, Input, Button } from "reactstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import { FaUserCircle } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { disenoToast } from "../dashboard/disenoToastBase";
import ReactLoading from "react-loading";
import colors from "../utils/colors";
import {
  estadoProceso,
  enviarEmailAsync,
  loginUsuarioAsync,
  initialLogin,
} from "../../redux/reducers/loginReducer";

function Login() {
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const login = useSelector(initialLogin);

  const estado = useSelector(estadoProceso);

  useEffect(() => {
    if (!estado.isLoading) {
      if (estado.success) {
        toast.success(estado.success, disenoToast);
      } else if (estado.error) {
        toast.error(estado.error, disenoToast);
      }
      limpiarDatos();
    }
  }, [dispatch, estado]);

  useEffect(() => {
    if (login) {
      navigate("/Reportes");
    }
  }, [login]);

  useEffect(() => {
    dispatch(loginUsuarioAsync(window.location.href));
  }, []);

  const formik = useFormik({
    initialValues: {
      correo: "",
    },
    validationSchema: Yup.object({
      correo: Yup.string()
        .required("El correo electrónico es obligatorio")
        .email("La direccion de correo es invalida"),
    }),
  });

  //Metodo submit para el formulario del formik
  const handleSubmit = async () => {
    if (formik.values.correo === process.env.REACT_APP_USER) {
      dispatch(enviarEmailAsync(formik.values.correo));
    } else {
      toast.error("Error, usuario invalido", disenoToast);
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
