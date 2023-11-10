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
import { GlobalModal } from "@/components/globalModal";
import "../custom.scss";

interface ConfirmProps {
  open: boolean;
  type?: "success" | "warning";
  title?: string;
  desc?: string;
  callback?: () => void;
}

const defaultConfirmProps: ConfirmProps = {
  open: false,
};

function CustomProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [confirmProps, setConfirmProps] =
    useState<ConfirmProps>(defaultConfirmProps);

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
        <GlobalModal>
          <ConfigProvider theme={theme}>
            <GlobalLoading>
              <div className="max-w-screen-xl p-5 m-auto mt-[80px]">
                <Header />
                {children}
              </div>
            </GlobalLoading>
          </ConfigProvider>
        </GlobalModal>
      </Provider>
    </MetaMaskContextProvider>
  );
}

export default CustomProvider;
