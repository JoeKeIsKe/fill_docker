"use client";

import { useEffect, useMemo, useState } from "react";
import Card from "@/packages/card";
import Tabs from "@/packages/Tabs";
import NumberInput from "@/packages/NumberInput";
import DescRow from "@/packages/DescRow";
import Chart from "@/components/charts";
import notification from "antd/es/notification";
import { rootState } from "@/store/type";
import { isIndent, getValueToFixed, timestampToDateTime } from "@/utils";
import { useMetaMask } from "@/hooks/useMetaMask";
import { Button, Divider } from "antd";
import { useSelector } from "react-redux";
import data_fetcher_contract from "@/server/data_fetcher";
import FIL_contract from "@/server/FILLiquid_contract";
import BigNumber from "bignumber.js";
import { DEFAULT_EMPTY } from "../borrow/components/constans";
import { useDebounce } from "use-debounce";
import { ExpectedStake } from "@/utils/type";
import useLoading from "@/hooks/useLoading";
import { getChartData } from "../api/modules/index";
import { ReloadOutlined } from "@ant-design/icons";

const TAB_KEYS = ["stake", "unstake"];

function Staking() {
  const [api, contextHolder] = notification.useNotification();
  const { currentAccount } = useMetaMask();

  const [amount, setAmount] = useState<number | null>();
  const [debouncedAmount] = useDebounce(amount, 600);
  const [slippage, setSlippage] = useState();
  const [expected, setExpected] = useState<ExpectedStake>({
    expectedAmount: 0,
    expectedRate: 0,
  });
  const [tabKey, setTabKey] = useState<string>(TAB_KEYS[0]);
  const [chartData, setChartData] = useState([]);
  const [chartDate, setChartDate] = useState([]);
  const [currentAPY, setCurrentAPY] = useState();

  const { filInfo, balance } = useSelector(
    (state: rootState) => state?.contract
  );

  const { loading, setLoading } = useLoading();

  const default_opt = {
    backgroundColor: "transparent",
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: chartDate,
    },

    series: [
      {
        data: chartData,
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
      setLoading(true);
      try {
        const res: any = await FIL_contract.onStakeOrUnstake(
          amount,
          slippage,
          tabKey,
          currentAccount
        );
        if (res) {
          if (res?.message) {
            api.error({
              message: res?.message,
            });
          } else {
            api.success({
              message: `successfully ${tabKey}d`,
            });
            clear();
            if (currentAccount) {
              data_fetcher_contract.fetchPersonalData(currentAccount);
            }
          }
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const onMaxButtonClick = () => {
    const num =
      tabKey === TAB_KEYS[0]
        ? getValueToFixed(balance.FIL)
        : getValueToFixed(balance.FIT);
    setAmount(num);
  };

  const onExpectedRewards = async () => {
    const res: any = await data_fetcher_contract.getStakeOrUnstakeExpecting(
      debouncedAmount || 0,
      tabKey
    );
    setExpected(res);
  };

  const fetchChartData = async () => {
    const res = await getChartData();
    if (res) {
      const { Senior } = res;
      const target = Senior?.slice(-8) || [];
      const currentTarget = Senior?.slice(-1) || [];
      const APY = currentTarget[0]?.APY;
      setCurrentAPY(APY);

      const dataList = target.map((item: any) => item.APY);
      const dateList = target.map((item: any) =>
        timestampToDateTime(item.BlockTimeStamp)
      );
      setChartData(dataList);
      setChartDate(dateList);
    }
  };

  const fetchPersonalData = () => {
    if (currentAccount) {
      data_fetcher_contract.fetchPersonalData(currentAccount);
    }
  };

  const fetchData = () => {
    fetchPersonalData();
    fetchChartData();
  };

  const handleAddToWallet = async () => {
    const res = await window?.ethereum.request({
      method: "wallet_watchAsset",
      params: {
        type: "ERC20",
        options: {
          address: "0x950443bc72109FC09211fA478de9D5495205a9C0",
          symbol: "FIT",
          decimals: 18,
          // image: "https://foo.io/token-image.svg",
        },
      },
    });
    if (res) {
      api.success({
        message: "Successfully added",
      });
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentAccount]);

  useEffect(() => {
    onExpectedRewards();
  }, [debouncedAmount]);

  return (
    <section>
      <div className="text-2xl font-bold my-8">Stake</div>

      <div className="flex gap-[24px] flex-col md:flex-row">
        {/* overview */}
        <Card title="Overview" className="flex-1">
          <div className="flex justify-between px-10 gap-x-3">
            <div className="flex flex-col items-center">
              <p className="text-gray-400">Total Supply</p>
              <p className="text-[20px] font-semibold">{`${
                filInfo?.availableFIL || DEFAULT_EMPTY
              } FIL`}</p>
            </div>
            <div className="flex flex-col items-center">
              <p className="text-gray-400">Utilization Ratio</p>
              <p className="text-[20px] font-semibold">
                {filInfo?.utilizationRate}%
              </p>
            </div>
            <div className="flex flex-col items-center">
              <p className="text-gray-400">FIL / FIT</p>
              <p className="text-[20px] font-semibold">
                {filInfo?.exchangeRate}
              </p>
            </div>
          </div>
          <div className="my-10 text-right">
            APY:
            <span className="font-semibold text-3xl ml-2">{`${
              currentAPY || DEFAULT_EMPTY
            }%`}</span>
          </div>
          <Chart option={default_opt} />
        </Card>

        {/* staking operation card */}
        <div className="w-[330px] md:w-[415px]">
          <Card className="relative mb-4 btn-default text-white">
            <div className="absolute top-[14px] right-[14px] px-2 py-1 rounded-[24px] bg-gray-100 text-sm text-gray-500">
              {isIndent(currentAccount)}
            </div>
            <div className="flex flex-row mb-3">
              <div>
                <div className="text-sm">
                  FIL Balance
                  <ReloadOutlined className="ml-3" onClick={fetchData} />
                </div>
                <p className="text-xl">{`${new BigNumber(
                  Number(balance.FIL)
                ).toFixed(2, 1)} FIL`}</p>
              </div>
            </div>
            <div className="flex">
              <div className="flex flex-col">
                <p className="text-sm">FIT Balance</p>
                <p className="text-xl">{`${Number(balance.FIT).toFixed(
                  2
                )} FIT`}</p>
              </div>
              <Button
                className="bg-gray-400 text-[#fff] text-sm rounded-[24px] border-none hover:!text-[#fff] h-[28px] ml-2"
                onClick={handleAddToWallet}
              >
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
                min={1}
                max={
                  tabKey === TAB_KEYS[0]
                    ? getValueToFixed(balance.FIL)
                    : getValueToFixed(balance.FIT)
                }
                onMaxButtonClick={onMaxButtonClick}
                onChange={(val) => setAmount(val)}
              />
              <NumberInput
                label="Slippage tolerance"
                className="w-[100px]"
                value={slippage}
                max={60}
                onChange={(val) => setSlippage(val)}
              />
            </div>
            <Divider />
            {tabKey === TAB_KEYS[0] ? (
              <div>
                <DescRow
                  title="Expected exchange rate"
                  desc={`${expected.expectedRate}%`}
                />
                <DescRow
                  title="Expected to receive"
                  desc={`${expected.expectedAmount} FIT`}
                  color="#01A781"
                />
              </div>
            ) : (
              <div>
                <DescRow
                  title="Expected exchange rate"
                  desc={`${expected.expectedRate}%`}
                />
                <DescRow
                  title="Expected to receive"
                  desc={`${expected.expectedAmount} FIL`}
                  color="#01A781"
                />
                <DescRow title="Staking fee" desc="0.5%" />
              </div>
            )}
            <Button
              type="primary"
              className="w-full h-[45px] rounded-[24px] mt-8"
              loading={loading}
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
