import { getSvg } from "@/svgTypes";
import AddMiner from "./addMiner";

export default () => {
  return (
    <div className="pt-20 flex items-center justify-between">
      <div>
        <h3 className="flex text-2xl font-medium items-center gap-x-2">
          <div className="w-4 text-hover ">{getSvg("holders")}</div>
          Miner Account Market
        </h3>
        <div className="mt-2 text-slate-600	">
          Allowing Storage Providers to implement securely trustless account
          trading, optimize capital efficiency, select special ID numbers, etc.
        </div>
      </div>
      <AddMiner />
    </div>
  );
};
