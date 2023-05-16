import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { RUTA_FUNCTIONS } from "../config";
import { CodeError } from "../errors";

const endpoints = {
  obtener: "api/getDeudas",
  actualizar: "api/updateDeuda",
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

export const obtenerDeudaAsync = createAsyncThunk(
  "deudas/obtener",
  async () => {
    const response = await api.get(`deudas/${endpoints.obtener}`);
    return response.data;
  }
);

export const actualizarDeudaAsync = createAsyncThunk(
  "deudas/actualizar",
  async (id) => {
    await api.put(`deudas/${endpoints.actualizar}/${id}`);
    return id;
  }
);

export const deudasReducer = createSlice({
  name: "deudas",
  initialState,
  reducers: {
    reiniciarEstados: (state) => {
      state.estado = initialState.estado;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(obtenerDeudaAsync.pending, (state) => {
        state.estado = {
          isLoading: true,
          success: false,
          error: false,
        };
      })
      .addCase(obtenerDeudaAsync.fulfilled, (state, action) => {
        state.estado = {
          isLoading: false,
          success: false,
          error: false,
        };
        state.value = action.payload;
      })
      .addCase(obtenerDeudaAsync.rejected, (state, action) => {
        state.estado = {
          isLoading: false,
          success: false,
          error: CodeError(action.error.code),
        };
      })

      .addCase(actualizarDeudaAsync.pending, (state) => {
        state.estado = {
          isLoading: true,
          success: false,
          error: false,
        };
      })
      .addCase(actualizarDeudaAsync.fulfilled, (state, action) => {
        state.estado = {
          isLoading: false,
          success: "Exito, registro actualizado",
          error: false,
        };
        state.value = state.value.filter((item) => item.id !== action.payload);
      })
      .addCase(actualizarDeudaAsync.rejected, (state, action) => {
        state.estado = {
          isLoading: false,
          success: false,
          error: CodeError(action.error.code),
        };
      });
  },
});

export const { reiniciarEstados } = deudasReducer.actions;

export const initialDeudas = (state) => state.deudas.value;
export const estadoProceso = (state) => state.deudas.estado;

export default deudasReducer.reducer;
