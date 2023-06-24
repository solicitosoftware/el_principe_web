import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { RUTA_FUNCTIONS } from "../config";
import { CodeError } from "../errors";

const endpoints = {
  obtener: "api/getPedidos",
  eliminar: "api/deletePedidos",
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

export const obtenerPedidoAsync = createAsyncThunk(
  "pedidos/obtener",
  async (data) => {
    const response = await api.post(`pedidos/${endpoints.obtener}`, {
      ...data,
    });
    return response.data.filter((x) => x.estado !== "Cancelado");
  }
);

export const eliminarPedidoAsync = createAsyncThunk(
  "pedidos/eliminar",
  async (data) => {
    await api.post(`pedidos/${endpoints.eliminar}`, {
      ...data,
    });
  }
);

export const pedidosReducer = createSlice({
  name: "pedidos",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(obtenerPedidoAsync.pending, (state) => {
        state.estado = {
          isLoading: true,
          success: false,
          error: false,
        };
      })
      .addCase(obtenerPedidoAsync.fulfilled, (state, action) => {
        state.estado = {
          isLoading: false,
          success: false,
          error: false,
        };
        state.value = action.payload;
      })
      .addCase(obtenerPedidoAsync.rejected, (state, action) => {
        state.estado = {
          isLoading: false,
          success: false,
          error: CodeError(action.error.code),
        };
      })

      .addCase(eliminarPedidoAsync.pending, (state) => {
        state.estado = {
          isLoading: true,
          success: false,
          error: false,
        };
      })
      .addCase(eliminarPedidoAsync.fulfilled, (state, action) => {
        state.estado = {
          isLoading: false,
          success: "Pedidos procesados con exito",
          error: false,
        };
      })
      .addCase(eliminarPedidoAsync.rejected, (state, action) => {
        state.estado = {
          isLoading: false,
          success: false,
          error: CodeError(action.error.code),
        };
      });
  },
});

export const initialPedidos = (state) => state.pedidos.value;
export const estadoProceso = (state) => state.pedidos.estado;

export default pedidosReducer.reducer;
