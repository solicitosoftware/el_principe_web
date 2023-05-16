import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  initialMunicipios,
  obtenerMunicipioAsync,
  estadoProceso as estadoProcesoMunicipios,
} from "../../redux/reducers/municipiosReducer";
import { formatearPrecio } from "../utils";
import { toast, ToastContainer } from "react-toastify";
import {
  estadoProceso,
  reiniciarEstados,
  initialBarrios,
  obtenerBarrioAsync,
  crearBarrioAsync,
  actualizarBarrioAsync,
  eliminarBarrioAsync,
} from "../../redux/reducers/barriosReducer";
import "../../css/general.css";
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
import "react-toastify/dist/ReactToastify.css";
import ContainerBase from "../dashboard/containerBase";
import TableBase from "../dashboard/tableBase";
import { column } from "./columsTable";
import { disenoToast } from "../dashboard/disenoToastBase";
import NumberFormat from "react-number-format";

function Barrios() {
  const dispatch = useDispatch();

  const estado = useSelector(estadoProceso);

  const estadoMunicipios = useSelector(estadoProcesoMunicipios);

  const barrios = useSelector(initialBarrios);

  const municipios = useSelector(initialMunicipios);

  const [data, setData] = useState([]);

  const [modal, setModal] = useState(false);

  const formik = useFormik({
    initialValues: {
      nombre: "",
      valor: 0,
      municipio: "",
    },
    validationSchema: Yup.object({
      nombre: Yup.string()
        .min(4, "El nombre debe contener por lo menos 4 caracteres")
        .required("El nombre de la categoria es obligatorio"),
      valor: Yup.number()
        .required("El valor es obligatorio")
        .positive("El valor debe ser mayor a 0"),
      municipio: Yup.string().required("El municipio es obligatorio."),
    }),
    onSubmit: () => {
      const data = formatearDatos();
      dispatch(crearBarrioAsync(data));
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
  }, [estado]);

  const cargarBarrios = useCallback(() => {
    if (barrios.length === 0) {
      dispatch(obtenerBarrioAsync());
    } else {
      const newData = barrios.map((item) => ({ ...item }));
      setData(newData);
    }
  }, [dispatch, barrios]);

  useEffect(() => {
    cargarBarrios();
  }, [cargarBarrios]);

  const cargarMunicipios = useCallback(() => {
    if (municipios.length === 0) {
      dispatch(obtenerMunicipioAsync());
    }
  }, [dispatch, municipios]);

  useEffect(() => {
    cargarMunicipios();
  }, [cargarMunicipios]);

  const changeModal = () => {
    setModal(!modal);
  };

  const limpiarCampos = () => {
    setModal(false);
    dispatch(reiniciarEstados());
    setTimeout(() => {
      formik.setErrors({});
      formik.setTouched({}, false);
      formik.setValues(formik.initialValues);
    }, 500);
  };

  const formatearDatos = () => {
    return {
      nombre: formik.values.nombre,
      valor: parseInt(formik.values.valor),
      municipio: municipios.find((x) => x.id === formik.values.municipio),
    };
  };

  return (
    <ContainerBase
      componente="Barrios"
      modal={changeModal}
      loading={barrios.length === 0 || estadoMunicipios.isLoading}
    >
      <ToastContainer />
      {modal ? (
        <Modal
          scrollable
          className="flex items-center"
          style={{ height: "90vh" }}
          isOpen={modal}
        >
          <ModalHeader className="modal-header">Crear Barrio</ModalHeader>
          <ModalBody>
            <FormGroup>
              <Label for="barrio">Nombre Barrio</Label>
              <Input
                type="text"
                placeholder="Ingresa un barrio"
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
            <FormGroup>
              <NumberFormat
                customInput={Input}
                isNumericString={true}
                thousandSeparator={true}
                placeholder="Ingresa el valor"
                id="valor"
                prefix="$"
                value={formik.values.valor}
                onChange={(e) =>
                  formik.setFieldValue(
                    "valor",
                    formatearPrecio(e.target.value),
                    false
                  )
                }
              />
            </FormGroup>
            {formik.touched.valor && formik.errors.valor ? (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-2">
                <p className="mb-0">{formik.errors.valor}</p>
              </div>
            ) : null}
            <FormGroup>
              <Label for="municipio">Municipio</Label>
              <Input
                type="select"
                id="municipio"
                value={formik.values.municipio}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              >
                <option value="">
                  Seleccione el municipio correspondiente
                </option>
                {municipios &&
                  municipios.map((value, index) => {
                    return (
                      <option key={index} value={value.id}>
                        {value.nombre}
                      </option>
                    );
                  })}
              </Input>
            </FormGroup>
            {formik.touched.municipio && formik.errors.municipio ? (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-2">
                <p className="mb-0">{formik.errors.municipio}</p>
              </div>
            ) : null}
          </ModalBody>
          <ModalFooter>
            <div className="modal-boton">
              <Button onClick={limpiarCampos}>Cerrar</Button>
              <Button onClick={formik.handleSubmit}>Registrar</Button>
            </div>
          </ModalFooter>
        </Modal>
      ) : (
        <TableBase
          loading={estado.isLoading}
          componente="Barrios"
          datos={data}
          columnas={column}
          obtener={() => dispatch(obtenerBarrioAsync())}
          actualizar={(newData) => dispatch(actualizarBarrioAsync(newData))}
          eliminar={(oldData) => dispatch(eliminarBarrioAsync(oldData.id))}
        />
      )}
    </ContainerBase>
  );
}

export default Barrios;
