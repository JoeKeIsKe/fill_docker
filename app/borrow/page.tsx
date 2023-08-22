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
import { isIndent, heightToDate } from "@/utils";
import { useMetaMask } from "@/hooks/useMetaMask";
import { Button, Divider, Input } from "antd";
import { useSelector } from "react-redux";
import BorrowsTable from "./components/borrowsTable";
import AddMiner from "../certified/addMiner";
import FIT_contract from "@/server/FILLiquid_contract";
import data_fetcher_contract from "@/server/data_fetcher";
import { DEFAULT_EMPTY, Fake_chart_data } from "./components/constans";
import { getChartData } from "../api/modules/index";

function Borrow() {
  const [api, contextHolder] = notification.useNotification();
  const { currentAccount, wallet } = useMetaMask();

  const nework = wallet?.chainId?.includes("0x1") ? "main" : "test";

  const { userBorrow, filInfo } = useSelector(
    (state: rootState) => state?.contract
  );

  console.log("filInfo ==> ", filInfo);

  const date = Fake_chart_data.map((item: any) =>
    heightToDate(item.BlockTimeStamp / 10000, nework)
  );

  const chartData = Fake_chart_data.map((item: any) => item.InterestRate);
  console.log("date ==> ", date, "chartData ==> ", chartData);

  const default_opt = {
    backgroundColor: "transparent",
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: date,
    },
    series: [
      {
        data: chartData,
        type: "line",
        areaStyle: undefined,
      },
    ],
  };

  const pie_option = {
    series: [
      {
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
            value: filInfo?.utilizedLiquidity,
            name: "Supplied",
            itemStyle: { color: "rgb(156, 163, 175, 0.3)" },
          },
          {
            value: userBorrow?.availableCredit,
            name: "Available",
            itemStyle: { color: "#0093E9" },
          },
        ],
      },
    ],
  };

  const fetchChartData = async () => {
    const res = await getChartData();
    console.log("res ==> ", res);
  };

  return (
    <section>
      <div className="text-2xl font-bold my-8">Borrow</div>

      {/* overview */}
      <Card title="Overview" className="flex-1 mb-5">
        <div className="flex">
          <div className="w-[500px]">
            <div className="flex justify-between px-10 gap-x-3 w-[400px]">
              <div className="flex flex-col items-center">
                <p className="text-gray-400">Available</p>
                <p className="text-[20px] font-semibold">{`${
                  userBorrow?.availableCredit || DEFAULT_EMPTY
                } FIL`}</p>
              </div>

              <div className="flex flex-col items-center">
                <p className="text-gray-400">Utilization Ratio</p>
                <p className="text-[20px] font-semibold">
                  {filInfo?.utilizationRate || DEFAULT_EMPTY}
                </p>
              </div>
            </div>
            <div className="flex">
              <div className="w-[250px] h-[220px]">
                <PieChart option={pie_option} />
              </div>
              <div className="flex flex-col items-center mt-[50px]">
                <p className="text-gray-400">Total supplied</p>
                <p className="text-[24px] font-semibold">{`${
                  filInfo?.utilizedLiquidity || DEFAULT_EMPTY
                } of ${filInfo?.totalFIL || DEFAULT_EMPTY}`}</p>
              </div>
            </div>
            <div>
              Current Borrowing APR:{" "}
              <span className="text-[24px]">{`${
                filInfo?.interestRate || DEFAULT_EMPTY
              }%`}</span>
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
        <div className="flex justify-center">
          <AddMiner />
        </div>
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
