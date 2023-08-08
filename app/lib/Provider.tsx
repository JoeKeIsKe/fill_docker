"use client";

import "../custom.scss";
import { ReactNode, useState, useEffect } from "react";
import Header from "@/components/header";
import { Provider, useDispatch } from "react-redux";
import store from "@/store";
import { ConfigProvider } from "antd";
import theme from "./ThemeConfig";
import Loading from "../loading";
import GlobalLoading from "./GlobalLoading";
import { MetaMaskContextProvider } from "@/hooks/useMetaMask";
import "../custom.scss";

function CustomProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (window) {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <MetaMaskContextProvider>
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
    </MetaMaskContextProvider>
  );
}

export default CustomProvider;
