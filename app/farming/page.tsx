"use client";

import { useSelector } from "react-redux";
import { rootState } from "@/store/type";
import { Divider } from "antd";

import FarmingCard from "./components/FarmingCard";
import FarmingTable from "./components/FarmingTable";

function Farming() {
  const { panel } = useSelector((state: rootState) => state?.panel);

  return (
    <section>
      <div className="text-[30px] font-semibold my-4 relative">
        FIT Farming
        <div className="flex items-center mt-2 text-xs gap-[20px] md:gap-[40px] rounded-[10px] min-w-[380px]">
          <div className="rounded-[10px] px-[8px] py-[4px]">
            <p className="text-linear">
              {`Total FIG Outstanding: ${panel.FigTotalSupply || 0} FIG`}
            </p>
          </div>
          <Divider type="vertical" className="border-[rgba(0,0,0,0.35)]" />
          <div>{`From FIT Farming: ${panel.AccumulatedStakeMint} FIG`}</div>
          <div>
            {`From Interest Repayment: ${panel.AccumulatedInterestMint} FIG`}
          </div>
        </div>
      </div>
      <div className="flex gap-8 flex-col lg:flex-row">
        {/* Staking Section */}
        <FarmingCard />
        {/* Table */}
        <div className="flex-1">
          <FarmingTable />
        </div>
      </div>
    </section>
  );
}

export default Farming;
