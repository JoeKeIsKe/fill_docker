"use client";

import Image from "next/image";
import FIlLogo from "@/assets/Fil_logo.png";
import Link from "next/link";
import { RouterList, NETWORK } from "@/constants";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useMetaMask } from "@/hooks/useMetaMask";
import { useSelector } from "react-redux";
import { rootState } from "@/store/type";
import { NetworkItemType } from "@/utils/type";
import notification from "antd/es/notification";
import store from "@/store";
import { usePathname } from "next/navigation";
import { Dropdown, Space } from "antd";
import { getStorage } from "@/utils";
import { fetchChartAndPanelData } from "@/app/api/common";

function Header() {
  const dispath = useDispatch();
  const { wallet, connectButton, currentAccount } = useMetaMask();

  const [loading, setLoading] = useState(false);

  const { isNetworkCorrect } = getStorage("network_info");

  const [api, contextHolder] = notification.useNotification();
  const pathname = usePathname();

  const { refreshAllData } = useSelector(
    (state: rootState) => state?.commonStore
  );

  const targetNetwork = NETWORK.find(
    (item: any) => item.chainId === wallet.chainId
  );

  const handleNetworkChange = async (item: NetworkItemType) => {
    let res = null;
    try {
      await window?.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [
          {
            chainId: item.chainId,
          },
        ],
      });
      res = true;
    } catch (error: any) {
      if (error?.code === 4902) {
        window?.ethereum.request({
          method: "wallet_addEthereumChain", // Metamask的api名称
          params: [item.config],
        });
      }
    }
    if (res === true) {
      window.location.reload();
    }
  };

  let items: any = [];
  NETWORK.forEach((item: any) => {
    items.push({
      label: (
        <a className="text-sm" onClick={() => handleNetworkChange(item)}>
          {item.name}
        </a>
      ),
      key: item.key,
    });
  });

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

  const fetchData = async () => {
    if (loading) return;
    try {
      setLoading(true);
      if (refreshAllData) {
        await fetchChartAndPanelData();
        store.dispatch({
          type: "common/change",
          payload: { refreshAllData: false },
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [refreshAllData]);

  useEffect(() => {
    // catch the errors from MetaMask
    const handleRejectionError = (event: PromiseRejectionEvent) => {
      const { reason } = event;
      if (reason.message && isNetworkCorrect) {
        api.error({
          message: reason.message,
          description: reason?.data?.message,
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
      window?.removeEventListener("unhandledrejection", handleRejectionError);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNetworkCorrect]);

  return (
    <div
      className="fixed top-0 left-0 right-0 bg-white"
      style={{ zIndex: 999 }}
    >
      <div className="max-w-screen-xl h-[80px] w-full flex items-center justify-between px-5 m-auto">
        <Image src={FIlLogo} height={34} alt="logo" />
        <div className="h-full flex gap-x-5 items-center leading-[80px]">
          {RouterList.map((item) => (
            <Link
              className={`text-[#000] h-full block text-center md:w-[100px] lg:w-[160px] ${
                pathname.includes(item.value) && "active"
              }`}
              href={`/${item.value}`}
              key={item.value}
            >
              {item.label}
            </Link>
          ))}
          {
            <Space size="middle" className="hidden md:inline-flex">
              <Dropdown
                menu={{ items }}
                trigger={["hover"]}
                overlayClassName="pb-[5px] rounded-b-[6px]"
                overlayStyle={{
                  top: "60px",
                }}
              >
                <div
                  className="border flex h-[40px] px-2 cursor-pointer items-center rounded-[6px] bg-white text-[rgb(0,147,233)]"
                  style={{
                    borderColor: targetNetwork?.name ? "#0093E9" : "#d4380d",
                  }}
                >
                  {targetNetwork?.name || (
                    <span className="text-[#d4380d] whitespace-nowrap">
                      Wrong Network
                    </span>
                  )}
                </div>
              </Dropdown>
            </Space>
          }
          <div className="hidden md:block">{connectButton()}</div>
        </div>
      </div>
      {contextHolder}
    </div>
  );
}

export default Header;
