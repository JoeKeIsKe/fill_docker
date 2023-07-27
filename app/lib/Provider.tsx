
'use client'

import { ReactNode, useEffect } from 'react'
import Header from '@/components/header';
import { Provider, useDispatch } from "react-redux";
import store from "@/store";
import { ConfigProvider } from 'antd';
import theme from './ThemeConfig';


function CustomProvider({ children }: { children: ReactNode }) { 

  return <Provider store={store}>
    <ConfigProvider theme={theme}>
     <div className='max-w-screen-xl p-5 m-auto'>
            <Header />
            {children}
          </div> 
    </ConfigProvider>
    
       
        </Provider>
}

export default CustomProvider