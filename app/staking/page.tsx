"use client";

import { useEffect, useState } from "react";
import Card from "@/packages/card";
import Tabs from "@/packages/Tabs";
import NumberInput from "@/packages/NumberInput";
import DescRow from "@/packages/DescRow";
import Chart from "@/components/charts";
import notification from "antd/es/notification";
import store from "@/store";
import { rootState } from "@/store/type";
import { isIndent } from "@/utils";
import { useMetaMask } from "@/hooks/useMetaMask";
import { Button, Divider } from "antd";
import { useSelector } from "react-redux";

const TAB_KEYS = ["stake", "unstake"];

function Staking() {
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
      <div className="text-2xl font-bold my-8">Stake</div>

      <div className="flex gap-x-[24px]">
        {/* overview */}
        <Card title="Overview" className="flex-1">
          <div className="flex justify-between px-10 gap-x-3">
            <div className="flex flex-col items-center">
              <p className="text-gray-400">Total Supply</p>
              <p className="text-[20px] font-semibold">26,000 FIT</p>
            </div>
            <div className="flex flex-col items-center">
              <p className="text-gray-400">Utilization Ration</p>
              <p className="text-[20px] font-semibold">26,000 FIT</p>
            </div>
            <div className="flex flex-col items-center">
              <p className="text-gray-400">FIL / FIT</p>
              <p className="text-[20px] font-semibold">2.5</p>
            </div>
          </div>
          <div className="my-10">
            APY:
            <span className="font-semibold text-3xl ml-2">2.93%</span>
          </div>
          <Chart option={default_opt} />
        </Card>

        {/* staking operation card */}
        <div className="w-[415px]">
          <Card className="relative mb-4 btn-default text-white">
            <div className="absolute top-[14px] right-[14px] px-2 py-1 rounded-[24px] bg-gray-100 text-sm text-gray-500">
              {isIndent(currentAccount)}
            </div>
            <div className="flex flex-col mb-3">
              <p className="text-sm">FIL Balance</p>
              <p className="text-xl">300.08 FIL</p>
            </div>
            <div className="flex">
              <div className="flex flex-col">
                <p className="text-sm">FIT Balance</p>
                <p className="text-xl">30.08 FIT</p>
              </div>
              <Button className="bg-gray-400 text-[#fff] text-sm rounded-[24px] border-none hover:!text-[#fff] h-[28px] ml-2">
                Add to wallet
              </Button>
            </div>
          </Card>
          <Card>
            <Tabs tabs={TAB_KEYS} onChange={onTabChange} />
            <div className="my-5">
              <NumberInput
                label="Amount"
                value={amount}
                prefix={tabKey === TAB_KEYS[0] ? "FIL" : "FIT"}
                maxButton
                onChange={(val) => setAmount(val)}
              />
              <NumberInput
                label="Slippage tolerance"
                className="w-[100px]"
                value={slippage}
                onChange={(val) => setSlippage(val)}
              />
            </div>
            <Divider />
            {tabKey === TAB_KEYS[0] ? (
              <div>
                <DescRow
                  title="Expected to receive"
                  desc="200.00 FIT"
                  color="#01A781"
                />
              </div>
            ) : (
              <div>
                <DescRow
                  title="Expected to receive"
                  desc="200.00 FIL"
                  color="#01A781"
                />
                <DescRow title="Staking fee" desc="1%" />
              </div>
            )}
            <Button
              type="primary"
              className="w-full h-[45px] rounded-[24px] mt-8"
              loading={sendLoading}
              onClick={onConfirm}
            >
              Confirm
            </Button>
          </Card>
        </div>
      </div>

      {contextHolder}
    </section>
  );
}

export default Staking;
