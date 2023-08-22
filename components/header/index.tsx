"use client";

import Image from "next/image";
import logo from "@/assets/logo.svg";
import Link from "next/link";
import { RouterList } from "@/constants";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useMetaMask } from "@/hooks/useMetaMask";
import data_fetcher_contract from "@/server/data_fetcher";
import { useSelector } from "react-redux";
import { rootState } from "@/store/type";
import notification from "antd/es/notification";
import store from "@/store";

function Header() {
  const dispath = useDispatch();
  const { connectButton, currentAccount } = useMetaMask();

  const [api, contextHolder] = notification.useNotification();

  const { filInfo } = useSelector((state: rootState) => state?.contract);
  const { refreshAllData } = useSelector(
    (state: rootState) => state?.commonStore
  );

  useEffect(() => {
    const wallet_login = JSON.parse(localStorage?.getItem("login") || "{}");
    if (wallet_login?.account) {
      dispath({
        type: "wallet/change",
        payload: {
          wallet: wallet_login.wallet,
          account: wallet_login.account,
        },
      });
    }
  }, []);

  useEffect(() => {
    if (!filInfo || refreshAllData) {
      data_fetcher_contract.fetchAllData();
      store.dispatch({
        type: "common/change",
        payload: { refreshAllData: false },
      });
    }
  }, [currentAccount, filInfo, refreshAllData]);

  useEffect(() => {
    // catch the errors from MetaMask
    const handleRejectionError = (event: PromiseRejectionEvent) => {
      const { reason } = event;

      if (reason.message) {
        api.error({
          message: reason.message,
          description: reason?.data?.message,
          placement: "bottomRight",
        });
      }
      store.dispatch({
        type: "common/change",
        payload: { sendLoading: false },
      });
      // prevent event from being printed in console
      event.preventDefault();
    };

    window?.addEventListener("unhandledrejection", handleRejectionError);
    return () => {
      window.removeEventListener("unhandledrejection", handleRejectionError);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className="w-full h-12 flex items-center justify-between">
        <Image src={logo} height={40} alt="logo" />
        <ul className="flex gap-x-5 items-center">
          {RouterList.map((item) => {
            return (
              <Link
                className="text-[#000]"
                href={`/${item.value}`}
                key={item.value}
              >
                {item.label}
              </Link>
            );
          })}
          {connectButton()}
        </ul>
      </div>
      {contextHolder}
    </>
  );
}

export default Header;
