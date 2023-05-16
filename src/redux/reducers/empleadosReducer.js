import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { RUTA_FUNCTIONS } from "../config";
import { CodeError } from "../errors";
import { crearUsuarioAsync } from "../reducers/usuariosReducer";

const endpoints = {
  obtener: "api/getEmpleados",
  crear: "api/createEmpleado",
  actualizar: "api/updateEmpleado",
  eliminar: "api/deleteEmpleado",
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

export const obtenerEmpleadoAsync = createAsyncThunk(
  "empleados/obtener",
  async () => {
    const response = await api.get(`empleados/${endpoints.obtener}`);
    return response.data;
  }
);

export const crearEmpleadoAsync = createAsyncThunk(
  "empleados/crear",
  async (data, GetThunkAPI) => {
    const responseUser = await GetThunkAPI.dispatch(
      crearUsuarioAsync({
        correo: data.correo,
        password: data.password,
        nombre: data.nombre,
      })
    );
    if (responseUser.payload !== undefined) {
      const id = responseUser.payload;
      await api.post(`empleados/${endpoints.crear}/${id}`, {
        ...data,
      });
      const empleado = { ...data, id };
      return empleado;
    }
    //throw new Error(responseUser);
    throw responseUser;
  }
);

export const actualizarEmpleadoAsync = createAsyncThunk(
  "empleados/actualizar",
  async (data) => {
    await api.put(`empleados/${endpoints.actualizar}/${data.id}`, { ...data });
    return data;
  }
);

export const eliminarEmpleadoAsync = createAsyncThunk(
  "empleados/eliminar",
  async (id) => {
    await api.delete(`empleados/${endpoints.eliminar}/${id}`);
    return id;
  }
);

export const empleadosReducer = createSlice({
  name: "empleados",
  initialState,
  reducers: {
    reiniciarEstados: (state) => {
      state.estado = initialState.estado;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(obtenerEmpleadoAsync.pending, (state) => {
        state.estado = {
          isLoading: true,
          success: false,
          error: false,
        };
      })
      .addCase(obtenerEmpleadoAsync.fulfilled, (state, action) => {
        state.estado = {
          isLoading: false,
          success: false,
          error: false,
        };
        state.value = action.payload;
      })
      .addCase(obtenerEmpleadoAsync.rejected, (state, action) => {
        state.estado = {
          isLoading: false,
          success: false,
          error: CodeError(action.error.code),
        };
      })

      .addCase(crearEmpleadoAsync.pending, (state) => {
        state.estado = {
          isLoading: true,
          success: false,
          error: false,
        };
      })
      .addCase(crearEmpleadoAsync.fulfilled, (state, action) => {
        state.estado = {
          isLoading: false,
          success: "Registro Exitoso",
          error: false,
        };
        state.value.push({ ...action.payload });
      })
      .addCase(crearEmpleadoAsync.rejected, (state, action) => {
        state.estado = {
          isLoading: false,
          success: false,
          error: CodeError(action.error.code),
        };
      })

      .addCase(actualizarEmpleadoAsync.pending, (state) => {
        state.estado = {
          isLoading: true,
          success: false,
          error: false,
        };
      })
      .addCase(actualizarEmpleadoAsync.fulfilled, (state, action) => {
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
      .addCase(actualizarEmpleadoAsync.rejected, (state, action) => {
        state.estado = {
          isLoading: false,
          success: false,
          error: CodeError(action.error.code),
        };
      })

      .addCase(eliminarEmpleadoAsync.pending, (state) => {
        state.estado = {
          isLoading: true,
          success: false,
          error: false,
        };
      })
      .addCase(eliminarEmpleadoAsync.fulfilled, (state, action) => {
        state.estado = {
          isLoading: false,
          success: "Exito, registro eliminado",
          error: false,
        };
        state.value = state.value.filter((item) => item.id !== action.payload);
      })
      .addCase(eliminarEmpleadoAsync.rejected, (state, action) => {
        state.estado = {
          isLoading: false,
          success: false,
          error: CodeError(action.error.code),
        };
      });
  },
});

export const { reiniciarEstados } = empleadosReducer.actions;

export const initialEmpleados = (state) => state.empleados.value;
export const estadoProceso = (state) => state.empleados.estado;

export default empleadosReducer.reducer;
