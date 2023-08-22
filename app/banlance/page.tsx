"use client";

import { banlance_card, banlance_list } from "./veriable";
import Banlance from "@/components/banlance_card";
import Access from "./Access";
import Card from "@/packages/card";
import { default_opt } from "@/constants";
import Chart from "@/components/charts";
import FIT_contract from "@/server/FILLiquid_contract";
import { useEffect, useMemo, useState } from "react";
import { shallowEqual, useSelector } from "react-redux";
import { rootState } from "@/store/type";
import Header from "./Header";
import { useMetaMask } from "@/hooks/useMetaMask";

function Deposit() {
  const { currentAccount } = useMetaMask();
  const account = useSelector(
    (state: rootState) => state?.wallet?.account,
    shallowEqual
  );
  const FIT_banlance = useSelector(
    (state: rootState) => state?.contract?.FIT,
    shallowEqual
  );
  const FIL_banlance = useSelector(
    (state: rootState) => state?.contract?.FIL,
    shallowEqual
  );
  const currentRate = useSelector(
    (state: rootState) => state?.contract?.currentRate,
    shallowEqual
  );

  const [active, setActive] = useState("deposit");

  //   console.log("----3", FIT_banlance, FIL_banlance);

  useEffect(() => {
    if (currentAccount) {
      //   FIT_contract.getBalance(currentAccount);
      FIT_contract.getCurrentRate(currentAccount);
    }
  }, [currentAccount]);

  const showTitle = active === "deposit" ? "Depoosit Rate" : "WidthDrow Rate";

  return (
    <>
      <Header
        active={active}
        currentRate={currentRate}
        onChange={(value) => {
          setActive(value);
        }}
      />
      <div className="flex gap-x-4 mt-20">
        <Banlance
          banlance={banlance_card.banlance}
          data={{
            fil: FIL_banlance,
            fit: FIT_banlance,
          }}
          className="rounded-lg"
        >
          <Access type={active} list={banlance_list} className="rounded-b-lg" />
        </Banlance>
        <Card title={showTitle} className=" w-1/2">
          <Chart option={default_opt} />
        </Card>
      </div>
      <Card
        title={active === "deposit" ? "Deposit" : "WidthDrow"}
        className="mt-20"
      >
        <div className="mt-10">
          <Chart option={default_opt} />
        </div>
      </Card>
    </>
  );
}
export default Deposit;
