"use client";

import { useEffect } from "react";
import StakingCard from "./components/stakingCard";
import StakingTable from "./components/stakingTable";
import notification from "antd/es/notification";
import store from "@/store";


function Staking() {
  const [api, contextHolder] = notification.useNotification();

  useEffect(() => {
    // catch the errors from MetaMask
    const handleRejectionError = (event: PromiseRejectionEvent) => {
      const { reason } = event;

      if (reason.message) {
        api.error({
          message: reason.message,
          description: reason?.data?.message,
          placement: 'bottomRight',
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
    <section>
      <div className="text-xl font-bold my-8">FIT Farming</div>
      <div className="flex gap-8 flex-col lg:flex-row">
        {/* Staking Section */}
        <StakingCard />
        {/* Table */}
        <div className="mt-[10px] lg:-mt-[40px] flex-1">
          <StakingTable />
        </div>
      </div>
      {contextHolder}
    </section>
  );
}

export default Staking;
