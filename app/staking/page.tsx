"use client";

import { useEffect, useMemo, useState } from "react";
import Card from "@/packages/card";
import Tabs from "@/packages/Tabs";
import NumberInput from "@/packages/NumberInput";
import DescRow from "@/packages/DescRow";
import Chart from "@/components/Charts";
import notification from "antd/es/notification";
import { rootState } from "@/store/type";
import {
  isIndent,
  getValueToFixed,
  numberWithCommas,
  getValueDivide,
} from "@/utils";
import { useMetaMask } from "@/hooks/useMetaMask";
import { Button, Divider, Space, Tag } from "antd";
import { useSelector } from "react-redux";
import data_fetcher_contract from "@/server/data_fetcher";
import FIL_contract from "@/server/FILLiquid_contract";
import BigNumber from "bignumber.js";
import { DEFAULT_EMPTY } from "../borrow/components/constans";
import { CHART_TIME_TYPE_MAP } from "../../constants";
import { useDebounce } from "use-debounce";
import { ExpectedStake } from "@/utils/type";
import useLoading from "@/hooks/useLoading";
import { ReloadOutlined } from "@ant-design/icons";
import * as echarts from "echarts/core";
import InfoTips from "@/components/InfoTips";
import ConfirmModal from "@/components/ConfirmModal";
import AddToWalletBtn from "@/components/AddToWalletBtn";
import store from "@/store";
import { formatChartTime } from "../api/common";
import { SLIPPAGE_TAG_MAP } from "@/constants";

const TAB_KEYS = ["stake", "unstake"];
const { CheckableTag } = Tag;

interface Rewards {
  amountFIT: number | string;
  amountFIL: number | string;
}

function Staking() {
  const [api, contextHolder] = notification.useNotification();
  const {
    currentAccount = undefined,
    isNetworkCorrect,
    connectButton,
  } = useMetaMask();

  const [amount, setAmount] = useState<number | null>();
  const [debouncedAmount] = useDebounce(amount, 600);
  const [slippage, setSlippage] = useState<any>();
  const [expected, setExpected] = useState<ExpectedStake>({
    expectedAmount: 0,
    expectedRate: 0,
  });
  const [tabKey, setTabKey] = useState<string>(TAB_KEYS[0]);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [rewards, setRewards] = useState<Rewards>();
  const [chartTimeType, setChartTimeType] =
    useState<keyof typeof CHART_TIME_TYPE_MAP>("7d");
  const [selectedTags, setSelectedTags] = useState<string>("");

  const { balance } = useSelector((state: rootState) => state?.contract);

  const { APY, panel } = useSelector((state: rootState) => state?.panel);

  const { loading, setLoading } = useLoading();

  const default_opt = useMemo(() => {
    const dataList = APY?.[chartTimeType]?.map((item: any) => item.APY * 100);
    const dateList = APY?.[chartTimeType]?.map((item: any) =>
      formatChartTime(item.BlockTimeStamp)
    );
    return {
      backgroundColor: "transparent",
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: dateList,
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
          data: dataList,
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
  }, [APY?.["1d"]?.[0]?.BlockTimeStamp, chartTimeType]);

  const onTabChange = (tabKey: string) => {
    setTabKey(tabKey);
    clear();
  };

  const clear = () => {
    setAmount(undefined);
    setSlippage(undefined);
    setSelectedTags("");
  };

  const onConfirm = async () => {
    if (!amount)
      return api.warning({
        message: "Please input the amount",
        placement: "top",
      });
    if (slippage === undefined)
      return api.warning({
        message: "Please input the slippage tolerance",
        placement: "top",
      });
    if (amount) {
      setLoading(true);
      try {
        const res: any = await FIL_contract.onStakeOrUnstake(
          amount,
          slippage,
          tabKey,
          currentAccount
        );
        if (res) {
          setRewards({
            amountFIL: getValueDivide(res?.amountFIL || 0),
            amountFIT: getValueDivide(res?.amountFIT || 0),
          });
          setIsFeedbackOpen(true);
          clear();
          if (currentAccount) {
            data_fetcher_contract.fetchPersonalData(currentAccount);
          }
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const onModalCancel = () => {
    setIsFeedbackOpen(false);
    setRewards(undefined);
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
    setExpected({
      ...res,
      expectedRate: debouncedAmount
        ? tabKey === TAB_KEYS[0]
          ? BigNumber(debouncedAmount || 0)
              .dividedBy(res.expectedAmount)
              .decimalPlaces(2)
              .toNumber()
          : BigNumber(res.expectedAmount || 0)
              .dividedBy(debouncedAmount || 1)
              .decimalPlaces(2)
              .toNumber()
        : "-",
    });
  };

  const fetchPersonalData = () => {
    if (currentAccount) {
      data_fetcher_contract.fetchPersonalData(currentAccount);
    }
  };

  const fetchData = (shouldRefresh?: boolean) => {
    if (shouldRefresh) {
      store.dispatch({
        type: "common/change",
        payload: { refreshAllData: true },
      });
    }
    if (!isNetworkCorrect) return;
    fetchPersonalData();
  };

  useEffect(() => {
    fetchData(true);
  }, [currentAccount]);

  useEffect(() => {
    onExpectedRewards();
  }, [debouncedAmount]);

  const overviewData = useMemo(() => {
    return [
      {
        title: "Total FIL Liquidity",
        value: numberWithCommas(panel?.TotalFIL || DEFAULT_EMPTY),
        unit: "FIL",
      },
      {
        title: "Total FIT Outstanding",
        value: numberWithCommas(panel?.FitTotalSupply || DEFAULT_EMPTY),
        unit: "FIT",
      },
      {
        title: "Utilization Rate",
        value: numberWithCommas(panel?.UtilizationRate * 100) || DEFAULT_EMPTY,
        unit: "%",
      },
      {
        title: "FIL / FIT",
        value: numberWithCommas(panel?.FIL_FIT) || DEFAULT_EMPTY,
      },
      {
        title: "Staking APY",
        value: numberWithCommas(APY?.current || 0) || DEFAULT_EMPTY,
        unit: "%",
        tip: "The Staking APY is estimated with the weighted average borrowing term. Please refer to the White Paper for detailed APY calculation.",
      },
    ];
  }, [panel, APY?.current]);

  const chartTimeData: any = Object.keys(CHART_TIME_TYPE_MAP);

  const handleChangeChartTime = (
    time: keyof typeof CHART_TIME_TYPE_MAP,
    checked: boolean
  ) => {
    if (chartTimeType === time) {
      setChartTimeType("all");
    } else {
      setChartTimeType(time);
    }
  };

  const handleChangeSlippageTag = (tag: string, checked: boolean) => {
    if (selectedTags === tag) {
      setSelectedTags("");
    } else {
      setSelectedTags(tag);
    }
  };

  useEffect(() => {
    switch (selectedTags) {
      case SLIPPAGE_TAG_MAP[0]:
        setSlippage(
          BigNumber(expected.expectedAmount)
            .times(1 - 0.05)
            .decimalPlaces(2, BigNumber.ROUND_DOWN)
            .toNumber()
        );
        break;
      case SLIPPAGE_TAG_MAP[1]:
        setSlippage(
          BigNumber(expected.expectedAmount)
            .times(1 - 0.1)
            .decimalPlaces(2, BigNumber.ROUND_DOWN)
            .toNumber()
        );
        break;
      case SLIPPAGE_TAG_MAP[2]:
        setSlippage(
          BigNumber(expected.expectedAmount)
            .times(1 - 0.2)
            .decimalPlaces(2, BigNumber.ROUND_DOWN)
            .toNumber()
        );
        break;
      case SLIPPAGE_TAG_MAP[3]:
        setSlippage(0);
        break;
      case "":
        setSlippage(undefined);
        break;
      default:
        break;
    }
  }, [selectedTags, expected.expectedAmount]);

  return (
    <section>
      <label className="inline-block mb-[5px] font-medium text-sm text-[#06081B] hidden opacity-40"></label>
      <div className="text-[30px] font-semibold my-4">Stake</div>
      <div className="flex gap-[24px] flex-col md:flex-row items-center md:items-start">
        <Card title="Overview" className="flex-1">
          <div className="grid grid-cols-6 gap-4 mb-[50px]">
            {overviewData.map((item, index) => (
              <div
                className={`data-card col-span-2 ${
                  (index === 0 || index === 1) && "col-span-3"
                } ${index === 0 && "btn-default text-white"}`}
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
          <div className="text-[18px] font-bold ml-4 mb-4">
            <Space>
              <span>Staking APY (%)</span>
              <InfoTips
                type="small"
                content="Due to the on-chain transactions, the visualization could be delayed. "
              />
            </Space>
          </div>
          <div className="flex justify-end mb-4">
            {chartTimeData.slice(1).map((time: any) => (
              <CheckableTag
                key={time}
                checked={chartTimeType === time}
                onChange={(checked) => handleChangeChartTime(time, checked)}
              >
                {time}
              </CheckableTag>
            ))}
          </div>
          <Chart option={default_opt} />
        </Card>

        {/* staking operation card */}
        <div className="w-[330px] md:w-[400px]">
          <Card className="relative mb-4 btn-default text-white">
            <div className="absolute top-[14px] right-[14px] px-2 py-1 rounded-[24px] bg-gray-100 text-sm text-gray-500">
              {isIndent(currentAccount)}
            </div>
            <div className="flex flex-row mb-3">
              <div>
                <div className="text-sm font-semibold">
                  FIL Balance
                  <ReloadOutlined
                    className="ml-3"
                    onClick={() => {
                      fetchData(true);
                    }}
                  />
                </div>
                <p className="text-xl">{`${numberWithCommas(
                  balance.FIL,
                  2
                )} FIL`}</p>
              </div>
            </div>
            <div className="flex">
              <div className="flex flex-col">
                <div className="text-sm font-semibold">
                  FIT Balance
                  <AddToWalletBtn coinType="FIT" />
                </div>
                <Space className="mt-1" align="end">
                  <div className="text-xl">
                    {`${numberWithCommas(balance.FIT, 2)} FIT`}
                  </div>
                  <div className="text-xs pb-1">{`≈ ${numberWithCommas(
                    BigNumber(balance.FIT).times(panel?.FIL_FIT).toNumber()
                  )} FIL`}</div>
                </Space>
              </div>
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
                min={tabKey === TAB_KEYS[0] ? 1 : 0}
                max={
                  tabKey === TAB_KEYS[0]
                    ? getValueToFixed(balance.FIL)
                    : getValueToFixed(balance.FIT)
                }
                onMaxButtonClick={onMaxButtonClick}
                onChange={(val) => setAmount(val)}
              />
              <NumberInput
                label={
                  <Space size={[4, 4]}>
                    Slippage Tolerance{" "}
                    <InfoTips
                      type="small"
                      content={`Due to the potential slippage of on-chain transactions, there may be discrepancies between the actual and the expected ${
                        tabKey === TAB_KEYS[0] ? "FIT" : "FIL"
                      } to be received. Please input the MINIMUM acceptable ${
                        tabKey === TAB_KEYS[0] ? "FIT" : "FIL"
                      } for this transaction.`}
                    />
                  </Space>
                }
                className="w-[100px] border-r-none"
                placeholder={`Min. accpetable ${
                  tabKey === TAB_KEYS[0] ? "FIT" : "FIL"
                }`}
                affix={tabKey === TAB_KEYS[0] ? "FIT" : "FIL"}
                value={slippage}
                max={expected.expectedAmount || 9999999999}
                min={0}
                disabled={selectedTags === SLIPPAGE_TAG_MAP[3]}
                onChange={(val) => setSlippage(val)}
              />
              <Space className="mt-2" size={[0, 8]} wrap>
                {SLIPPAGE_TAG_MAP.map((tag) => (
                  <CheckableTag
                    key={tag}
                    checked={selectedTags.includes(tag)}
                    onChange={(checked) =>
                      handleChangeSlippageTag(tag, checked)
                    }
                  >
                    {tag}
                  </CheckableTag>
                ))}
              </Space>
            </div>
            <Divider />
            {tabKey === TAB_KEYS[0] ? (
              <div>
                <DescRow
                  title="Expected to Receive"
                  desc={`${numberWithCommas(expected.expectedAmount, 6)} FIT`}
                  color="#01A781"
                />
                <DescRow
                  title="Expected FIL/FIT Exchange Rate"
                  desc={`${expected.expectedRate}`}
                />
              </div>
            ) : (
              <div>
                <DescRow
                  title="Expected to Receive"
                  desc={`${numberWithCommas(expected.expectedAmount, 6)} FIL`}
                  color="#01A781"
                />
                <DescRow
                  title="Expected FIL/FIT Exchange Rate"
                  desc={`${expected.expectedRate}`}
                />
                <DescRow title="Staking Fee" desc="0.5%" />
              </div>
            )}
            {currentAccount ? (
              <Button
                type="primary"
                className="w-full h-[45px] rounded-[24px] mt-8"
                loading={loading}
                onClick={onConfirm}
              >
                Confirm
              </Button>
            ) : (
              <div className="mt-8 w-full text-center">{connectButton()}</div>
            )}
          </Card>
        </div>
      </div>

      {contextHolder}
      <ConfirmModal
        isOpen={isFeedbackOpen}
        type="success"
        title={
          tabKey === TAB_KEYS[0]
            ? "Successfully Staked"
            : "Successfully Redeemed"
        }
        desc={
          <>
            {tabKey === TAB_KEYS[0]
              ? `${rewards?.amountFIL} FIL successfully staked, ${rewards?.amountFIT} FIT minted`
              : `${rewards?.amountFIT} FIT successfully redeemed, ${rewards?.amountFIL} FIL unstaked`}
          </>
        }
        onConfirm={onModalCancel}
        onCancel={onModalCancel}
      />
    </section>
  );
}

export default Staking;
