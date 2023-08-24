"use client";

import FarmingCard from "./components/farmingCard";
import FarmingTable from "./components/farmingTable";

function Farming() {
  return (
    <section>
      <div className="text-xl font-bold my-8">FIT Farming</div>
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
