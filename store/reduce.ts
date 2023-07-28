import { createSlice } from "@reduxjs/toolkit";
import { walletState,contractState } from "./type";



 const walletSlice = createSlice({
  name: "wallet",
    initialState: {
      wallet: '',
      account:'',
  },
  reducers: {
      change: (state: walletState, action: any) => {
      let newState = { ...state, ...action.payload };
        localStorage.setItem('login', JSON.stringify(newState))
        return newState;
    },
  },
 });



const contractSlice = createSlice({
    name: 'FIT_contract',
    initialState: {
      FIL: '',
      FIT: "",
      loading:false,
      minerList: [],
      borrowList:[]
    },
    reducers: {
      change: (state: contractState, action) => {
            return { ...state, ...action.payload }
        },
      
    }
})





 const walletReducer = walletSlice.reducer;
const contractReducer = contractSlice.reducer;


export  {walletReducer,contractReducer}