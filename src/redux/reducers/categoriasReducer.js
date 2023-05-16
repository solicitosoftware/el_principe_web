import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { RUTA_FUNCTIONS } from "../config";
import { CodeError } from "../errors";

const endpoints = {
  obtener: "api/getCategorias",
  crear: "api/createCategoria",
  actualizar: "api/updateCategoria",
  eliminar: "api/deleteCategoria",
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

export const obtenerCategoriaAsync = createAsyncThunk(
  "categorias/obtener",
  async () => {
    const response = await api.get(`categorias/${endpoints.obtener}`);
    return response.data;
  }
);

export const crearCategoriaAsync = createAsyncThunk(
  "categorias/crear",
  async (data) => {
    const response = await api.post(`categorias/${endpoints.crear}`, { data });
    const id = response.data._path.segments[1];
    const categoria = { ...data, id };
    return categoria;
  }
);

export const actualizarCategoriaAsync = createAsyncThunk(
  "categorias/actualizar",
  async (data) => {
    await api.put(`categorias/${endpoints.actualizar}/${data.id}`, { ...data });
    return data;
  }
);

export const eliminarCategoriaAsync = createAsyncThunk(
  "categorias/eliminar",
  async (id) => {
    await api.delete(`categorias/${endpoints.eliminar}/${id}`);
    return id;
  }
);

export const categoriasReducer = createSlice({
  name: "categorias",
  initialState,
  reducers: {
    reiniciarEstados: (state) => {
      state.estado = initialState.estado;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(obtenerCategoriaAsync.pending, (state) => {
        state.estado = {
          isLoading: true,
          success: false,
          error: false,
        };
      })
      .addCase(obtenerCategoriaAsync.fulfilled, (state, action) => {
        state.estado = {
          isLoading: false,
          success: false,
          error: false,
        };
        state.value = action.payload;
      })
      .addCase(obtenerCategoriaAsync.rejected, (state, action) => {
        state.estado = {
          isLoading: false,
          success: false,
          error: CodeError(action.error.code),
        };
      })

      .addCase(crearCategoriaAsync.pending, (state) => {
        state.estado = {
          isLoading: true,
          success: false,
          error: false,
        };
      })
      .addCase(crearCategoriaAsync.fulfilled, (state, action) => {
        state.estado = {
          isLoading: false,
          success: "Registro Exitoso",
          error: false,
        };
        state.value.push({ ...action.payload });
      })
      .addCase(crearCategoriaAsync.rejected, (state, action) => {
        state.estado = {
          isLoading: false,
          success: false,
          error: CodeError(action.error.code),
        };
      })

      .addCase(actualizarCategoriaAsync.pending, (state) => {
        state.estado = {
          isLoading: true,
          success: false,
          error: false,
        };
      })
      .addCase(actualizarCategoriaAsync.fulfilled, (state, action) => {
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
      .addCase(actualizarCategoriaAsync.rejected, (state, action) => {
        state.estado = {
          isLoading: false,
          success: false,
          error: CodeError(action.error.code),
        };
      })

      .addCase(eliminarCategoriaAsync.pending, (state) => {
        state.estado = {
          isLoading: true,
          success: false,
          error: false,
        };
      })
      .addCase(eliminarCategoriaAsync.fulfilled, (state, action) => {
        state.estado = {
          isLoading: false,
          success: "Exito, registro eliminado",
          error: false,
        };
        state.value = state.value.filter((item) => item.id !== action.payload);
      })
      .addCase(eliminarCategoriaAsync.rejected, (state, action) => {
        state.estado = {
          isLoading: false,
          success: false,
          error: CodeError(action.error.code),
        };
      });
  },
});

export const { reiniciarEstados } = categoriasReducer.actions;

export const initialCategorias = (state) => state.categorias.value;
export const estadoProceso = (state) => state.categorias.estado;

export default categoriasReducer.reducer;
