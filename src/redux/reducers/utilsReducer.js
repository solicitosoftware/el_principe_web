import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { RUTA_FUNCTIONS } from "../config";
import { CodeError } from "../errors";

const endpoints = {
  turnoDomicilio: "api/getTurnoDomicilio",
  turnoCaja: "api/getTurnoCaja",
  tirilla: "api/getTirilla",
  consecutivo: "api/getConsecutivo",
  parametros: "api/getParametros",
};

const initialState = {
  value: {
    turnoDomicilio: "",
    turno: "",
    tirilla: {},
    consecutivo: 0,
    parametros: {},
  },
  estado: {
    isLoading: false,
    success: false,
    error: false,
  },
};

const api = axios.create({
  baseURL: RUTA_FUNCTIONS,
});

export const obtenerTurnoDomicilioAsync = createAsyncThunk(
  "turnoDomicilio/obtener",
  async (data) => {
    const response = await api.put(`utils/${endpoints.turnoDomicilio}/${data}`);
    return response.data;
  }
);

export const obtenerTurnoCajaAsync = createAsyncThunk(
  "turnoCaja/obtener",
  async (data) => {
    const response = await api.put(`utils/${endpoints.turnoCaja}/${data}`);
    return response.data;
  }
);

export const obtenerConsecutivoAsync = createAsyncThunk(
  "consecutivo/obtener",
  async () => {
    const response = await api.get(`utils/${endpoints.consecutivo}`);
    return response.data;
  }
);

export const obtenerTirillaAsync = createAsyncThunk(
  "tirillaFecha/obtener",
  async (data) => {
    const response = await api.put(`utils/${endpoints.tirilla}/${data}`);
    return response.data.length > 0 && response.data[0];
  }
);

export const obtenerParametrosAsync = createAsyncThunk(
  "parametros/obtener",
  async () => {
    const response = await api.get(`utils/${endpoints.parametros}`);
    return response.data;
  }
);

export const utilsReducer = createSlice({
  name: "utils",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(obtenerTurnoDomicilioAsync.pending, (state) => {
        state.estado = {
          isLoading: true,
          success: false,
          error: false,
        };
      })
      .addCase(obtenerTurnoDomicilioAsync.fulfilled, (state, action) => {
        state.estado = {
          isLoading: false,
          success: false,
          error: false,
        };
        state.value = {
          ...state.value,
          turnoDomicilio: action.payload ? action.payload + 1 : 1,
          turno: null,
        };
      })
      .addCase(obtenerTurnoDomicilioAsync.rejected, (state, action) => {
        state.estado = {
          isLoading: false,
          success: false,
          error: CodeError(action.error.code),
        };
      })

      .addCase(obtenerTurnoCajaAsync.pending, (state) => {
        state.estado = {
          isLoading: true,
          success: false,
          error: false,
        };
      })
      .addCase(obtenerTurnoCajaAsync.fulfilled, (state, action) => {
        state.estado = {
          isLoading: false,
          success: false,
          error: false,
        };
        state.value = {
          ...state.value,
          turnoDomicilio: null,
          turno: action.payload ? action.payload + 1 : 1,
        };
      })
      .addCase(obtenerTurnoCajaAsync.rejected, (state, action) => {
        state.estado = {
          isLoading: false,
          success: false,
          error: CodeError(action.error.code),
        };
      })

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
        state.value = {
          ...state.value,
          consecutivo: action.payload,
        };
      })
      .addCase(obtenerConsecutivoAsync.rejected, (state, action) => {
        state.estado = {
          isLoading: false,
          success: false,
          error: CodeError(action.error.code),
        };
      })

      .addCase(obtenerTirillaAsync.pending, (state) => {
        state.estado = {
          isLoading: true,
          success: false,
          error: false,
        };
      })
      .addCase(obtenerTirillaAsync.fulfilled, (state, action) => {
        state.estado = {
          isLoading: false,
          success: false,
          error: false,
        };
        state.value = {
          ...state.value,
          tirilla: action.payload,
        };
      })
      .addCase(obtenerTirillaAsync.rejected, (state, action) => {
        state.estado = {
          isLoading: false,
          success: false,
          error: CodeError(action.error.code),
        };
      })

      .addCase(obtenerParametrosAsync.pending, (state) => {
        state.estado = {
          isLoading: true,
          success: false,
          error: false,
        };
      })
      .addCase(obtenerParametrosAsync.fulfilled, (state, action) => {
        state.estado = {
          isLoading: false,
          success: false,
          error: false,
        };
        state.value = {
          ...state.value,
          parametros: action.payload,
        };
      })
      .addCase(obtenerParametrosAsync.rejected, (state, action) => {
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
