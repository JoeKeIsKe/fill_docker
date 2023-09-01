"use client";

import { useEffect, useMemo, useState } from "react";
import Card from "@/packages/card";
import Chart from "@/components/charts";
import PieChart from "@/components/pieChart";
import { rootState } from "@/store/type";
import { timestampToDateTime } from "@/utils";
import { Input } from "antd";
import { shallowEqual, useSelector } from "react-redux";
import BorrowsTable from "./components/borrowsTable";
import AddMiner from "../certified/addMiner";
import { DEFAULT_EMPTY } from "./components/constans";
import { getChartData } from "../api/modules/index";
import { SearchOutlined } from "@ant-design/icons";
import BigNumber from "bignumber.js";

function Borrow() {
  const [chartData, setChartData] = useState([]);
  const [chartDate, setChartDate] = useState([]);
  const [searchText, setSearchText] = useState<string | null>();

  const { userBorrow, filInfo } = useSelector(
    (state: rootState) => state?.contract,
    shallowEqual
  );

  const available = BigNumber(filInfo?.totalFIL || 0)
    .times(0.9)
    .minus(BigNumber(filInfo?.utilizedLiquidity || 0))
    .toFixed(2);

  const default_opt = useMemo(() => {
    return {
      backgroundColor: "transparent",
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: chartDate,
      },
      yAxis: {
        type: "value",
        min: 0,
        axisLabel: { formatter: "{value} %" },
      },
      series: [
        {
          data: chartData,
          type: "line",
          areaStyle: undefined,
        },
      ],
    };
  }, [chartData, chartDate]);

  const pieData: any = useMemo(() => {
    if (
      !Number(filInfo?.utilizedLiquidity) &&
      !Number(userBorrow?.availableCredit)
    ) {
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
          value: filInfo?.utilizedLiquidity,
          name: "Supplied",
          itemStyle: { color: "#0093E9" },
        },
        {
          value: filInfo?.availableFIL,
          name: "",
          itemStyle: { color: "rgb(156, 163, 175, 0.3)" },
        },
      ];
    }
  }, [filInfo]);

  const pie_option = useMemo(() => {
    return {
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
          data: pieData,
        },
      ],
    };
  }, [pieData]);

  const fetchChartData = async () => {
    const res = await getChartData();
    if (res) {
      const { Basic } = res;
      const target = Basic?.slice(-8) || [];
      const dataList = target.map((item: any) => item.InterestRate);
      const dateList = target.map((item: any) =>
        timestampToDateTime(item.BlockTimeStamp)
      );
      setChartData(dataList);
      setChartDate(dateList);
    }
  };

  const handleSearchChange = (e: any) => {
    setSearchText(e.target.value);
  };

  useEffect(() => {
    fetchChartData();
  }, []);

  return (
    <section>
      <div className="text-2xl font-bold my-8">Borrow</div>
      {/* overview */}
      <Card title="Overview" className="flex-1 mb-5">
        <div className="flex flex-col sm:flex-row">
          <div className="w-[300px] md:w-[500px]">
            <div className="flex justify-between px-10 gap-x-3 w-[300px] sm:w-[400px]">
              <div className="flex flex-col items-center">
                <p className="text-gray-400">Available</p>
                <p className="text-[20px] font-semibold">{`${
                  Number(available) <= 0 ? DEFAULT_EMPTY : available
                } FIL`}</p>
              </div>

              <div className="flex flex-col items-center">
                <p className="text-gray-400">Utilization Ratio</p>
                <p className="text-[20px] font-semibold">
                  {filInfo?.utilizationRate || DEFAULT_EMPTY}%
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
                } of ${filInfo?.totalFIL || DEFAULT_EMPTY} FIL`}</p>
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
        {userBorrow?.minerBorrowInfo !== undefined &&
          (userBorrow?.minerBorrowInfo?.length ? (
            <div className="mb-8">
              <p className="font-semibold text-xl mb-4">My Family</p>
              <BorrowsTable type="my" />
            </div>
          ) : (
            <div className="flex justify-center">
              <AddMiner />
            </div>
          ))}
        <p className="font-semibold text-xl mb-4">Borrowings</p>
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
