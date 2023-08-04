"use client";

import { ReactNode, useEffect } from "react";
import Header from "@/components/header";
import { Provider, useSelector } from "react-redux";
import store from "@/store";
import { ConfigProvider, Spin } from "antd";
import theme from "./ThemeConfig";
import GlobalLoading from './GlobalLoading'

function CustomProvider({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <ConfigProvider theme={theme}>
        <GlobalLoading>
          <div className="max-w-screen-xl p-5 m-auto">
            <Header />
            {children}
          </div>
        </GlobalLoading>
      </ConfigProvider>
    </Provider>
  );
}

export default CustomProvider;
