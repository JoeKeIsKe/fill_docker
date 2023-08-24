import { createSlice } from "@reduxjs/toolkit";
import { walletState, contractState, commonState } from "./type";

const walletSlice = createSlice({
  name: "wallet",
  initialState: {
    wallet: "",
    account: "",
    chainId: "",
  },
  reducers: {
    change: (state: walletState, action: any) => {
      let newState = { ...state, ...action.payload };
      localStorage.setItem("login", JSON.stringify(newState));
      return newState;
    },
  },
});

const contractSlice = createSlice({
  name: "contract",
  initialState: {
    FIL: 0,
    FIT: 0,
    currentRate: 1,
    loading: false,
    minerList: [],
    borrowList: [],
    userBorrow: undefined,
    filInfo: undefined,
    balance: {
      FIL: 0,
      FIT: 0,
    },
  },
  reducers: {
    change: (state: contractState, action) => {
      return { ...state, ...action.payload };
    },
  },
});

const commonSlice = createSlice({
  name: "common",
  initialState: {
    refreshStakeData: false,
    refreshAllData: false,
    sendLoading: {},
  },
  reducers: {
    change: (state: commonState, action) => {
      return { ...state, ...action.payload };
    },
  },
});

const walletReducer = walletSlice.reducer;
const contractReducer = contractSlice.reducer;
const commonReducer = commonSlice.reducer;

export { walletReducer, contractReducer, commonReducer };
