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
import { Button, Divider, Space } from "antd";
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
import { FIT_contract } from "@/contract";
import * as echarts from "echarts/core";
import InfoTips from "@/components/infoTips";

const TAB_KEYS = ["stake", "unstake"];

function Staking() {
  const [api, contextHolder] = notification.useNotification();
  const { currentAccount, isNetworkCorrect } = useMetaMask();

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
  const [currentAPY, setCurrentAPY] = useState<string | number>();

  const { filInfo, balance } = useSelector(
    (state: rootState) => state?.contract
  );

  const { loading, setLoading } = useLoading();

  const default_opt = useMemo(() => {
    return {
      backgroundColor: "transparent",
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: chartDate,
        axisLabel: {
          textStyle: {
            color: "rgba(100, 111, 126, 0.6)",
          },
        },
      },
      yAxis: {
        type: "value",
        name: "APY",
        axisLabel: {
          textStyle: {
            color: "rgba(100, 111, 126, 0.6)",
          },
        },
        splitLine: {
          lineStyle: {
            type: "dashed",
          },
        },
      },
      series: [
        {
          data: chartData,
          type: "line",
          smooth: true,
          symbolSize: 0,
          lineStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              {
                offset: 0,
                color: "#48D3E6",
              },
              {
                offset: 0.5,
                color: "#4094E0",
              },
              {
                offset: 1,
                color: "#47CCE5",
              },
            ]),
          },
          areaStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0,
                  color: "rgba(71, 204, 229, 0.2)",
                },
                {
                  offset: 1,
                  color: "rgba(74, 221, 231, 0)",
                },
              ],
              global: false,
            },
          },
        },
      ],
    };
  }, [chartData, chartDate]);

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
              message: `Successfully ${tabKey}d`,
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
      const target = Senior?.slice(-9, -1) || [];
      const currentTarget = Senior?.slice(-1) || [];
      const APY = currentTarget[0]?.APY;
      setCurrentAPY(getValueToFixed(APY * 100, 6));

      const dataList = target.map((item: any) =>
        getValueToFixed(item.APY * 100, 6)
      );
      const dateList = target.map((item: any) =>
        timestampToDateTime(item.BlockTimeStamp, "MM-DD HH:mm")
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
    if (!isNetworkCorrect) return;
    fetchPersonalData();
  };

  const handleAddToWallet = async () => {
    const res = await window?.ethereum.request({
      method: "wallet_watchAsset",
      params: {
        type: "ERC20",
        options: {
          address: FIT_contract,
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
    fetchChartData();
  }, []);

  useEffect(() => {
    onExpectedRewards();
  }, [debouncedAmount]);

  const overviewData = useMemo(() => {
    return [
      {
        title: "Total Supply",
        value: filInfo?.availableFIL || DEFAULT_EMPTY,
        unit: "FIL",
      },
      {
        title: "Utilization Ratio",
        value: filInfo?.utilizationRate || DEFAULT_EMPTY,
        unit: "%",
      },
      {
        title: "FIL / FIT",
        value: filInfo?.exchangeRate || DEFAULT_EMPTY,
      },
      {
        title: "APY",
        value: currentAPY || DEFAULT_EMPTY,
        unit: "%",
        tip: "The APY is estimated with the weighted average borrowing term. Please refer to the Annex of White Paper for detailed APY calculation.",
      },
    ];
  }, [filInfo, currentAPY]);

  return (
    <section>
      <label className="inline-block mb-[5px] font-medium text-sm text-[#06081B] hidden opacity-40"></label>
      <div className="text-[36px] font-semibold my-4">Stake</div>
      <div className="flex gap-[24px] flex-col md:flex-row">
        <Card title="Overview" className="flex-1">
          <div className="grid grid-cols-2 gap-4 mb-[60px]">
            {overviewData.map((item, index) => (
              <div
                className={`data-card ${
                  index === 0 && "btn-default text-white"
                }`}
                key={item.title}
              >
                <Space className="mb-4">
                  <p className="text-xs font-semibold">{item.title}</p>
                  {item.tip && <InfoTips type="small" content={item.tip} />}
                </Space>

                <p className="text-[22px] font-bold">
                  {item.value}
                  {item.unit && (
                    <span className="text-sm font-normal ml-2">
                      {item.unit}
                    </span>
                  )}
                </p>
              </div>
            ))}
          </div>
          <div className="text-[18px] font-bold ml-4 mb-4">APY</div>
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
                <div className="text-sm font-semibold">
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
                <p className="text-sm font-semibold">FIT Balance</p>
                <p className="text-xl">{`${Number(balance.FIT).toFixed(
                  2
                )} FIT`}</p>
              </div>
              <Button
                className="bg-gray-400 text-[#fff] !text-xs !rounded-[24px] border-none hover:!text-[#fff] h-[28px] ml-2"
                size="small"
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
                label="Slippage Tolerance"
                className="w-[100px] border-r-none"
                placeholder={`${
                  tabKey === TAB_KEYS[0] ? "Max" : "Min"
                }. Acceptable FIL/FIT Ratio`}
                affix="%"
                value={slippage}
                max={60}
                onChange={(val) => setSlippage(val)}
              />
            </div>
            <Divider />
            {tabKey === TAB_KEYS[0] ? (
              <div>
                {/* <DescRow
                  title="Expected FIL/FIT Ratio"
                  desc={`${expected.expectedRate} %`}
                /> */}
                <DescRow
                  title="Expected to Receive"
                  desc={`${expected.expectedAmount} FIT`}
                  color="#01A781"
                />
              </div>
            ) : (
              <div>
                {/* <DescRow
                  title="Expected FIL/FIT Ratio"
                  desc={`${expected.expectedRate}`}
                /> */}
                <DescRow
                  title="Expected to Receive"
                  desc={`${expected.expectedAmount} FIL`}
                  color="#01A781"
                />
                <DescRow title="Staking Fee" desc="0.5%" />
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
