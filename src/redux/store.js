import { combineReducers, configureStore } from "@reduxjs/toolkit";
import categoriasReducer from "./reducers/categoriasReducer";
import productosReducer from "./reducers/productosReducer";
import clientesReducer from "./reducers/clientesReducer";
import empleadosReducer from "./reducers/empleadosReducer";
import deudasReducer from "./reducers/deudasReducer";
import pedidosReducer from "./reducers/pedidosReducer";
import barriosReducer from "./reducers/barriosReducer";
import municipiosReducer from "./reducers/municipiosReducer";
import usuariosReducer from "./reducers/usuariosReducer";
import utilsReducer from "./reducers/utilsReducer";
import pedidosAppReducer from "./reducers/pedidosAppReducer";
import logger from "redux-logger";

const combinedReducer = combineReducers({
  categorias: categoriasReducer,
  productos: productosReducer,
  clientes: clientesReducer,
  empleados: empleadosReducer,
  deudas: deudasReducer,
  pedidos: pedidosReducer,
  barrios: barriosReducer,
  municipios: municipiosReducer,
  usuarios: usuariosReducer,
  utils: utilsReducer,
  app: pedidosAppReducer,
});

const rootReducer = (state, action) => {
  if (action.type === "usuarios/logout") {
    state = undefined;
  }
  return combinedReducer(state, action);
};

export default configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
});
