"use client";

import { useEffect, useMemo, useState } from "react";
import Card from "@/packages/card";
import Chart from "@/components/Charts";
import PieChart from "@/components/PieChart";
import { rootState } from "@/store/type";
import { numberWithCommas } from "@/utils";
import { Button, Input, Space, Tag } from "antd";
import { shallowEqual, useSelector } from "react-redux";
import BorrowsTable from "./components/BorrowsTable";
import AddMiner from "../certified/addMiner";
import { DEFAULT_EMPTY } from "./components/constans";
import { SearchOutlined } from "@ant-design/icons";
import BigNumber from "bignumber.js";
import * as echarts from "echarts/core";
import InfoTips from "@/components/InfoTips";
import { fetchChartAndPanelData, formatChartTime } from "../api/common";
import { CHART_TIME_TYPE_MAP } from "../../constants";
import { useMetaMask } from "@/hooks/useMetaMask";

const { CheckableTag } = Tag;

function Borrow() {
  const { currentAccount } = useMetaMask();
  const [searchText, setSearchText] = useState<string | null>();
  const [chartTimeType, setChartTimeType] =
    useState<keyof typeof CHART_TIME_TYPE_MAP>("7d");

  const { userBorrow } = useSelector(
    (state: rootState) => state?.contract,
    shallowEqual
  );

  const { APR, panel } = useSelector((state: rootState) => state?.panel);

  const default_opt = useMemo(() => {
    const dataList = APR?.[chartTimeType]?.map(
      (item: any) => item.InterestRate * 100
    );
    const dateList = APR?.[chartTimeType]?.map((item: any) =>
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
        min: 0,
        name: "APY",
        axisLabel: {
          formatter: "{value}",
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
  }, [APR?.["1d"]?.[0]?.BlockTimeStamp, chartTimeType]);

  const pieData: any = useMemo(() => {
    if (!Number(panel?.UtilizedLiquidity)) {
      return [
        {
          value: 0,
          name: "Supplied",
          itemStyle: { color: "rgb(156, 163, 175, 0.3)" },
        },
      ];
    } else {
      return [
        {
          value: panel?.UtilizedLiquidity,
          name: "Utilized",
          itemStyle: { color: "#0093E9" },
        },
        {
          value: panel?.AvailableFIL,
          name: "Available",
          itemStyle: { color: "#4adfe7" },
        },
        {
          value: BigNumber(panel?.TotalFIL || 0)
            .minus(panel?.AvailableFIL)
            .minus(panel?.UtilizedLiquidity || 0)
            .decimalPlaces(6, BigNumber.ROUND_DOWN)
            .toNumber(),
          name: "",
          itemStyle: { color: "rgb(156, 163, 175, 0.3)" },
        },
      ];
    }
  }, [panel]);

  const pie_option = useMemo(() => {
    return {
      series: [
        {
          type: "pie",
          radius: ["60%", "80%"],
          tooltip: {
            formatter: (params: any) => {
              return `${params.marker} ${
                params.name
              } <b style='padding-left:8px'>${numberWithCommas(
                params.data.value,
                6
              )}</b> FIL`;
            },
          },
          label: {
            show: false,
            position: "center",
          },
          labelLine: {
            show: false,
          },
          data: pieData,
        },
      ],
    };
  }, [pieData?.[0]?.value]);

  const handleSearchChange = (e: any) => {
    setSearchText(e.target.value);
  };

  useEffect(() => {
    fetchChartAndPanelData();
  }, []);

  const overviewData = useMemo(() => {
    return [
      {
        title: "Available Liquidity",
        value: numberWithCommas(
          Number(panel?.AvailableFIL) <= 0 ? DEFAULT_EMPTY : panel?.AvailableFIL
        ),
        unit: "FIL",
        tips: "Up to 90% of the Total FIL Liquidity is available to borrow",
      },
      {
        title: "Total Utilized",
        value: `${numberWithCommas(
          panel?.UtilizedLiquidity || 0
        )} of ${numberWithCommas(panel?.TotalFIL || 0)}`,
        unit: "FIL",
      },
      {
        title: "Current Borrowing APR",
        value: numberWithCommas(panel?.InterestRate * 100),
        unit: "%",
      },
    ];
  }, [panel]);

  const chartTimeData: any = Object.keys(CHART_TIME_TYPE_MAP);

  const handleChange = (
    time: keyof typeof CHART_TIME_TYPE_MAP,
    checked: boolean
  ) => {
    if (chartTimeType === time) {
      setChartTimeType("all");
    } else {
      setChartTimeType(time);
    }
  };

  return (
    <section>
      <div className="text-[30px] font-semibold my-4">Borrow</div>
      {/* overview */}
      <Card title="Overview" className="flex-1 mb-5">
        <div className="grid lg:grid-cols-2">
          <div className="flex flex-wrap md:flex-nowrap gap-[16px]">
            <div className="flex-1 flex-wrap lg:flex-nowrap flex flex-col gap-[16px]">
              {overviewData.map((item, index) => (
                <div
                  className={`data-card ${
                    index === 0 && "btn-default text-white"
                  }`}
                  key={item.title}
                >
                  <Space className="mb-4">
                    <p className="text-xs font-semibold">{item.title}</p>
                    {item?.tips && (
                      <InfoTips type="small" content={item.tips} />
                    )}
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
            {/* Utilization Ration */}
            <div className="data-card flex-1">
              <p className="text-xs font-semibold mb-4">Utilization Rate</p>
              <p className="text-[22px] font-bold">
                {numberWithCommas(panel?.UtilizationRate * 100)}
                <span className="text-sm font-normal ml-2">%</span>
              </p>
              <div className="w-[250px] h-[220px] m-auto">
                <PieChart option={pie_option} />
              </div>
            </div>
          </div>
          <div className="lg:ml-[32px] mt-[60px] lg:mt-[0px] relative">
            <div className="absolute -top-[55px] font-bold my-[18px] text-[18px] mb-2">
              <Space>
                <span>Borrowing APR (%)</span>
                <InfoTips content="Due to the on-chain transactions, the visualization could be delayed." />
              </Space>
            </div>
            <div className="flex justify-end mb-4">
              {chartTimeData.slice(1).map((time: any) => (
                <CheckableTag
                  key={time}
                  checked={chartTimeType === time}
                  onChange={(checked) => handleChange(time, checked)}
                >
                  {time}
                </CheckableTag>
              ))}
            </div>
            {APR?.all?.length ? (
              <Chart height="70%" option={default_opt} />
            ) : null}
          </div>
        </div>
      </Card>

      {/* borrowings */}
      <Card>
        {userBorrow?.minerBorrowInfo?.length && currentAccount ? (
          <div className="mb-8">
            <p className="font-semibold text-xl mb-4">My Family</p>
            <BorrowsTable type="my" />
            {(userBorrow?.minerBorrowInfo || []).length < 5 && (
              <div className="text-center mt-4">
                <AddMiner btn="+ Add Miner" />
              </div>
            )}
          </div>
        ) : (
          <div className="flex justify-center">
            <AddMiner />
          </div>
        )}
        <p className="font-semibold text-xl mb-4">
          List of Families / Borrowings
        </p>
        <div className="mb-4">
          <Input
            placeholder="Family Address / Miner ID"
            style={{ width: 300 }}
            suffix={<SearchOutlined />}
            onChange={handleSearchChange}
          />
        </div>
        <BorrowsTable searchText={searchText} />
      </Card>
    </section>
  );
}

export default Borrow;
