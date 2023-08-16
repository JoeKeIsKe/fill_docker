"use client";

import { useEffect, useState } from "react";
import Card from "@/packages/card";
import Tabs from "@/packages/Tabs";
import NumberInput from "@/packages/NumberInput";
import DescRow from "@/packages/DescRow";
import Chart from "@/components/charts";
import PieChart from "@/components/pieChart";
import notification from "antd/es/notification";
import store from "@/store";
import { rootState } from "@/store/type";
import { isIndent } from "@/utils";
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

  const { sendLoading } = useSelector((state: rootState) => state?.commonStore);

  const default_opt = {
    backgroundColor: "transparent",
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: [
        "2022-08",
        "2022-09",
        "2022-10",
        "2022-11",
        "2022-12",
        "2023-01",
        "2023-02",
      ],
    },

    series: [
      {
        data: [10, 30, 20, 60, 40, 65, 70],
        type: "line",
        areaStyle: undefined,
      },
    ],
  };

  const pie_option = {
    series: [
      {
        name: "Pie",
        type: "pie",
        radius: ["60%", "80%"],
        label: {
          show: false,
          position: "center",
        },
        labelLine: {
          show: false,
        },
        data: [
          {
            value: 1048,
            name: "Available",
            itemStyle: { color: "rgb(156, 163, 175, 0.3)" },
          },
          { value: 735, name: "Total", itemStyle: { color: "#0093E9" } },
        ],
      },
    ],
  };

  const onTabChange = (tabKey: string) => {
    setTabKey(tabKey);
    clear();
  };

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

  const onConfirm = async () => {
    if (!amount)
      return api.warning({
        message: "Please input the amount",
        placement: "top",
      });
    if (!slippage)
      return api.warning({
        message: "Please input the slippage tolerance",
        placement: "top",
      });
    if (amount && slippage) {
      const staker = currentAccount;
      setSendLoading(true);
      // const res:any = await stake_contract.onStake(amount, stakeTime, staker);
      const res: any = {};
      if (res) {
        if (res?.message) {
          api.error({
            message: res?.message,
            placement: "bottomRight",
          });
        } else {
          // setRewards(res);
          // onFeedbackOpen();
        }
      }
      setSendLoading(false);
    }
  };

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
    <section>
      <div className="text-2xl font-bold my-8">Borrow</div>

      {/* overview */}
      <Card title="Overview" className="flex-1 mb-5">
        <div className="flex">
          <div className="w-[500px]">
            <div className="flex justify-between px-10 gap-x-3 w-[400px]">
              <div className="flex flex-col items-center">
                <p className="text-gray-400">Avaliable</p>
                <p className="text-[20px] font-semibold">26,000 FIT</p>
              </div>

              <div className="flex flex-col items-center">
                <p className="text-gray-400">Utilization Ratio</p>
                <p className="text-[20px] font-semibold">2.5</p>
              </div>
            </div>
            <div className="flex">
              <div className="w-[250px] h-[220px]">
                <PieChart option={pie_option} />
              </div>
              <div className="flex flex-col items-center mt-[50px]">
                <p className="text-gray-400">Total supplied</p>
                <p className="text-[24px] font-semibold">3,000 of 50,000</p>
              </div>
            </div>
            <div>
              Current Borrowing APR: <span className="text-[24px]">1.2%</span>
            </div>
          </div>
          <div className="flex-1">
            <p className="font-semibold ml-10 mb-2">Borrowing APR</p>
            <Chart option={default_opt} />
          </div>
        </div>
      </Card>

      {/* borrowings */}
      <Card>
        {true ? (
          <div className="mb-8">
            <p className="font-semibold text-xl mb-4">My Family</p>
            <BorrowsTable type="my" />
          </div>
        ) : (
          <div className="flex justify-center">
            <Button
              type="primary"
              className="rounded-[24px] h-[40px] w-[400px]"
            >
              Create a Family
            </Button>
          </div>
        )}
        <p className="font-semibold text-xl mb-4">Borrowings</p>
        <div className="mb-4">
          <Input
            size="large"
            placeholder="input search text"
            style={{ width: 300 }}
          />
        </div>
        <BorrowsTable />
      </Card>

      {contextHolder}
    </section>
  );
}

export default Borrow;
