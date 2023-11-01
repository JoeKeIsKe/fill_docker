import { Input } from "antd";

export default ({
  msg,
  onChange,
}: {
  msg?: string;
  onChange: (value: string) => void;
}) => {
  // console.log("----333", msg);
  return (
    <div className="h-40">
      <div className="flex flex-col mb-5">
        <p className="pb-4">
          Sign for Beneficiary Address transfer execution. Bind an f4 address as
          a Miner Family ID.
        </p>
        <span className="text-base">Keys</span>
        <span className=" font-medium	text-gray-600">{msg?.slice(2)}</span>
      </div>

      <div>
        <label htmlFor="sign" className="mb-[10px] block text-base">
          Sign:
        </label>
        <div className="relative flex h-[49px] w-full flex-row-reverse overflow-clip rounded-lg border hover:border-hover">
          <Input
            type="text"
            name="sign"
            className="peer w-full px-5  rounded-none transition-colors duration-300 hover:border-transparent"
            autoComplete="off"
            onChange={(e) => {
              onChange(e.target.value);
            }}
          />
          <span className="flex items-center  border border-r-0 border-[#EAEAEF] bg-slate-50 px-4 text-sm text-slate-400 transition-colors duration-300 peer-focus:border-hover peer-focus:bg-active peer-focus:text-white">
            0x
          </span>
        </div>
      </div>
    </div>
  );
};
