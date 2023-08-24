import Input from "@/packages/custom_input";
import { useMetaMask } from "@/hooks/useMetaMask";

export default ({ onChange }: { onChange: (value: string) => void }) => {
  const { wallet } = useMetaMask();
  const network = wallet?.chainId?.includes("0x1") ? "f0" : "t0";
  return (
    <div className="h-40">
      <p className="mb-4 mt-5">Miner Address:</p>
      <Input
        className="h-16"
        suffixText={network}
        onChange={(value) => {
          onChange(value);
        }}
      />
    </div>
  );
};
