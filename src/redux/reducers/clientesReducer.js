import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import firebase from "../../firebase";
import { RUTA_FUNCTIONS } from "../config";
import { CodeError } from "../errors";

const endpoints = {
  obtener: "api/getClientes",
  crear: "api/createCliente",
  actualizar: "api/updateCliente",
  eliminar: "api/deleteCliente",
};

const initialState = {
  value: [],
  estado: {
    isLoading: false,
    success: false,
    error: false,
  },
};

const api = axios.create({
  baseURL: RUTA_FUNCTIONS,
});

export const obtenerClienteAsync = createAsyncThunk(
  "clientes/obtener",
  async () => {
    const values = await firebase.db
      .collection("clientes")
      .orderBy("nombre", "asc")
      .get();
    const clientes = values.docs.map((doc) => {
      return {
        id: doc.id,
        ...doc.data(),
      };
    });
    return clientes;
  }
);

export const crearClienteAsync = createAsyncThunk(
  "clientes/crear",
  async (data) => {
    await api.post(`clientes/${endpoints.crear}/${data.telefono}`, { data });
    const cliente = { ...data, id: data.telefono };
    return cliente;
  }
);

export const actualizarClienteAsync = createAsyncThunk(
  "clientes/actualizar",
  async (data) => {
    await api.put(`clientes/${endpoints.actualizar}/${data.id}`, { ...data });
    return data;
  }
);

export const eliminarClienteAsync = createAsyncThunk(
  "clientes/eliminar",
  async (id) => {
    await api.delete(`clientes/${endpoints.eliminar}/${id}`);
    return id;
  }
);

export const clientesReducer = createSlice({
  name: "clientes",
  initialState,
  reducers: {
    reiniciarEstados: (state) => {
      state.estado = initialState.estado;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(obtenerClienteAsync.pending, (state) => {
        state.estado = {
          isLoading: true,
          success: false,
          error: false,
        };
      })
      .addCase(obtenerClienteAsync.fulfilled, (state, action) => {
        state.estado = {
          isLoading: false,
          success: false,
          error: false,
        };
        state.value = action.payload;
      })
      .addCase(obtenerClienteAsync.rejected, (state, action) => {
        state.estado = {
          isLoading: false,
          success: false,
          error: CodeError(action.error.code),
        };
      })

      .addCase(crearClienteAsync.pending, (state) => {
        state.estado = {
          isLoading: true,
          success: false,
          error: false,
        };
      })
      .addCase(crearClienteAsync.fulfilled, (state, action) => {
        state.estado = {
          isLoading: false,
          success: "Registro Exitoso",
          error: false,
        };
        state.value.push({ ...action.payload });
      })
      .addCase(crearClienteAsync.rejected, (state, action) => {
        state.estado = {
          isLoading: false,
          success: false,
          error: CodeError(action.error.code),
        };
      })

      .addCase(actualizarClienteAsync.pending, (state) => {
        state.estado = {
          isLoading: true,
          success: false,
          error: false,
        };
      })
      .addCase(actualizarClienteAsync.fulfilled, (state, action) => {
        state.estado = {
          isLoading: false,
          success: "Exito, registro actualizado",
          error: false,
        };
        const index = state.value.findIndex(
          (item) => item.id === action.payload.id
        );
        state.value[index] = action.payload;
      })
      .addCase(actualizarClienteAsync.rejected, (state, action) => {
        state.estado = {
          isLoading: false,
          success: false,
          error: CodeError(action.error.code),
        };
      })

      .addCase(eliminarClienteAsync.pending, (state) => {
        state.estado = {
          isLoading: true,
          success: false,
          error: false,
        };
      })
      .addCase(eliminarClienteAsync.fulfilled, (state, action) => {
        state.estado = {
          isLoading: false,
          success: "Exito, registro eliminado",
          error: false,
        };
        state.value = state.value.filter((item) => item.id !== action.payload);
      })
      .addCase(eliminarClienteAsync.rejected, (state, action) => {
        state.estado = {
          isLoading: false,
          success: false,
          error: CodeError(action.error.code),
        };
      });
  },
});

export const { reiniciarEstados } = clientesReducer.actions;

export const initialClientes = (state) => state.clientes.value;
export const estadoProceso = (state) => state.clientes.estado;

export default clientesReducer.reducer;
