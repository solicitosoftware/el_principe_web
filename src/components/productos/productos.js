import React, { useState, useContext, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  initialCategorias,
  obtenerCategoriaAsync,
  estadoProceso as estadoProcesoCategorias,
} from "../../redux/reducers/categoriasReducer";
import {
  initialProductos,
  estadoProceso,
  obtenerProductoAsync,
  crearProductoAsync,
  actualizarProductoAsync,
  eliminarProductoAsync,
  reiniciarEstados,
} from "../../redux/reducers/productosReducer";
import NumberFormat from "react-number-format";
import { FirebaseContext } from "../../firebase";
import { formatearPrecio } from "../utils";
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
  ButtonGroup,
} from "reactstrap";
import TableBase from "../dashboard/tableBase";
import { useFormik } from "formik";
import * as Yup from "yup";
import ContainerBase from "../dashboard/containerBase";
import FileUploader from "react-firebase-file-uploader";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { disenoToast } from "../dashboard/disenoToastBase";
import { colunm } from "./columsTable";
import useUsuarioPermisos from "../utils/usuarioPermisos";
import colors from "../utils/colors";

function Productos() {
  const { firebase } = useContext(FirebaseContext);

  const permisosRol = useUsuarioPermisos();

  const dispatch = useDispatch();

  const categorias = useSelector(initialCategorias);

  const productos = useSelector(initialProductos);

  const estado = useSelector(estadoProceso);

  const estadoCategorias = useSelector(estadoProcesoCategorias);

  const [data, setData] = useState([]);

  const [modal, setModal] = useState(false);

  const [idProducto, setId] = useState(null);

  const [imagenDelete, setImagenDelete] = useState([]);

  const [cargandoImagen, setCargando] = useState(false);

  const [progres, setProgres] = useState(0);

  const formik = useFormik({
    initialValues: {
      nombre: "",
      precio: "",
      categoria: "",
      estado: true,
      imagen: "",
      descripcion: "",
      orden: 1,
      disponible: {
        caja: true,
        domicilio: true,
        app: true,
      },
    },
    validationSchema: Yup.object({
      nombre: Yup.string()
        .min(4, "El nombre debe contener por lo menos 4 caracteres")
        .required("El nombre es obligatorio"),
      categoria: Yup.string().required("La categoría es obligatoria"),
      precio: Yup.number()
        .required("El precio es obligatorio")
        .positive("El precio debe ser mayor a 0"),
      imagen: Yup.string().required("La imagen es obligatoria"),
      descripcion: Yup.string()
        .min(10, "La descripción debe de tener por lo menos 10 caracteres")
        .required("La descripción es obligatoria"),
      orden: Yup.number().required("El orden es obligatorio"),
    }),
    onSubmit: () => {
      const data = formatearDatos();
      dispatch(crearProductoAsync(data));
    },
  });

  const cargarProductos = useCallback(() => {
    if (productos.length === 0) {
      dispatch(obtenerProductoAsync());
    } else {
      const newData = productos.map((item) => ({ ...item }));
      formik.values.orden = newData.length + 1;
      setData(newData);
    }
  }, [dispatch, productos]);

  useEffect(() => {
    cargarProductos();
  }, [cargarProductos]);

  const cargarCategorias = useCallback(() => {
    if (categorias.length === 0) {
      dispatch(obtenerCategoriaAsync());
    }
  }, [dispatch, categorias]);

  useEffect(() => {
    cargarCategorias();
  }, [cargarCategorias]);

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

  const changeModal = () => {
    setModal(!modal);
  };

  const validarImagenes = () => {
    if (imagenDelete.length > idProducto ? 0 : 1) {
      imagenDelete.map((imagen) => eliminarImagen(imagen));
    }
  };

  const limpiarCampos = async () => {
    await validarImagenes();
    setModal(false);
    setId(null);
    setImagenDelete([]);
    dispatch(reiniciarEstados());
    setTimeout(() => {
      formik.setErrors({});
      formik.setTouched({}, false);
      formik.setValues(formik.initialValues);
    }, 500);
  };

  // metodo para cargar los datos a editar
  const cargarDatos = (producto) => {
    setId(producto.id);
    formik.setValues({
      nombre: producto.nombre,
      precio: producto.precio,
      categoria: producto.categoria.id,
      estado: producto.estado,
      imagen: producto.imagen,
      descripcion: producto.descripcion,
      orden: producto.orden,
      disponible: producto?.disponible ?? formik.initialValues.disponible,
    });
    changeModal();
  };

  //metodo para actualizar
  const actualizarProducto = () => {
    const data = formatearDatos();
    dispatch(
      actualizarProductoAsync({
        id: idProducto,
        ...data,
      })
    );
  };

  const formatearDatos = () => {
    return {
      nombre: formik.values.nombre,
      precio: formik.values.precio,
      categoria: categorias.find((x) => x.id === formik.values.categoria),
      estado: JSON.parse(formik.values.estado),
      imagen: formik.values.imagen,
      descripcion: formik.values.descripcion,
      orden: formik.values.orden,
      disponible: formik.values.disponible,
    };
  };

  // //metodo para eliminar una foto al cambiarla
  const eliminarImagen = (imagen) => {
    const storageRef = firebase.storage.ref("productos");
    const imgUrl = imagen.split("%")[1].split("?")[0];
    const imagesRef = storageRef.child(`/${imgUrl.slice(2, imgUrl.length)}`);
    imagesRef.delete().catch((error) => {
      toast.error(
        "Error, no fue posible cambiar la imagen intentelo nuevamente",
        disenoToast
      );
    });
  };

  const handleStart = () => {
    setCargando(true);
  };

  const handleProgress = (progress) => {
    setProgres(progress);
  };

  // //metodo para cargar una imagen
  const handleUploadSuccess = async (nombre) => {
    const imagen = await firebase.storage
      .ref("productos")
      .child(nombre)
      .getDownloadURL();

    formik.setFieldValue("imagen", imagen, false);
    setImagenDelete((x) => [...x, imagen]);
    setCargando(false);
    setProgres(0);
  };

  //metodo que retorna si hay errores hay subir una imagen
  const handleUploadError = (error) => {
    setProgres(0);
    toast.error(
      "Error, no fue posible cargar la imagen intentelo nuevamente",
      disenoToast
    );
  };

  const imagenProducto = (values) => {
    return (
      <div className="div-dtl-producto">
        <img className="img-producto" src={values.imagen} alt="producto" />
      </div>
    );
  };

  return (
    <ContainerBase
      componente="Productos"
      modal={changeModal}
      loading={estado.isLoading || estadoCategorias.isLoading}
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
            {idProducto != null ? "Actualizar" : "Registrar"} Producto
          </ModalHeader>
          <ModalBody>
            <div className="form-row">
              <div className="col">
                <FormGroup>
                  <Label for="nombre">Nombre</Label>
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
                  <Label for="categoria">Categoria</Label>
                  <Input
                    type="select"
                    id="categoria"
                    value={formik.values.categoria}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  >
                    <option value="">Seleccione una categoría</option>
                    {categorias &&
                      categorias.map((value, index) => {
                        return (
                          <option key={index} value={value.id}>
                            {value.nombre}
                          </option>
                        );
                      })}
                  </Input>
                </FormGroup>
                {formik.touched.categoria && formik.errors.categoria ? (
                  <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-2">
                    <p className="mb-0">{formik.errors.categoria}</p>
                  </div>
                ) : null}
              </div>
            </div>
            <div className="form-row">
              <div className="col">
                <FormGroup>
                  <Label for="precio">Precio</Label>
                  <NumberFormat
                    disabled={idProducto && !permisosRol?.productos?.precio}
                    customInput={Input}
                    isNumericString={true}
                    thousandSeparator={true}
                    placeholder="Ingresa el precio"
                    id="precio"
                    prefix="$"
                    value={formik.values.precio}
                    onChange={(e) =>
                      formik.setFieldValue(
                        "precio",
                        formatearPrecio(e.target.value),
                        false
                      )
                    }
                  />
                </FormGroup>
                {formik.touched.precio && formik.errors.precio ? (
                  <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-2">
                    <p className="mb-0">{formik.errors.precio}</p>
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
                    <option value={true}>Disponible</option>
                    <option value={false}>No Disponible</option>
                  </Input>
                </FormGroup>
              </div>
            </div>
            <div className="form-row mt-2">
              <div className="col">
                {formik.values.imagen && !cargandoImagen && (
                  <div>
                    <img
                      alt="producto"
                      className="image-editar-producto"
                      id="imagen"
                      src={formik.values.imagen}
                    ></img>
                  </div>
                )}
                <FormGroup>
                  <FileUploader
                    accept="image/*"
                    id="imagen"
                    randomizeFilename
                    metadata={{
                      cacheControl: "public,max-age=300",
                      contentType: "image/jpeg",
                    }}
                    storageRef={firebase.storage.ref("productos")}
                    onUploadError={handleUploadError}
                    onUploadStart={handleStart}
                    onProgress={handleProgress}
                    onUploadSuccess={handleUploadSuccess}
                  />
                </FormGroup>
                {cargandoImagen && (
                  <p
                    className="bg-green-400 text-white p-3 my-2"
                    style={{ width: `${progres}%` }}
                  >
                    {progres}%
                  </p>
                )}
                {formik.values.imagen && !cargandoImagen && (
                  <p className="bg-green-400 text-white p-3 text-center my-2">
                    La imagen se subió correctamente
                  </p>
                )}
                {formik.touched.imagen && formik.errors.imagen ? (
                  <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-2">
                    <p className="mb-0">{formik.errors.imagen}</p>
                  </div>
                ) : null}
              </div>
            </div>
            <div className="form-row">
              <div className="col">
                <FormGroup>
                  <Label for="descripcion">Descripción</Label>
                  <Input
                    type="descripcion"
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
              </div>
              <div className="col">
                <FormGroup>
                  <Label for="orden">Orden</Label>
                  <Input
                    type="number"
                    id="orden"
                    value={formik.values.orden}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                </FormGroup>
                {formik.touched.orden && formik.errors.orden ? (
                  <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-2">
                    <p className="mb-0">{formik.errors.orden}</p>
                  </div>
                ) : null}
              </div>
            </div>
            <div className="form-row">
              <div className="col">
                <Label for="orden">Disponible En:</Label>
                <FormGroup>
                  <ButtonGroup>
                    <Button
                      style={{
                        backgroundColor: formik.values.disponible.caja
                          ? colors.principal
                          : "white",
                        color: formik.values.disponible.caja
                          ? "white"
                          : "black",
                      }}
                      active={formik.values.disponible.caja}
                      onClick={() =>
                        formik.setFieldValue(
                          "disponible",
                          {
                            ...formik.values.disponible,
                            caja: !formik.values.disponible.caja,
                          },
                          false
                        )
                      }
                    >
                      Punto Venta
                    </Button>
                    <Button
                      style={{
                        backgroundColor: formik.values.disponible.domicilio
                          ? colors.principal
                          : "white",
                        color: formik.values.disponible.domicilio
                          ? "white"
                          : "black",
                      }}
                      active={formik.values.disponible.domicilio}
                      onClick={() =>
                        formik.setFieldValue(
                          "disponible",
                          {
                            ...formik.values.disponible,
                            domicilio: !formik.values.disponible.domicilio,
                          },
                          false
                        )
                      }
                    >
                      Domicilios
                    </Button>
                    <Button
                      style={{
                        backgroundColor: formik.values.disponible.app
                          ? colors.principal
                          : "white",
                        color: formik.values.disponible.app ? "white" : "black",
                      }}
                      active={formik.values.disponible.app}
                      onClick={() =>
                        formik.setFieldValue(
                          "disponible",
                          {
                            ...formik.values.disponible,
                            app: !formik.values.disponible.app,
                          },
                          false
                        )
                      }
                    >
                      App Móvil
                    </Button>
                  </ButtonGroup>
                </FormGroup>
                {formik.touched.orden && formik.errors.orden ? (
                  <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-2">
                    <p className="mb-0">{formik.errors.orden}</p>
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
                  idProducto != null ? actualizarProducto : formik.handleSubmit
                }
              >
                {idProducto != null ? "Actualizar" : "Registrar"}
              </Button>
            </div>
          </ModalFooter>
        </Modal>
      ) : (
        <TableBase
          componente="Productos"
          datos={data}
          columnas={colunm}
          obtener={() => dispatch(obtenerProductoAsync())}
          eliminar={(oldData) => dispatch(eliminarProductoAsync(oldData.id))}
          editar={cargarDatos}
          editModal={true}
          detailPanel={imagenProducto}
        />
      )}
    </ContainerBase>
  );
}
export default Productos;
