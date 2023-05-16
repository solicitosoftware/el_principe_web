import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  value: [],
};

export const pedidosAppReducer = createSlice({
  name: "app",
  initialState,
  reducers: {
    agregarPedidos: (state, action) => {
      state.value = action.payload;
    },
  },
});

export const { agregarPedidos } = pedidosAppReducer.actions;

export const initialApp = (state) => state.app.value;

export default pedidosAppReducer.reducer;
