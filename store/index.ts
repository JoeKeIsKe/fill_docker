import { configureStore } from '@reduxjs/toolkit';
import { walletReducer,contractReducer} from './reduce'
export default configureStore({
    reducer:{
        wallet: walletReducer,
        contract: contractReducer,
     
    }
})