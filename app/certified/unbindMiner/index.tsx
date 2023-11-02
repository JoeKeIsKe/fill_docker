import Modal from "@/packages/modal";
import FIL_contract from "@/server/FILLiquid_contract";
import { LoadingOutlined } from "@ant-design/icons";
import { Steps, Button, message, notification } from "antd";
import { useState } from "react";
import Step1 from "./Step1";
import Step2 from "./Step2";
import { useMetaMask } from "@/hooks/useMetaMask";
import useLoading from "@/hooks/useLoading";
import ActionButton from "@/packages/ActionButton";
import { postUnbindBuildMessage, postPushMessage } from "../../api/modules";
import Image from "next/image";

import WarningIcon from "@/assets/warning_icon.png";
import SuccessIcon from "@/assets/success_icon.png";

interface IProps {
  minerId: string;
  disabled?: boolean;
}

export default ({ minerId, disabled }: IProps) => {
  const { wallet, currentAccount } = useMetaMask();
  const { loading, setLoading } = useLoading("unbind");
  const network = wallet?.chainId?.includes("0x1") ? "f0" : "t0";

  const [api, contextHolder] = notification.useNotification();

  const [show, setShow] = useState(false);
  const [current, setCurrent] = useState(0);
  const [msgData, setMsgData] = useState<any>();
  const [sign, setSign] = useState<string>("");

  const handleClick = async () => {
    switch (current) {
      case 0:
        try {
          setLoading(true);
          const res = await postUnbindBuildMessage({
            miner_id: Number(minerId),
          });
          if (res) {
            setMsgData(res);
            setCurrent(1);
          }
        } finally {
          setLoading(false);
        }
        break;
      case 1:
        try {
          setLoading(true);
          const pushMessageParams = {
            message: msgData?.msg_hex as string,
            cid: msgData?.msg_cid_str as string,
            sign,
            wait: true,
          };
          try {
            await postPushMessage(pushMessageParams);
            setCurrent(2);
          } catch (err: any) {
            api.error({
              message: err.message,
            });
            setShow(false);
          }
        } finally {
          setLoading(false);
        }
        break;
      case 2:
        setLoading(true);
        try {
          const res = await FIL_contract.unBindMiner(minerId, currentAccount);
          if (res) {
            setCurrent(3);
          } else {
            setLoading(false);
          }
        } finally {
          setLoading(false);
        }
        break;
      case 3:
        setShow(false);
      default:
        break;
    }
  };

  const clear = () => {
    setCurrent(0);
  };

  const btnText: any = {
    0: "Next",
    1: "Unbind Miner",
    2: "Confirm",
    3: "OK",
  };

  return (
    <>
      <ActionButton
        name="Unbind"
        disabled={disabled}
        onClick={() => {
          clear();
          setShow(true);
        }}
      />
      <Modal
        width={1000}
        className="w-full form-family-modal"
        title={`Unbind Miner ${network}${minerId}`}
        show={show}
        onCancel={() => {
          setShow(false);
        }}
      >
        <div className="my-4 px-5">
          {current > 0 && (
            <Steps
              type="navigation"
              size="small"
              current={current - 1}
              className="site-navigation-steps custom_steps"
              items={[
                {
                  title: "Change Beneficiary",
                  description: "Step 1",
                },
                {
                  title: `Confirm`,
                  description: "Step 2",
                },
              ]}
            />
          )}
          <div className="mt-5">
            {current === 0 && (
              <div className="flex flex-col items-center pt-2">
                <Image src={WarningIcon} width={88} height={88} alt="" />
                <p className="font-semibold text-[24px] text-center mt-[24px] max-w-[500px]">
                  Are you sure to unbind this miner and retrieve the
                  beneficiary?
                </p>
              </div>
            )}
            {current === 1 && (
              <Step1
                msg={msgData?.msg_cid_hex}
                onChange={(value) => {
                  setSign(value);
                }}
              />
            )}
            {current === 2 && <Step2 />}
            {current === 3 && (
              <div className="flex flex-col items-center justify-center">
                <Image src={SuccessIcon} width={120} height={120} alt="" />
                <p className="font-semibold text-[24px] mt-[24px]">
                  Successfully unbound
                </p>
              </div>
            )}
            <div className="text-center mt-20">
              {current === 1 && loading && (
                <p className="text-sm mb-2 text-gray-300">
                  It may take 2-3 minutes...
                </p>
              )}
              <Button
                className="w-1/3 h-[40px] !rounded-[60px]"
                type="primary"
                disabled={current === 1 && !sign}
                onClick={handleClick}
              >
                {loading ? (
                  <LoadingOutlined />
                ) : (
                  <span>{btnText[current]}</span>
                )}
              </Button>
            </div>
          </div>
          {contextHolder}
        </div>
      </Modal>
    </>
  );
};
