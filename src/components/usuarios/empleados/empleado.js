import React, { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  initialEmpleados,
  estadoProceso,
  reiniciarEstados,
  obtenerEmpleadoAsync,
  crearEmpleadoAsync,
  actualizarEmpleadoAsync,
  eliminarEmpleadoAsync,
} from "../../../redux/reducers/empleadosReducer";
import "../../../css/general.css";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormGroup,
  Input,
  Label,
} from "reactstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ContainerBase from "../../dashboard/containerBase";
import TableBase from "../../dashboard/tableBase";
import { disenoToast } from "../../dashboard/disenoToastBase";
import { colunm } from "./columsTable";
import NumberFormat from "react-number-format";
import useSessionStorage from "../../utils/useSessionStorage";
import { roles } from "../../utils/rolesPermisos";

function Empleado() {
  const dispatch = useDispatch();

  const initialLogin = {
    id: null,
    token: false,
    rol: 1,
    sede: null,
  };

  const [login] = useSessionStorage("login", initialLogin);

  const empleados = useSelector(initialEmpleados);

  const estado = useSelector(estadoProceso);

  const [data, setData] = useState([]);

  const [modal, setModal] = useState(false);

  const [idEmpleado, setId] = useState(null);

  const formik = useFormik({
    initialValues: {
      nombre: "",
      telefono: "",
      estado: true,
      correo: "",
      sede: "",
      rol: "",
      password: "",
    },
    validationSchema: Yup.object({
      nombre: Yup.string()
        .min(4, "El nombre debe contener por lo menos 4 caracteres")
        .required("El nombre es obligatorio"),
      telefono: Yup.number()
        .required("El número de teléfono es obligatorio")
        .positive(),
      estado: Yup.string().required("El estado es obligatorio"),
      sede: Yup.string().required("La sede es obligatoria"),
      rol: Yup.number().required("El cargo es obligatorio"),
      correo: Yup.string()
        .required("La dirección de correo electrónico es obligatoria")
        .email("La direccion de correo es invalida"),
      password: Yup.string()
        .min(6, "La contraseña debe de tener por lo menos 6 caracteres")
        .required("La contraseña es obligatoria"),
      confirmPassword: Yup.string()
        .test(
          "passwords-match",
          "Las contraseñas no coinciden",
          function (value) {
            return this.parent.password === value;
          }
        )
        .required("La contraseña es obligatoria"),
    }),
    onSubmit: (values) => {
      dispatch(crearEmpleadoAsync(values));
    },
  });

  useEffect(() => {
    if (!estado.isLoading) {
      if (estado.success) {
        toast.success(estado.success, disenoToast);
        limpiarCampos();
      } else if (estado.error) {
        toast.error(estado.error, disenoToast);
        limpiarCampos();
      }
    }
  }, [dispatch, estado]);

  const cargarEmpleados = useCallback(() => {
    if (empleados.length === 0) {
      dispatch(obtenerEmpleadoAsync());
    } else {
      const newData = empleados.map((item) => ({ ...item }));
      setData(newData);
    }
  }, [dispatch, empleados]);

  useEffect(() => {
    cargarEmpleados();
  }, [cargarEmpleados]);

  const changeModal = () => {
    setModal(!modal);
  };

  const limpiarCampos = () => {
    setModal(false);
    setId(null);
    dispatch(reiniciarEstados());
    setTimeout(() => {
      formik.setErrors({});
      formik.setTouched({}, false);
      formik.setValues(formik.initialValues);
    }, 500);
  };

  // metodo para cargar los datos a editar
  const cargarDatos = (empleado) => {
    setId(empleado.id);
    formik.setValues({
      nombre: empleado.nombre,
      telefono: empleado.telefono,
      estado: empleado.estado,
      correo: empleado.correo,
      sede: empleado.sede,
      rol: empleado.rol,
      password: empleado.id,
      confirmPassword: empleado.id,
    });
    changeModal();
  };

  //metodo para actualizar
  const actualizarEmpleado = async () => {
    const data = formatearDatos();
    dispatch(
      actualizarEmpleadoAsync({
        id: idEmpleado,
        ...data,
      })
    );
  };

  const formatearDatos = () => {
    return {
      nombre: formik.values.nombre,
      estado: JSON.parse(formik.values.estado),
      telefono: formik.values.telefono,
      sede: parseInt(formik.values.sede),
      rol: parseInt(formik.values.rol),
      correo: formik.values.correo,
    };
  };

  return (
    <ContainerBase
      componente="Empleados"
      modal={changeModal}
      loading={estado.isLoading}
    >
      <ToastContainer />
      {modal ? (
        <Modal
          scrollable
          className="flex items-center"
          style={{ height: "90vh" }}
          isOpen={modal}
          size="lg"
        >
          <ModalHeader className="modal-header">
            {idEmpleado != null ? "Actualizar" : "Registrar"} Empleado
          </ModalHeader>
          <ModalBody>
            <div className="form-row">
              <div className="col">
                <FormGroup>
                  <Label for="nombre">Nombre Completo</Label>
                  <Input
                    type="text"
                    placeholder="Ingresa el nombre"
                    id="nombre"
                    value={formik.values.nombre}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                </FormGroup>
                {formik.touched.nombre && formik.errors.nombre ? (
                  <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-2">
                    <p className="mb-0">{formik.errors.nombre}</p>
                  </div>
                ) : null}
              </div>
              <div className="col">
                <FormGroup>
                  <Label for="estado">Estado</Label>
                  <Input
                    type="select"
                    id="estado"
                    value={formik.values.estado}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  >
                    <option value="">Seleccione un estado</option>
                    <option value={true}>Activo</option>
                    <option value={false}>Inactivo</option>
                  </Input>
                </FormGroup>
                {formik.touched.estado && formik.errors.estado ? (
                  <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-2">
                    <p className="mb-0">{formik.errors.estado}</p>
                  </div>
                ) : null}
              </div>
            </div>
            <div className="form-row">
              <div className="col">
                <FormGroup>
                  <Label for="telefono">Teléfono</Label>
                  <NumberFormat
                    customInput={Input}
                    isNumericString={true}
                    placeholder="Ingresa el teléfono"
                    id="telefono"
                    value={formik.values.telefono}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                </FormGroup>
                {formik.touched.telefono && formik.errors.telefono ? (
                  <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-2">
                    <p className="mb-0">{formik.errors.telefono}</p>
                  </div>
                ) : null}
              </div>
              <div className="col">
                <FormGroup>
                  <Label for="correo">Correo</Label>
                  <Input
                    disabled={idEmpleado}
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
              </div>
            </div>
            {!idEmpleado && (
              <div className="form-row">
                <div className="col">
                  <FormGroup>
                    <Label for="password">Contraseña</Label>
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
                </div>
                <div className="col">
                  <FormGroup>
                    <Label for="confirmPassword">Confirmar Contraseña</Label>
                    <Input
                      type="password"
                      placeholder="Ingresa la contraseña"
                      id="confirmPassword"
                      value={formik.values.confirmPassword}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                  </FormGroup>
                  {formik.touched.confirmPassword &&
                  formik.errors.confirmPassword ? (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-2">
                      <p className="mb-0">{formik.errors.confirmPassword}</p>
                    </div>
                  ) : null}
                </div>
              </div>
            )}
            <div className="form-row">
              <div className="col">
                <FormGroup>
                  <Label for="sede">Sede</Label>
                  <Input
                    type="select"
                    id="sede"
                    value={formik.values.sede}
                    onChange={(e) => {
                      formik.setFieldValue(
                        "sede",
                        parseInt(e.target.value),
                        false
                      );
                      formik.setFieldValue("rol", "", false);
                    }}
                    onBlur={formik.handleBlur}
                  >
                    <option value="">Seleccione una Sede</option>
                    <option value={1}>Punto de Venta</option>
                    <option value={2}>Call Center</option>
                    <option hidden={login.rol !== 3} value={4}>
                      Administrativos
                    </option>
                  </Input>
                </FormGroup>
                {formik.touched.sede && formik.errors.sede ? (
                  <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-2">
                    <p className="mb-0">{formik.errors.sede}</p>
                  </div>
                ) : null}
              </div>
              <div className="col">
                <FormGroup>
                  <Label for="rol">Cargo</Label>
                  <Input
                    type="select"
                    id="rol"
                    value={formik.values.rol}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  >
                    <option value="">Seleccione un rol</option>
                    {roles.map((rol) => {
                      return (
                        rol.sede === formik.values.sede && (
                          <option key={"rol" + rol.value} value={rol.value}>
                            {rol.rol}
                          </option>
                        )
                      );
                    })}
                  </Input>
                </FormGroup>
                {formik.touched.rol && formik.errors.rol ? (
                  <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-2">
                    <p className="mb-0">{formik.errors.rol}</p>
                  </div>
                ) : null}
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <div className="modal-boton">
              <Button onClick={limpiarCampos}>Cerrar</Button>
              <Button
                onClick={
                  idEmpleado != null ? actualizarEmpleado : formik.handleSubmit
                }
              >
                {idEmpleado != null ? "Actualizar" : "Registrar"}
              </Button>
            </div>
          </ModalFooter>
        </Modal>
      ) : (
        <TableBase
          componente="Empleados"
          datos={data}
          columnas={colunm}
          obtener={() => dispatch(obtenerEmpleadoAsync())}
          eliminar={(oldData) => dispatch(eliminarEmpleadoAsync(oldData.id))}
          editar={cargarDatos}
        />
      )}
    </ContainerBase>
  );
}

export default Empleado;
