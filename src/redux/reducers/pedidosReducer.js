import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { RUTA_FUNCTIONS } from "../config";
import { CodeError } from "../errors";

const endpoints = {
  obtener: "api/getPedidos",
  crear: "api/createPedido",
  actualizar: "api/updatePedido",
  obtenerPedido: "api/getPedidoDomicilio",
  actualizarDomicilio: "api/updatePedidoDomicilio",
  actualizarEstado: "api/updateEstadoPedido",
  actualizarDomiciliario: "api/updateDomiciliario",
  actualizarEntrega: "api/updateEntregaPedido",
  cancelar: "api/cancelPedido",
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
    return response.data;
  }
);

export const obtenerPedidoIdAsync = createAsyncThunk(
  "pedidos/obtenerPedido",
  async (data) => {
    const response = await api.put(
      `pedidos/${endpoints.obtenerPedido}/${data}`
    );
    return response.data;
  }
);

export const obtenerPedidoDomicilioAsync = createAsyncThunk(
  "pedidos/obtenerDomicilio",
  async (data) => {
    const response = await api.post(`pedidos/${endpoints.obtener}`, {
      ...data,
    });
    return response.data;
  }
);

export const crearPedidoAsync = createAsyncThunk(
  "pedidos/crear",
  async (data) => {
    const response = await api.post(`pedidos/${endpoints.crear}`, { data });
    const id = response.data._path.segments[1];
    return id;
  }
);

export const actualizarPedidoAsync = createAsyncThunk(
  "pedidos/actualizar",
  async (data) => {
    const response = await api.put(
      `pedidos/${endpoints.actualizar}/${data.id}`,
      { ...data }
    );
    return { ...data, movimiento: response.data._writeTime };
  }
);

export const actualizarPedidoDomicilioAsync = createAsyncThunk(
  "pedidos/actualizarDomicilio",
  async (data) => {
    const response = await api.put(
      `pedidos/${endpoints.actualizarDomicilio}/${data.id}`,
      { ...data }
    );
    return { ...data, movimiento: response.data._writeTime };
  }
);

export const actualizarEstadoPedidoAsync = createAsyncThunk(
  "pedidos/actualizarEstado",
  async (data) => {
    const response = await api.put(
      `pedidos/${endpoints.actualizarEstado}/${data.id}`,
      {
        ...data,
      }
    );
    return { ...data, movimiento: response.data._writeTime };
  }
);

export const actualizarDomiciliarioPedidoAsync = createAsyncThunk(
  "pedidos/actualizarDomiciliario",
  async (data) => {
    await api.put(`pedidos/${endpoints.actualizarDomiciliario}/${data.id}`, {
      ...data,
    });
    return { ...data };
  }
);

export const actualizarEntregaPedidoAsync = createAsyncThunk(
  "pedidos/actualizarEntrega",
  async (data) => {
    const response = await api.put(
      `pedidos/${endpoints.actualizarEntrega}/${data.id}`,
      {
        ...data,
      }
    );
    return { ...data, entrega: response.data._writeTime };
  }
);

export const cancelarPedidoAsync = createAsyncThunk(
  "pedidos/cancelar",
  async (data) => {
    const response = await api.put(`pedidos/${endpoints.cancelar}/${data.id}`, {
      ...data,
    });
    return { ...data, movimiento: response.data._writeTime };
  }
);

export const pedidosReducer = createSlice({
  name: "pedidos",
  initialState,
  reducers: {
    reiniciarEstados: (state) => {
      state.estado = initialState.estado;
    },
    cancelarPedidoApp: (state, { payload }) => {
      api.put(`pedidos/${endpoints.cancelar}/${payload.id}`, {
        ...payload,
      });
    },
  },
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
        state.value = action.payload.filter((x) => !x.cliente);
      })
      .addCase(obtenerPedidoAsync.rejected, (state, action) => {
        state.estado = {
          isLoading: false,
          success: false,
          error: CodeError(action.error.code),
        };
      })

      .addCase(obtenerPedidoDomicilioAsync.pending, (state) => {
        state.estado = {
          isLoading: true,
          success: false,
          error: false,
        };
      })
      .addCase(obtenerPedidoDomicilioAsync.fulfilled, (state, action) => {
        state.estado = {
          isLoading: false,
          success: false,
          error: false,
        };
        state.value = action.payload.filter((x) => x.cliente);
      })
      .addCase(obtenerPedidoDomicilioAsync.rejected, (state, action) => {
        state.estado = {
          isLoading: false,
          success: false,
          error: CodeError(action.error.code),
        };
      })

      .addCase(crearPedidoAsync.pending, (state) => {
        state.estado = {
          isLoading: true,
          success: false,
          error: false,
        };
      })
      .addCase(crearPedidoAsync.fulfilled, (state, action) => {
        state.estado = {
          isLoading: false,
          success: "Registro Exitoso",
          error: false,
        };
        state.value.push({ ...action.payload });
      })
      .addCase(crearPedidoAsync.rejected, (state, action) => {
        state.estado = {
          isLoading: false,
          success: false,
          error: CodeError(action.error.code),
        };
      })

      .addCase(actualizarPedidoAsync.pending, (state) => {
        state.estado = {
          isLoading: true,
          success: false,
          error: false,
        };
      })
      .addCase(actualizarPedidoAsync.fulfilled, (state, action) => {
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
      .addCase(actualizarPedidoAsync.rejected, (state, action) => {
        state.estado = {
          isLoading: false,
          success: false,
          error: CodeError(action.error.code),
        };
      })

      .addCase(actualizarPedidoDomicilioAsync.pending, (state) => {
        state.estado = {
          isLoading: true,
          success: false,
          error: false,
        };
      })
      .addCase(actualizarPedidoDomicilioAsync.fulfilled, (state, action) => {
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
      .addCase(actualizarPedidoDomicilioAsync.rejected, (state, action) => {
        state.estado = {
          isLoading: false,
          success: false,
          error: CodeError(action.error.code),
        };
      })

      .addCase(actualizarDomiciliarioPedidoAsync.pending, (state) => {
        state.estado = {
          isLoading: true,
          success: false,
          error: false,
        };
      })
      .addCase(actualizarDomiciliarioPedidoAsync.fulfilled, (state, action) => {
        state.estado = {
          isLoading: false,
          success: false,
          error: false,
        };
        const index = state.value.findIndex(
          (item) => item.id === action.payload.id
        );
        state.value[index] = action.payload;
      })
      .addCase(actualizarDomiciliarioPedidoAsync.rejected, (state, action) => {
        state.estado = {
          isLoading: false,
          success: false,
          error: CodeError(action.error.code),
        };
      })

      .addCase(actualizarEstadoPedidoAsync.pending, (state) => {
        state.estado = {
          isLoading: true,
          success: false,
          error: false,
        };
      })
      .addCase(actualizarEstadoPedidoAsync.fulfilled, (state, action) => {
        state.estado = {
          isLoading: false,
          success: "Exito, registro impreso",
          error: false,
        };
        const index = state.value.findIndex(
          (item) => item.id === action.payload.id
        );
        state.value[index] = action.payload;
      })
      .addCase(actualizarEstadoPedidoAsync.rejected, (state, action) => {
        state.estado = {
          isLoading: false,
          success: false,
          error: CodeError(action.error.code),
        };
      })

      .addCase(actualizarEntregaPedidoAsync.pending, (state) => {
        state.estado = {
          isLoading: true,
          success: false,
          error: false,
        };
      })
      .addCase(actualizarEntregaPedidoAsync.fulfilled, (state, action) => {
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
      .addCase(actualizarEntregaPedidoAsync.rejected, (state, action) => {
        state.estado = {
          isLoading: false,
          success: false,
          error: CodeError(action.error.code),
        };
      })

      .addCase(cancelarPedidoAsync.pending, (state) => {
        state.estado = {
          isLoading: true,
          success: false,
          error: false,
        };
      })
      .addCase(cancelarPedidoAsync.fulfilled, (state, action) => {
        state.estado = {
          isLoading: false,
          success: "Exito, registro cancelado",
          error: false,
        };
        const index = state.value.findIndex(
          (item) => item.id === action.payload.id
        );
        state.value[index] = action.payload;
      })
      .addCase(cancelarPedidoAsync.rejected, (state, action) => {
        state.estado = {
          isLoading: false,
          success: false,
          error: CodeError(action.error.code),
        };
      });
  },
});

export const { reiniciarEstados, cancelarPedidoApp } = pedidosReducer.actions;

export const initialPedidos = (state) => state.pedidos.value;
export const estadoProceso = (state) => state.pedidos.estado;

export default pedidosReducer.reducer;
