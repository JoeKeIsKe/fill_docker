"use client";

import { useEffect, useState } from "react";
import notification from "antd/es/notification";
import store from "@/store";
import { useMetaMask } from "@/hooks/useMetaMask";
import { Button, Divider, Input } from "antd";
import { useSelector } from "react-redux";
import BorrowsTable from "./components/borrowsTable";

const TAB_KEYS = ["stake", "unstake"];

function Borrow() {
  const [api, contextHolder] = notification.useNotification();
  const { currentAccount } = useMetaMask();

  const [amount, setAmount] = useState();
  const [slippage, setSlippage] = useState();
  const [tabKey, setTabKey] = useState<string | null>(TAB_KEYS[0]);

  const clear = () => {
    setAmount(undefined);
    setSlippage(undefined);
  };

  const setSendLoading = (status: boolean) => {
    store.dispatch({
      type: "common/change",
      payload: { sendLoading: status },
    });
  };

  return (
    <section>
      <div className="text-2xl font-bold my-8">Miner Detail</div>

      <BorrowsTable />
    </section>
  );
}

export default Borrow;
