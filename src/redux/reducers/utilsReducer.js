import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { RUTA_FUNCTIONS } from "../config";
import { CodeError } from "../errors";

const endpoints = {
  consecutivo: "api/getConsecutivo",
};

const initialState = {
  value: 0,
  estado: {
    isLoading: false,
    success: false,
    error: false,
  },
};

const api = axios.create({
  baseURL: RUTA_FUNCTIONS,
});

export const obtenerConsecutivoAsync = createAsyncThunk(
  "consecutivo/obtener",
  async () => {
    const response = await api.get(`utils/${endpoints.consecutivo}`);
    return response.data;
  }
);

export const utilsReducer = createSlice({
  name: "utils",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(obtenerConsecutivoAsync.pending, (state) => {
        state.estado = {
          isLoading: true,
          success: false,
          error: false,
        };
      })
      .addCase(obtenerConsecutivoAsync.fulfilled, (state, action) => {
        state.estado = {
          isLoading: false,
          success: false,
          error: false,
        };
        state.value = action.payload + 1;
      })
      .addCase(obtenerConsecutivoAsync.rejected, (state, action) => {
        state.estado = {
          isLoading: false,
          success: false,
          error: CodeError(action.error.code),
        };
      });
  },
});

export const initialUtils = (state) => state.utils.value;
export const estadoProceso = (state) => state.usuarios.estado;

export default utilsReducer.reducer;
