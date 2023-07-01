import React, { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  initialClientes,
  estadoProceso,
  reiniciarEstados,
  obtenerClientesAsync,
  crearClienteAsync,
  actualizarClienteAsync,
  eliminarClienteAsync,
  obtenerClienteAsync,
} from "../../../redux/reducers/clientesReducer";
import {
  initialMunicipios,
  obtenerMunicipioAsync,
  estadoProceso as estadoProcesoMunicipios,
} from "../../../redux/reducers/municipiosReducer";
import {
  initialBarrios,
  obtenerBarrioAsync,
  estadoProceso as estadoProcesoBarrios,
} from "../../../redux/reducers/barriosReducer";
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
  TabPane,
  TabContent,
  Nav,
  NavLink,
  NavItem,
  InputGroup,
  InputGroupAddon,
} from "reactstrap";
import classnames from "classnames";
import { useFormik } from "formik";
import * as Yup from "yup";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ContainerBase from "../../dashboard/containerBase";
import TableBase from "../../dashboard/tableBase";
import { disenoToast } from "../../dashboard/disenoToastBase";
import NumberFormat from "react-number-format";
import { useLocation, useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";

function Cliente() {
  const navigate = useNavigate();

  const { state } = useLocation();

  const stringify = require("json-stable-stringify");

  const dispatch = useDispatch();

  const clientes = useSelector(initialClientes);

  const municipios = useSelector(initialMunicipios);

  const barrios = useSelector(initialBarrios);

  const estado = useSelector(estadoProceso);

  const estadoBarrios = useSelector(estadoProcesoBarrios);

  const estadoMunicipios = useSelector(estadoProcesoMunicipios);

  const [data, setData] = useState([]);

  const [modal, setModal] = useState(
    state?.busquedaCrear ? state.busquedaCrear : false
  );

  const [idCliente, setId] = useState(null);

  const [activeTab, setActiveTab] = useState("1");

  const toggle = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
  };

  const formik = useFormik({
    initialValues: {
      nombre: "",
      telefono: "",
      telefono2: "",
      municipio: "",
      barrio: "",
      direccion: "",
      puntoRef: "",
      municipio2: "",
      barrio2: "",
      direccion2: "",
      puntoRef2: "",
      municipio3: "",
      barrio3: "",
      direccion3: "",
      puntoRef3: "",
      municipio4: "",
      barrio4: "",
      direccion4: "",
      puntoRef4: "",
    },
    validationSchema: Yup.object({
      nombre: Yup.string()
        .min(4, "El nombre debe contener por lo menos 4 caracteres")
        .required("El nombre es obligatorio"),
      telefono: Yup.number()
        .required("El número de teléfono es obligatorio")
        .positive(),
      telefono2: Yup.number().positive(),
      direccion: Yup.string().required("La dirección es obligatoria"),
      barrio: Yup.string().required("El barrio es obligatorio"),
      municipio: Yup.string().required("El municipio es obligatorio"),
      puntoRef: Yup.string(),
      municipio2: Yup.string(),
      barrio2: Yup.string().when("municipio2", (municipio2, barrio2) =>
        municipio2 ? barrio2.required("El barrio es obligatorio") : barrio2
      ),
      direccion2: Yup.string().when("municipio2", (municipio2, direccion2) =>
        municipio2
          ? direccion2.required("La dirección es obligatoria")
          : direccion2
      ),
      puntoRef2: Yup.string(),
      municipio3: Yup.string(),
      barrio3: Yup.string().when("municipio3", (municipio3, barrio3) =>
        municipio3 ? barrio3.required("El barrio es obligatorio") : barrio3
      ),
      direccion3: Yup.string().when("municipio3", (municipio3, direccion3) =>
        municipio3
          ? direccion3.required("La dirección es obligatoria")
          : direccion3
      ),
      puntoRef3: Yup.string(),
      municipio4: Yup.string(),
      barrio4: Yup.string().when("municipio4", (municipio4, barrio4) =>
        municipio4 ? barrio4.required("El barrio es obligatorio") : barrio4
      ),
      direccion4: Yup.string().when("municipio4", (municipio4, direccion4) =>
        municipio4
          ? direccion4.required("La dirección es obligatoria")
          : direccion4
      ),
      puntoRef4: Yup.string(),
    }),
    onSubmit: async () => {
      const data = formatearDatos();
      if (await validarCliente(data)) {
        return dispatch(crearClienteAsync(data));
      } else {
        toast.error(
          "Ya existe un cliente con este teléfono registrado",
          disenoToast
        );
      }
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

  const cargarClientes = useCallback(() => {
    if (clientes.length === 0) {
      dispatch(obtenerClientesAsync());
    } else {
      const newData = clientes.map((item) => ({ ...item }));
      setData(newData);
    }
  }, [dispatch, clientes]);

  useEffect(() => {
    cargarClientes();
  }, [cargarClientes]);

  const cargarBarrios = useCallback(() => {
    if (barrios.length === 0) {
      dispatch(obtenerBarrioAsync());
    }
  }, [dispatch, barrios]);

  const cargarMunicipios = useCallback(() => {
    if (municipios.length === 0) {
      dispatch(obtenerMunicipioAsync());
    }
  }, [dispatch, municipios]);

  useEffect(() => {
    cargarBarrios();
    cargarMunicipios();
  }, [cargarBarrios, cargarMunicipios]);

  const changeModal = () => {
    setModal(!modal);
  };

  const limpiarCampos = () => {
    setModal(false);
    setId(null);
    setActiveTab("1");
    dispatch(reiniciarEstados());
    setTimeout(() => {
      formik.setErrors({});
      formik.setTouched({}, false);
      formik.setValues(formik.initialValues);
    }, 500);
    if (state?.busquedaCrear) {
      return navigate("/pedidos");
    }
  };

  // metodo para cargar los datos a editar
  const cargarDatos = (cliente) => {
    setId(cliente.id);
    formik.setValues({
      nombre: cliente.nombre,
      telefono: cliente.telefono,
      telefono2: cliente.telefono2 || "",
      municipio: cliente.barrio && cliente.barrio.municipio.id,
      municipio2: cliente.barrio2 && cliente.barrio2.municipio.id,
      municipio3: cliente.barrio3 && cliente.barrio3.municipio.id,
      municipio4: cliente.barrio4 && cliente.barrio4.municipio.id,
      barrio: stringify(cliente.barrio),
      barrio2: stringify(cliente.barrio2),
      barrio3: stringify(cliente.barrio3),
      barrio4: stringify(cliente.barrio4),
      puntoRef: cliente.puntoRef,
      puntoRef2: cliente.puntoRef2,
      puntoRef3: cliente.puntoRef3,
      puntoRef4: cliente.puntoRef4,
      direccion: cliente.direccion,
      direccion2: cliente.direccion2,
      direccion3: cliente.direccion3,
      direccion4: cliente.direccion4,
    });
    changeModal();
  };

  useEffect(() => {
    if (state && Object.values(state?.cliente || {}).length > 0) {
      cargarDatos(state?.cliente);
      setModal(true);
    }
  }, [state]);

  //metodo para actualizar
  const actualizarCliente = async () => {
    const data = formatearDatos();
    if (await validarCliente(data)) {
      return dispatch(
        actualizarClienteAsync({
          id: idCliente,
          ...data,
        })
      );
    } else {
      toast.error(
        "Ya existe un cliente con este teléfono registrado",
        disenoToast
      );
    }
  };

  const formatearDatos = () => {
    return {
      nombre: formik.values.nombre,
      telefono: formik.values.telefono,
      telefono2: formik.values.telefono2,
      municipio: formik.values.municipio,
      municipio2: formik.values.municipio2,
      municipio3: formik.values.municipio3,
      municipio4: formik.values.municipio4,
      barrio: formik.values.barrio && JSON.parse(formik.values.barrio),
      barrio2: formik.values.barrio2 && JSON.parse(formik.values.barrio2),
      barrio3: formik.values.barrio3 && JSON.parse(formik.values.barrio3),
      barrio4: formik.values.barrio4 && JSON.parse(formik.values.barrio4),
      puntoRef: formik.values.puntoRef,
      puntoRef2: formik.values.puntoRef2,
      puntoRef3: formik.values.puntoRef3,
      puntoRef4: formik.values.puntoRef4,
      direccion: formik.values.direccion,
      direccion2: formik.values.direccion2,
      direccion3: formik.values.direccion3,
      direccion4: formik.values.direccion4,
    };
  };

  const validarCliente = async (values) => {
    const result = await dispatch(
      obtenerClienteAsync(values.id || values.telefono)
    ).unwrap();
    if (Object.values(result.data).length > 0 && !idCliente) return false;
    return true;
  };

  const consultarCliente = async () => {
    const id = formik.values.telefono;
    const result = await dispatch(obtenerClienteAsync(id)).unwrap();
    cargarDatos({ ...result.data, id });
    setModal(true);
  };

  const lookupBarrio = () => {
    const lookup = {};
    barrios?.forEach((element) => {
      lookup[element.id] = `${element.municipio.nombre} - ${element.nombre}`;
    });
    return lookup;
  };

  const colunm = [
    {
      title: "Nombre",
      field: "nombre",
      defaultSort: "asc",
      cellStyle: { width: "20%" },
      validate: (rowData) => {
        if (rowData.nombre === "") {
          return {
            isValid: false,
            helperText: "El nombre es obligatorio",
          };
        } else if (rowData.nombre.length < 4) {
          return {
            isValid: false,
            helperText: "El nombre debe contener por lo menos 4 caracteres",
          };
        } else {
          return true;
        }
      },
    },
    {
      title: "Teléfono Principal",
      field: "telefono",
      type: "numeric",
      align: "center",
      cellStyle: { width: "20%" },
      validate: (rowData) => {
        if (!rowData.telefono) {
          return {
            isValid: false,
            helperText: "El número de teléfono es obligatorio",
          };
        } else {
          return true;
        }
      },
    },
    {
      title: "Teléfono Secundario",
      field: "telefono2",
      type: "numeric",
      align: "center",
      cellStyle: { width: "20%" },
    },
    {
      title: "Direccion",
      field: "direccion",
      cellStyle: { width: "20%" },
    },
    {
      title: "Municipio - Barrio",
      field: "barrio.id",
      cellStyle: { width: "20%" },
      lookup: lookupBarrio(),
    },
    {
      title: "Punto Referencia",
      field: "puntoRef",
      cellStyle: { width: "30%" },
    },
  ];

  return (
    <ContainerBase
      componente="Clientes"
      modal={changeModal}
      loading={
        estado.isLoading ||
        estadoBarrios.isLoading ||
        estadoMunicipios.isLoading
      }
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
            {idCliente != null ? "Actualizar" : "Registrar"} Cliente
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
            </div>
            <div className="form-row">
              <div className="col">
                <FormGroup>
                  <Label for="telefono">Teléfono Principal</Label>
                  {idCliente ? (
                    <NumberFormat
                      customInput={Input}
                      isNumericString={true}
                      placeholder="Ingresa el teléfono"
                      id="telefono"
                      value={formik.values.telefono}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                  ) : (
                    <InputGroup>
                      <NumberFormat
                        customInput={Input}
                        isNumericString={true}
                        placeholder="Ingresa el teléfono"
                        id="telefono"
                        value={formik.values.telefono}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                      <InputGroupAddon addonType="append">
                        <Button color="primary" outline>
                          <FaSearch onClick={consultarCliente} />
                        </Button>
                      </InputGroupAddon>
                    </InputGroup>
                  )}
                </FormGroup>
                {formik.touched.telefono && formik.errors.telefono ? (
                  <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-2">
                    <p className="mb-0">{formik.errors.telefono}</p>
                  </div>
                ) : null}
              </div>
              <div className="col">
                <FormGroup>
                  <Label for="telefono2">Teléfono Secundario</Label>
                  <NumberFormat
                    customInput={Input}
                    isNumericString={true}
                    placeholder="Ingresa el teléfono"
                    id="telefono2"
                    value={formik.values.telefono2}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                </FormGroup>
                {formik.touched.telefono2 && formik.errors.telefono2 ? (
                  <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-2">
                    <p className="mb-0">{formik.errors.telefono2}</p>
                  </div>
                ) : null}
              </div>
            </div>
            <div>
              <Nav tabs>
                <NavItem>
                  <NavLink
                    className={classnames({ active: activeTab === "1" })}
                    onClick={() => {
                      toggle("1");
                    }}
                  >
                    Dirección Principal
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={classnames({ active: activeTab === "2" })}
                    onClick={() => {
                      toggle("2");
                    }}
                  >
                    Dirección 2
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={classnames({ active: activeTab === "3" })}
                    onClick={() => {
                      toggle("3");
                    }}
                  >
                    Dirección 3
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={classnames({ active: activeTab === "4" })}
                    onClick={() => {
                      toggle("4");
                    }}
                  >
                    Dirección 4
                  </NavLink>
                </NavItem>
              </Nav>
              <TabContent activeTab={activeTab}>
                <TabPane tabId="1">
                  <div className="m-2">
                    <div className="form-row">
                      <div className="col">
                        <FormGroup>
                          <Label for="municipio">Municipio</Label>
                          <Input
                            type="select"
                            id="municipio"
                            value={formik.values.municipio}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                          >
                            <option value="">Seleccione un municipio</option>
                            {municipios.map((value, index) => {
                              return (
                                <option key={"mun1_" + index} value={value.id}>
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
                      </div>
                      <div className="col">
                        <FormGroup>
                          <Label for="barrio">Barrio</Label>
                          <Input
                            type="select"
                            id="barrio"
                            value={formik.values.barrio}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                          >
                            <option value="">Seleccione un barrio</option>
                            {barrios.map((value, index) => {
                              return (
                                value.municipio.id ===
                                  formik.values.municipio && (
                                  <option
                                    key={"bar1_" + index}
                                    value={stringify(value)}
                                  >
                                    {value.nombre}
                                  </option>
                                )
                              );
                            })}
                          </Input>
                        </FormGroup>
                        {formik.touched.barrio && formik.errors.barrio ? (
                          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-2">
                            <p className="mb-0">{"El barrio es obligatorio"}</p>
                          </div>
                        ) : null}
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="col">
                        <FormGroup>
                          <Label for="direccion">Dirección</Label>
                          <Input
                            type="text"
                            placeholder="Ingresa la dirección del domicilio"
                            id="direccion"
                            value={formik.values.direccion}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                          />
                        </FormGroup>
                        {formik.touched.direccion && formik.errors.direccion ? (
                          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-2">
                            <p className="mb-0">{formik.errors.direccion}</p>
                          </div>
                        ) : null}
                      </div>
                      <div className="col">
                        <FormGroup>
                          <Label for="puntoref">Punto de Referencia</Label>
                          <Input
                            type="text"
                            placeholder="Punto de Referencia"
                            id="puntoRef"
                            value={formik.values.puntoRef}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                          />
                        </FormGroup>
                        {formik.touched.puntoRef && formik.errors.puntoRef ? (
                          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-2">
                            <p className="mb-0">{formik.errors.puntoRef}</p>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </TabPane>
                <TabPane tabId="2">
                  <div className="m-2">
                    <div className="form-row">
                      <div className="col">
                        <FormGroup>
                          <Label for="municipio2">Municipio</Label>
                          <Input
                            type="select"
                            id="municipio2"
                            value={formik.values.municipio2}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                          >
                            <option value="">Seleccione un municipio</option>
                            {municipios.map((value, index) => {
                              return (
                                <option key={"mun2_" + index} value={value.id}>
                                  {value.nombre}
                                </option>
                              );
                            })}
                          </Input>
                        </FormGroup>
                        {formik.touched.municipio2 &&
                        formik.errors.municipio2 ? (
                          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-2">
                            <p className="mb-0">{formik.errors.municipio2}</p>
                          </div>
                        ) : null}
                      </div>
                      <div className="col">
                        <FormGroup>
                          <Label for="barrio2">Barrio</Label>
                          <Input
                            type="select"
                            id="barrio2"
                            value={formik.values.barrio2}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                          >
                            <option value="">Seleccione un barrio</option>
                            {barrios.map((value, index) => {
                              return (
                                value.municipio.id ===
                                  formik.values.municipio2 && (
                                  <option
                                    key={"bar1_" + index}
                                    value={stringify(value)}
                                  >
                                    {value.nombre}
                                  </option>
                                )
                              );
                            })}
                          </Input>
                        </FormGroup>
                        {formik.touched.barrio2 && formik.errors.barrio2 ? (
                          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-2">
                            <p className="mb-0">{"El barrio es obligatorio"}</p>
                          </div>
                        ) : null}
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="col">
                        <FormGroup>
                          <Label for="direccion2">Dirección</Label>
                          <Input
                            type="text"
                            placeholder="Ingresa la dirección del domicilio"
                            id="direccion2"
                            value={formik.values.direccion2}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                          />
                        </FormGroup>
                        {formik.touched.direccion2 &&
                        formik.errors.direccion2 ? (
                          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-2">
                            <p className="mb-0">{formik.errors.direccion2}</p>
                          </div>
                        ) : null}
                      </div>
                      <div className="col">
                        <FormGroup>
                          <Label for="puntoref2">Punto de Referencia</Label>
                          <Input
                            type="text"
                            placeholder="Punto de Referencia"
                            id="puntoRef2"
                            value={formik.values.puntoRef2}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                          />
                        </FormGroup>
                        {formik.touched.puntoRef2 && formik.errors.puntoRef2 ? (
                          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-2">
                            <p className="mb-0">{formik.errors.puntoRef2}</p>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </TabPane>
                <TabPane tabId="3">
                  <div className="m-2">
                    <div className="form-row">
                      <div className="col">
                        <FormGroup>
                          <Label for="municipio3">Municipio</Label>
                          <Input
                            type="select"
                            id="municipio3"
                            value={formik.values.municipio3}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                          >
                            <option value="">Seleccione un municipio</option>
                            {municipios.map((value, index) => {
                              return (
                                <option key={"mun1_" + index} value={value.id}>
                                  {value.nombre}
                                </option>
                              );
                            })}
                          </Input>
                        </FormGroup>
                        {formik.touched.municipio3 &&
                        formik.errors.municipio3 ? (
                          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-2">
                            <p className="mb-0">{formik.errors.municipio3}</p>
                          </div>
                        ) : null}
                      </div>
                      <div className="col">
                        <FormGroup>
                          <Label for="barrio3">Barrio</Label>
                          <Input
                            type="select"
                            id="barrio3"
                            value={formik.values.barrio3}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                          >
                            <option value="">Seleccione un barrio</option>
                            {barrios.map((value, index) => {
                              return (
                                value.municipio.id ===
                                  formik.values.municipio3 && (
                                  <option
                                    key={"bar1_" + index}
                                    value={stringify(value)}
                                  >
                                    {value.nombre}
                                  </option>
                                )
                              );
                            })}
                          </Input>
                        </FormGroup>
                        {formik.touched.barrio3 && formik.errors.barrio3 ? (
                          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-2">
                            <p className="mb-0">{"El barrio es obligatorio"}</p>
                          </div>
                        ) : null}
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="col">
                        <FormGroup>
                          <Label for="direccion3">Dirección</Label>
                          <Input
                            type="text"
                            placeholder="Ingresa la dirección del domicilio"
                            id="direccion3"
                            value={formik.values.direccion3}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                          />
                        </FormGroup>
                        {formik.touched.direccion3 &&
                        formik.errors.direccion3 ? (
                          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-2">
                            <p className="mb-0">{formik.errors.direccion3}</p>
                          </div>
                        ) : null}
                      </div>
                      <div className="col">
                        <FormGroup>
                          <Label for="puntoref3">Punto de Referencia</Label>
                          <Input
                            type="text"
                            placeholder="Punto de Referencia"
                            id="puntoRef3"
                            value={formik.values.puntoRef3}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                          />
                        </FormGroup>
                        {formik.touched.puntoRef3 && formik.errors.puntoRef3 ? (
                          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-2">
                            <p className="mb-0">{formik.errors.puntoRef3}</p>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </TabPane>
                <TabPane tabId="4">
                  <div className="m-2">
                    <div className="form-row">
                      <div className="col">
                        <FormGroup>
                          <Label for="municipio4">Municipio</Label>
                          <Input
                            type="select"
                            id="municipio4"
                            value={formik.values.municipio4}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                          >
                            <option value="">Seleccione un municipio</option>
                            {municipios.map((value, index) => {
                              return (
                                <option key={"mun1_" + index} value={value.id}>
                                  {value.nombre}
                                </option>
                              );
                            })}
                          </Input>
                        </FormGroup>
                        {formik.touched.municipio4 &&
                        formik.errors.municipio4 ? (
                          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-2">
                            <p className="mb-0">{formik.errors.municipio4}</p>
                          </div>
                        ) : null}
                      </div>
                      <div className="col">
                        <FormGroup>
                          <Label for="barrio4">Barrio</Label>
                          <Input
                            type="select"
                            id="barrio4"
                            value={formik.values.barrio4}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                          >
                            <option value="">Seleccione un barrio</option>
                            {barrios.map((value, index) => {
                              return (
                                value.municipio.id ===
                                  formik.values.municipio4 && (
                                  <option
                                    key={"bar1_" + index}
                                    value={stringify(value)}
                                  >
                                    {value.nombre}
                                  </option>
                                )
                              );
                            })}
                          </Input>
                        </FormGroup>
                        {formik.touched.barrio4 && formik.errors.barrio4 ? (
                          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-2">
                            <p className="mb-0">{"El barrio es obligatorio"}</p>
                          </div>
                        ) : null}
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="col">
                        <FormGroup>
                          <Label for="direccion4">Dirección</Label>
                          <Input
                            type="text"
                            placeholder="Ingresa la dirección del domicilio"
                            id="direccion4"
                            value={formik.values.direccion4}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                          />
                        </FormGroup>
                        {formik.touched.direccion4 &&
                        formik.errors.direccion4 ? (
                          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-2">
                            <p className="mb-0">{formik.errors.direccion4}</p>
                          </div>
                        ) : null}
                      </div>
                      <div className="col">
                        <FormGroup>
                          <Label for="puntoref4">Punto de Referencia</Label>
                          <Input
                            type="text"
                            placeholder="Punto de Referencia"
                            id="puntoRef4"
                            value={formik.values.puntoRef4}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                          />
                        </FormGroup>
                        {formik.touched.puntoRef4 && formik.errors.puntoRef4 ? (
                          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-2">
                            <p className="mb-0">{formik.errors.puntoRef4}</p>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </TabPane>
              </TabContent>
            </div>
          </ModalBody>
          <ModalFooter>
            <div className="modal-boton">
              <Button onClick={limpiarCampos}>Cerrar</Button>
              <Button
                onClick={
                  idCliente != null ? actualizarCliente : formik.handleSubmit
                }
              >
                {idCliente != null ? "Actualizar" : "Registrar"}
              </Button>
            </div>
          </ModalFooter>
        </Modal>
      ) : (
        <TableBase
          componente="Clientes"
          datos={data}
          columnas={colunm}
          obtener={() => dispatch(obtenerClientesAsync())}
          eliminar={(oldData) => dispatch(eliminarClienteAsync(oldData.id))}
          editar={cargarDatos}
        />
      )}
    </ContainerBase>
  );
}

export default Cliente;
