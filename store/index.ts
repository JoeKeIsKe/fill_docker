import { configureStore } from "@reduxjs/toolkit";
import {
  walletReducer,
  contractReducer,
  panelReducerr,
  commonReducer,
} from "./reduce";
export default configureStore({
  reducer: {
    wallet: walletReducer,
    contract: contractReducer,
    panel: panelReducerr,
    commonStore: commonReducer,
  },
});
