import { combineReducers, configureStore } from "@reduxjs/toolkit";
import pedidosReducer from "./reducers/pedidosReducer";
import utilsReducer from "./reducers/utilsReducer";
import loginReducer from "./reducers/loginReducer";
import logger from "redux-logger";

const combinedReducer = combineReducers({
  pedidos: pedidosReducer,
  utils: utilsReducer,
  login: loginReducer,
});

const rootReducer = (state, action) => {
  if (action.type === "login/logout") {
    state = undefined;
  }
  return combinedReducer(state, action);
};

export default configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
});
