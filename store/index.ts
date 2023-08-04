import { configureStore } from '@reduxjs/toolkit';
import { walletReducer,contractReducer, commonReducer} from './reduce'
export default configureStore({
    reducer:{
        wallet: walletReducer,
        contract: contractReducer,
        commonStore: commonReducer,
    }
})