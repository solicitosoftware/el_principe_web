import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { RUTA_FUNCTIONS } from "../config";
import { CodeError } from "../errors";

const endpoints = {
  obtener: "api/getProductos",
  crear: "api/createProducto",
  actualizar: "api/updateProducto",
  eliminar: "api/deleteProducto",
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

export const obtenerProductoAsync = createAsyncThunk(
  "productos/obtener",
  async () => {
    const response = await api.get(`productos/${endpoints.obtener}`);
    return response.data;
  }
);

export const crearProductoAsync = createAsyncThunk(
  "productos/crear",
  async (data) => {
    const response = await api.post(`productos/${endpoints.crear}`, { data });
    const id = response.data._path.segments[1];
    const producto = { ...data, id };
    return producto;
  }
);

export const actualizarProductoAsync = createAsyncThunk(
  "productos/actualizar",
  async (data) => {
    await api.put(`productos/${endpoints.actualizar}/${data.id}`, { ...data });
    return data;
  }
);

export const eliminarProductoAsync = createAsyncThunk(
  "productos/eliminar",
  async (id) => {
    await api.delete(`productos/${endpoints.eliminar}/${id}`);
    return id;
  }
);

export const productosReducer = createSlice({
  name: "productos",
  initialState,
  reducers: {
    reiniciarEstados(state) {
      state.estado = initialState.estado;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(obtenerProductoAsync.pending, (state) => {
        state.estado = {
          isLoading: true,
          success: false,
          error: false,
        };
      })
      .addCase(obtenerProductoAsync.fulfilled, (state, action) => {
        state.estado = {
          isLoading: false,
          success: false,
          error: false,
        };
        state.value = action.payload;
      })
      .addCase(obtenerProductoAsync.rejected, (state, action) => {
        state.estado = {
          isLoading: false,
          success: false,
          error: CodeError(action.error.code),
        };
      })

      .addCase(crearProductoAsync.pending, (state) => {
        state.estado = {
          isLoading: true,
          success: false,
          error: false,
        };
      })
      .addCase(crearProductoAsync.fulfilled, (state, action) => {
        state.estado = {
          isLoading: false,
          success: "Registro Exitoso",
          error: false,
        };
        state.value.push({ ...action.payload });
      })
      .addCase(crearProductoAsync.rejected, (state, action) => {
        state.estado = {
          isLoading: false,
          success: false,
          error: CodeError(action.error.code),
        };
      })

      .addCase(actualizarProductoAsync.pending, (state) => {
        state.estado = {
          isLoading: true,
          success: false,
          error: false,
        };
      })
      .addCase(actualizarProductoAsync.fulfilled, (state, action) => {
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
      .addCase(actualizarProductoAsync.rejected, (state, action) => {
        state.estado = {
          isLoading: false,
          success: false,
          error: CodeError(action.error.code),
        };
      })

      .addCase(eliminarProductoAsync.pending, (state) => {
        state.estado = {
          isLoading: true,
          success: false,
          error: false,
        };
      })
      .addCase(eliminarProductoAsync.fulfilled, (state, action) => {
        state.estado = {
          isLoading: false,
          success: "Exito, registro eliminado",
          error: false,
        };
        state.value = state.value.filter((item) => item.id !== action.payload);
      })
      .addCase(eliminarProductoAsync.rejected, (state, action) => {
        state.estado = {
          isLoading: false,
          success: false,
          error: CodeError(action.error.code),
        };
      });
  },
});

export const { reiniciarEstados } = productosReducer.actions;

export const initialProductos = (state) => state.productos.value;
export const estadoProceso = (state) => state.productos.estado;

export default productosReducer.reducer;
