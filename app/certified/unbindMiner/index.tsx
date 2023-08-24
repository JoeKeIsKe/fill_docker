import Modal from "@/packages/modal";
import FIL_contract from "@/server/FILLiquid_contract";
import { LoadingOutlined } from "@ant-design/icons";
import { Steps, Button } from "antd";
import { useState } from "react";
import Step1 from "./Step1";
import Step2 from "./Step2";
import { useMetaMask } from "@/hooks/useMetaMask";
import useLoading from "@/hooks/useLoading";

interface IProps {
  minerId: string;
  disabled?: boolean;
}

export default ({ minerId, disabled }: IProps) => {
  const { wallet, currentAccount } = useMetaMask();
  const { loading, setLoading } = useLoading("unbind");
  const network = wallet?.chainId?.includes("0x1") ? "f0" : "t0";

  const [show, setShow] = useState(false);
  const [current, setCurrent] = useState(0);

  const handleClick = async () => {
    switch (current) {
      case 1:
        setLoading(true);
        try {
          await FIL_contract.unBindMiner(minerId, currentAccount);
        } finally {
          setLoading(false);
        }
      default:
        setCurrent(current + 1);
        break;
    }

    if (current < 2) {
      setCurrent(current + 1);
    }
  };

  const clear = () => {
    setCurrent(0);
  };

  return (
    <>
      <a
        className="text-[#0093E9]"
        style={
          disabled
            ? {
                color: "rgb(209 213 219)",
                cursor: "default",
              }
            : {}
        }
        onClick={() => {
          if (disabled) return;
          clear();
          setShow(true);
        }}
      >
        Unbind
      </a>
      <Modal
        width={1000}
        className="w-full"
        title={`Unbind Miner ${network}${minerId}`}
        show={show}
        onCancel={() => {
          setShow(false);
        }}
      >
        <div className="my-4 border-t px-5 border-slate-300	">
          <Steps
            type="navigation"
            size="small"
            current={current}
            className="site-navigation-steps custom_steps"
            items={[
              {
                title: "Change Beneficiary",
                description: "Step 1",
              },
              {
                title: `Unbind Miner`,
                description: "Step 2",
              },
            ]}
          />
          <div className="mt-5">
            {current === 0 && <Step1 />}
            {current === 1 && <Step2 />}

            <Button
              className="w-1/3 mt-20"
              type="primary"
              onClick={handleClick}
            >
              {loading ? (
                <LoadingOutlined />
              ) : (
                <span>{current === 1 ? "Unbind Miner" : "Next"}</span>
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};