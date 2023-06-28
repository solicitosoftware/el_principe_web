import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { RUTA_FUNCTIONS } from "../config";
import { CodeError } from "../errors";

const endpoints = {
  turnoDomicilio: "api/getTurnoDomicilio",
  turnoCaja: "api/getTurnoCaja",
  crearTirilla: "api/createTirilla",
  obtenerTirilla: "api/getTirilla",
  ActualizarTirilla: "api/updateTirilla",
  parametros: "api/getParametros",
};

const initialState = {
  value: {
    turnoDomicilio: "",
    turno: "",
    tirilla: {},
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

export const crearTirillaAsync = createAsyncThunk(
  "tirilla/crear",
  async (data) => {
    await api.post(`utils/${endpoints.crearTirilla}`, {
      data,
    });
  }
);

export const obtenerTirillaAsync = createAsyncThunk(
  "tirilla/obtener",
  async (data) => {
    const response = await api.put(`utils/${endpoints.obtenerTirilla}/${data}`);
    return response.data;
  }
);

export const actualizarTirillaAsync = createAsyncThunk(
  "tirilla/actualizar",
  async (data) => {
    await api.put(`utils/${endpoints.ActualizarTirilla}/${data.id}`, {
      ...data,
    });
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

      .addCase(crearTirillaAsync.pending, (state) => {
        state.estado = {
          isLoading: true,
          success: false,
          error: false,
        };
      })
      .addCase(crearTirillaAsync.fulfilled, (state) => {
        state.estado = {
          isLoading: false,
          success: true,
          error: false,
        };
      })
      .addCase(crearTirillaAsync.rejected, (state) => {
        state.estado = {
          isLoading: false,
          success: false,
          error: "Error, no fue posible guardar la boleta de ventas",
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

      .addCase(actualizarTirillaAsync.pending, (state) => {
        state.estado = {
          isLoading: true,
          success: false,
          error: false,
        };
      })
      .addCase(actualizarTirillaAsync.fulfilled, (state) => {
        state.estado = {
          isLoading: false,
          success: true,
          error: false,
        };
      })
      .addCase(actualizarTirillaAsync.rejected, (state) => {
        state.estado = {
          isLoading: false,
          success: false,
          error: "Error, no fue posible actualizar la boleta de ventas",
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
export const estadoProceso = (state) => state.utils.estado;

export default utilsReducer.reducer;
