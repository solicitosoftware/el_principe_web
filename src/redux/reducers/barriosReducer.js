import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { RUTA_FUNCTIONS } from "../config";
import { CodeError } from "../errors";

const endpoints = {
  obtener: "api/getBarrios",
  crear: "api/createBarrio",
  actualizar: "api/updateBarrio",
  eliminar: "api/deleteBarrio",
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

export const obtenerBarrioAsync = createAsyncThunk(
  "barrios/obtener",
  async () => {
    const response = await api.get(`barrios/${endpoints.obtener}`);
    return response.data;
  }
);

export const crearBarrioAsync = createAsyncThunk(
  "barrios/crear",
  async (data) => {
    const response = await api.post(`barrios/${endpoints.crear}`, { data });
    const id = response.data._path.segments[1];
    const barrio = { ...data, id };
    return barrio;
  }
);

export const actualizarBarrioAsync = createAsyncThunk(
  "barrios/actualizar",
  async (data) => {
    await api.put(`barrios/${endpoints.actualizar}/${data.id}`, { ...data });
    return data;
  }
);

export const eliminarBarrioAsync = createAsyncThunk(
  "barrios/eliminar",
  async (id) => {
    await api.delete(`barrios/${endpoints.eliminar}/${id}`);
    return id;
  }
);

export const barriosReducer = createSlice({
  name: "barrios",
  initialState,
  reducers: {
    reiniciarEstados: (state) => {
      state.estado = initialState.estado;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(obtenerBarrioAsync.pending, (state) => {
        state.estado = {
          isLoading: true,
          success: false,
          error: false,
        };
      })
      .addCase(obtenerBarrioAsync.fulfilled, (state, action) => {
        state.estado = {
          isLoading: false,
          success: false,
          error: false,
        };
        state.value = action.payload;
      })
      .addCase(obtenerBarrioAsync.rejected, (state, action) => {
        state.estado = {
          isLoading: false,
          success: false,
          error: CodeError(action.error.code),
        };
      })
      .addCase(crearBarrioAsync.pending, (state) => {
        state.estado = {
          isLoading: true,
          success: false,
          error: false,
        };
      })
      .addCase(crearBarrioAsync.fulfilled, (state, action) => {
        state.estado = {
          isLoading: false,
          success: "Registro Exitoso",
          error: false,
        };
        state.value.push({ ...action.payload });
      })
      .addCase(crearBarrioAsync.rejected, (state, action) => {
        state.estado = {
          isLoading: false,
          success: false,
          error: CodeError(action.error.code),
        };
      })
      .addCase(actualizarBarrioAsync.pending, (state) => {
        state.estado = {
          isLoading: true,
          success: false,
          error: false,
        };
      })
      .addCase(actualizarBarrioAsync.fulfilled, (state, action) => {
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
      .addCase(actualizarBarrioAsync.rejected, (state, action) => {
        state.estado = {
          isLoading: false,
          success: false,
          error: CodeError(action.error.code),
        };
      })

      .addCase(eliminarBarrioAsync.pending, (state) => {
        state.estado = {
          isLoading: true,
          success: false,
          error: false,
        };
      })
      .addCase(eliminarBarrioAsync.fulfilled, (state, action) => {
        state.estado = {
          isLoading: false,
          success: "Exito, registro eliminado",
          error: false,
        };
        state.value = state.value.filter((item) => item.id !== action.payload);
      })
      .addCase(eliminarBarrioAsync.rejected, (state, action) => {
        state.estado = {
          isLoading: false,
          success: false,
          error: CodeError(action.error.code),
        };
      });
  },
});

export const { reiniciarEstados } = barriosReducer.actions;

export const initialBarrios = (state) => state.barrios.value;
export const estadoProceso = (state) => state.barrios.estado;

export default barriosReducer.reducer;
