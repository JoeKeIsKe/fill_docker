import Input from "@/packages/custom_input";
import { useMetaMask } from "@/hooks/useMetaMask";

export default ({ onChange }: { onChange: (value: string) => void }) => {
  const { wallet } = useMetaMask();
  const network = wallet?.chainId?.includes("0x1") ? "f0" : "t0";
  return (
    <div>
      <p className="mb-2 mt-10 text-[rgba(6,8,27,0.4)] font-medium">
        Miner Address
      </p>
      <Input
        className="h-16 mb-[30px]"
        suffixText={network}
        onChange={(value) => {
          onChange(value?.trim());
        }}
      />
    </div>
  );
};
