import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  initialClientes,
  estadoProceso as estadoProcesoClientes,
  obtenerClienteAsync,
} from "../../../redux/reducers/clientesReducer";
import CajaBase from "../../dashboard/cajaBase";
import Buscador from "./buscador";

function Domicilio() {
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const clientes = useSelector(initialClientes);

  const estadoClientes = useSelector(estadoProcesoClientes);

  const [data, setData] = useState([]);

  const [busqueda, setBusqueda] = useState(true);

  const [clienteDomicilio, setCliente] = useState({});

  const cargarClientes = useCallback(() => {
    if (clientes.length === 0) {
      dispatch(obtenerClienteAsync());
    } else {
      const newData = clientes.map((item) => ({ ...item }));
      setData(newData);
    }
  }, [dispatch, clientes]);

  useEffect(() => {
    cargarClientes();
  }, [cargarClientes]);

  const handleCrear = () => {
    return navigate("/clientes", { state: { busquedaCrear: true } });
  };

  const handleActualizar = (values) => {
    const cliente = cargarDatos(values);
    return navigate("/clientes", {
      state: { busquedaCrear: true, cliente },
    });
  };

  const handleSeleccionar = (values, cliente) => {
    setBusqueda(false);
    const { id, telefono, telefono2, nombre } = values;
    const { direccion, puntoRef, barrio } = cliente;
    setCliente({
      id,
      nombre,
      telefono,
      telefono2,
      direccion,
      puntoRef,
      barrio: {
        id: barrio.id,
        municipio: barrio.municipio,
        nombre: barrio.nombre,
        valor: parseInt(barrio.valor),
      },
    });
  };

  const handleReiniciar = () => {
    setBusqueda(true);
    setCliente({});
  };

  const cargarDatos = (values) => {
    return {
      id: values.id,
      nombre: values.nombre,
      telefono: values.telefono,
      telefono2: values.telefono2,
      municipio: values.municipio,
      municipio2: values.municipio2,
      municipio3: values.municipio3,
      municipio4: values.municipio4,
      barrio: values.barrio,
      barrio2: values.barrio2,
      barrio3: values.barrio3,
      barrio4: values.barrio4,
      puntoRef: values.puntoRef,
      puntoRef2: values.puntoRef2,
      puntoRef3: values.puntoRef3,
      puntoRef4: values.puntoRef4,
      direccion: values.direccion,
      direccion2: values.direccion2,
      direccion3: values.direccion3,
      direccion4: values.direccion4,
    };
  };

  return (
    <CajaBase
      imprimir={false}
      domicilio={clienteDomicilio}
      reiniciar={handleReiniciar}
    >
      <Buscador
        abrir={busqueda}
        clientes={data}
        cargando={estadoClientes.isLoading}
        obtener={() => dispatch(obtenerClienteAsync())}
        crear={handleCrear}
        actualizar={handleActualizar}
        seleccionar={handleSeleccionar}
      />
    </CajaBase>
  );
}

export default Domicilio;
