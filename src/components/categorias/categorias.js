import React, { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  initialCategorias,
  estadoProceso,
  reiniciarEstados,
  obtenerCategoriaAsync,
  crearCategoriaAsync,
  actualizarCategoriaAsync,
  eliminarCategoriaAsync,
} from "../../redux/reducers/categoriasReducer";
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
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ContainerBase from "../dashboard/containerBase";
import TableBase from "../dashboard/tableBase";
import { disenoToast } from "../dashboard/disenoToastBase";
import { colunm } from "./columsTable";

function Categorias() {
  const dispatch = useDispatch();

  const categorias = useSelector(initialCategorias);

  const estado = useSelector(estadoProceso);

  const [data, setData] = useState([]);

  const [modal, setModal] = useState(false);

  const formik = useFormik({
    initialValues: {
      nombre: "",
      descripcion: "",
      salsas: false,
    },
    validationSchema: Yup.object({
      nombre: Yup.string()
        .min(4, "El nombre debe contener por lo menos 4 caracteres")
        .required("El nombre de la categoria es obligatorio"),
      descripcion: Yup.string()
        .min(6, "La descripción debe ser mas larga")
        .required("La descripción de la categoria es obligatoria"),
    }),
    onSubmit: (values) => {
      dispatch(crearCategoriaAsync(values));
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

  const cargarCategorias = useCallback(() => {
    if (categorias.length === 0) {
      dispatch(obtenerCategoriaAsync());
    } else {
      const newData = categorias.map((item) => ({ ...item }));
      setData(newData);
    }
  }, [dispatch, categorias]);

  useEffect(() => {
    cargarCategorias();
  }, [cargarCategorias]);

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

  return (
    <ContainerBase
      componente="Categorias"
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
        >
          <ModalHeader className="modal-header">Crear Categoría</ModalHeader>
          <ModalBody>
            <FormGroup>
              <Label for="categoria">Nombre Categoría</Label>
              <Input
                type="text"
                placeholder="Ingresa una categoría"
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
              <Label for="descripcion">Descripción Categoría</Label>
              <Input
                type="textarea"
                placeholder="Ingresa una descripción"
                id="descripcion"
                value={formik.values.descripcion}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </FormGroup>
            {formik.touched.descripcion && formik.errors.descripcion ? (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-2">
                <p className="mb-0">{formik.errors.descripcion}</p>
              </div>
            ) : null}
            <div>
              <Label for="nombre">Maneja Salsas</Label>
              <div className="form-row">
                <FormGroup className="mr-3 ml-3">
                  <input
                    readOnly
                    value={true}
                    checked={formik.values.salsas}
                    type="radio"
                    onClick={(e) => {
                      formik.setFieldValue(
                        "salsas",
                        JSON.parse(e.target.value),
                        false
                      );
                    }}
                  />
                  {" Si"}
                </FormGroup>
                <FormGroup>
                  <input
                    readOnly
                    value={false}
                    checked={!formik.values.salsas}
                    type="radio"
                    onClick={(e) => {
                      formik.setFieldValue(
                        "salsas",
                        JSON.parse(e.target.value),
                        false
                      );
                    }}
                  />
                  {" No"}
                </FormGroup>
              </div>
            </div>
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
          componente="Categorias"
          datos={data}
          columnas={colunm}
          obtener={() => dispatch(obtenerCategoriaAsync())}
          actualizar={(newData) => dispatch(actualizarCategoriaAsync(newData))}
          eliminar={(oldData) => dispatch(eliminarCategoriaAsync(oldData.id))}
        />
      )}
    </ContainerBase>
  );
}

export default Categorias;
