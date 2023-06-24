import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import firebase from "../../firebase";
import { CodeError } from "../errors";

const initialState = {
  value: null,
  estado: {
    isLoading: false,
    success: false,
    error: false,
  },
};

const actionCodeSettings = {
  url: process.env.REACT_APP_URL,
  handleCodeInApp: true,
};

export const loginUsuarioAsync = createAsyncThunk(
  "login/usuario",
  async (data) => {
    if (firebase.auth.isSignInWithEmailLink(data)) {
      const result = await firebase.auth.signInWithEmailLink(
        process.env.REACT_APP_USER,
        data
      );
      return result.user.refreshToken;
    }
  }
);

export const enviarEmailAsync = createAsyncThunk(
  "login/enviar",
  async (data) => {
    firebase.auth.sendSignInLinkToEmail(data, actionCodeSettings);
  }
);

export const loginReducer = createSlice({
  name: "login",
  initialState,
  reducers: {
    logout: () => {
      firebase.auth.signOut();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUsuarioAsync.pending, (state) => {
        state.estado = {
          isLoading: true,
          success: false,
          error: false,
        };
      })
      .addCase(loginUsuarioAsync.fulfilled, (state, action) => {
        state.estado = {
          isLoading: false,
          success: true,
          error: false,
        };
        state.value = action.payload;
      })
      .addCase(loginUsuarioAsync.rejected, (state, action) => {
        state.estado = {
          isLoading: false,
          success: false,
          error: CodeError(action.error.code),
        };
      })

      .addCase(enviarEmailAsync.pending, (state) => {
        state.estado = {
          isLoading: true,
          success: false,
          error: false,
        };
      })
      .addCase(enviarEmailAsync.fulfilled, (state, action) => {
        state.estado = {
          isLoading: false,
          success:
            "Se envió un enlace de inicio de sesión al correo electrónico",
          error: false,
        };
        state.value = action.payload;
      })
      .addCase(enviarEmailAsync.rejected, (state, action) => {
        state.estado = {
          isLoading: false,
          success: false,
          error: CodeError(action.error.code),
        };
      });
  },
});

export const { logout } = loginReducer.actions;

export const initialLogin = (state) => state.login.value;
export const estadoProceso = (state) => state.login.estado;

export default loginReducer.reducer;
