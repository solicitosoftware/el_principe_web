import React, { useContext, useEffect } from "react";
import { FirebaseContext } from "../../firebase";
import "../../css/general.css";
import { FormGroup, Input, Button } from "reactstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import { FaUserCircle } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useSessionStorage from "../utils/useSessionStorage";
import { useNavigate } from "react-router-dom";

function Login() {
  const { firebase } = useContext(FirebaseContext);

  const navigate = useNavigate();

  const initialLogin = {
    token: false,
    rol: 1,
    sede: null,
  };

  const [login, setLogin] = useSessionStorage("login", initialLogin);

  //componente para mostrar mensajes
  const disenoToast = {
    position: "top-center",
    autoClose: 1800,
    hideProgressBar: true,
    closeOnClick: false,
    pauseOnHover: false,
    draggable: false,
    progress: undefined,
    theme: "colored",
  };

  //metodo para calcular pagina de inicio a mostrar
  useEffect(() => {
    const pathname = window.location.pathname;
    if (login.token) {
      navigate("/inicio");
    } else {
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
    if (data.exists) {
      const { estado, rol } = data.data();
      if (estado) {
        if (rol !== 2 && rol !== 5) return true;
      }
    }
    return false;
  };

  //Metodo submit para el formulario del formik
  const handleSubmit = () => {
    try {
      firebase.auth
        .signInWithEmailAndPassword(
          formik.values.correo,
          formik.values.password
        )
        .then((result) => {
          let docRef = firebase.db.collection("empleados").doc(result.user.uid);
          docRef
            .get()
            .then((doc) => {
              if (permiso(doc)) {
                setLogin({
                  token: doc.id,
                  rol: doc.data().rol,
                  sede: doc.data().sede,
                });
              } else {
                toast.error(
                  "El usuario no tiene permisos para esta opción",
                  disenoToast
                );
              }
            })
            .catch((error) => {
              firebase.db.collection("logs").add({
                accion: "Login",
                fecha: firebase.time,
                error: error.message,
                datos: { docRef },
              });
              toast.error(
                "No fue posible obtener los datos del usuario",
                disenoToast
              );
            });
        })
        .catch((err) => {
          toast.error("Usuario y/o contraseña invalidos", disenoToast);
        });
    } catch (error) {
      firebase.db.collection("logs").add({
        accion: "Login",
        fecha: firebase.time,
        error: error.message,
        datos: { ...formik.values },
      });
      toast.error(
        "Ha ocurrido un error al tratar de autenticarse!!",
        disenoToast
      );
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
          <Button onClick={handleSubmit}>Ingresar</Button>
        </div>
      </div>
    </div>
  );
}

export default Login;
