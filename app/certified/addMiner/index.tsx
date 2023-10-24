import Modal from "@/packages/modal";
import Validation from "@/server/Validation";
import FIL_contract from "@/server/FILLiquid_contract";
import { LoadingOutlined } from "@ant-design/icons";
import { Steps } from "antd";
import { useState } from "react";
import Step1 from "./Step1";
import Step2 from "./Step2";
import Step3 from "./Step3";
import { useMetaMask } from "@/hooks/useMetaMask";
import { Button, notification } from "antd";
import useLoading from "@/hooks/useLoading";
import store from "@/store";

export default () => {
  const { currentAccount, connectButton } = useMetaMask();

  const [show, setShow] = useState(false);
  const [current, setCurrent] = useState(0);
  const [miner, setMiner] = useState<string>("");
  const [sign, setSign] = useState("");
  const [msg, setMsg] = useState("");
  const { loading, setLoading } = useLoading();

  const [api, contextHolder] = notification.useNotification();

  const handleClick = async () => {
    switch (current) {
      //get msg
      case 1:
        // console.log("----1", miner, sign);
        if (!miner)
          return api.warning({
            message: "Please input the miner address",
            placement: "top",
          });
        setLoading(true);
        try {
          const msg = await Validation.getSigningMsg(miner);
          // console.log("---3", msg);
          setMsg(msg);
        } finally {
          setLoading(false);
        }
        break;
      // add miner
      case 2:
        if (!miner)
          return api.warning({
            message: "Please input the sign",
            placement: "top",
          });
        setLoading(true);
        // console.log("----3", miner, sign);
        try {
          const res = await FIL_contract.bindMiner(miner, sign, currentAccount);
          if (res) {
            api.success({
              message: "Successfully created",
            });
          }
        } finally {
          setLoading(false);
        }
      default:
        if (current < 2) {
          setCurrent(current + 1);
        } else {
          setShow(false);
          store.dispatch({
            type: "common/change",
            payload: { refreshAllData: true },
          });
        }
        break;
    }

    if (current < 2) {
      setCurrent(current + 1);
    }
  };

  const clear = () => {
    setCurrent(0);
    setMiner("");
    setSign("");
    setMsg("");
  };

  return (
    <>
      {currentAccount ? (
        <div className="flex w-full justify-center border border-[rgba(100, 111, 126, 0.2)] py-[40px] border-dashed rounded-[8px] mb-[24px]">
          <Button
            type="primary"
            className="w-1/2 !rounded-[24px] !h-[54px]"
            size="large"
            onClick={() => {
              clear();
              setShow(true);
            }}
          >
            Form a Family
          </Button>
        </div>
      ) : (
        connectButton()
      )}
      <Modal
        width={1000}
        className="w-full"
        title="Add Miner"
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
                // status: "process",
                title: "Change Beneficiary",
                description: "Step 1",
              },
              {
                title: "Miner ID",
                description: "Step 2",
              },
              {
                title: "Messages",
                description: "Step 3",
              },
            ]}
          />
          <div className="mt-5">
            {current === 0 && <Step1 />}
            {current === 1 && (
              <Step2
                onChange={(value) => {
                  setMiner(value);
                }}
              />
            )}
            {current === 2 && (
              <Step3
                msg={msg}
                onChange={(value) => {
                  setSign(value?.slice(2));
                }}
              />
            )}

            <Button
              className="w-1/3 mt-20"
              type="primary"
              onClick={handleClick}
            >
              {loading ? (
                <LoadingOutlined />
              ) : (
                <span>{current === 2 ? "Add Miner" : "Next"}</span>
              )}
            </Button>
          </div>
          {contextHolder}
        </div>
      </Modal>
    </>
  );
};
