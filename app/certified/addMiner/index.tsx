import Modal from "@/packages/modal";
import Validation from "@/server/Validation";
import FIL_contract from "@/server/FILLiquid_contract";
import { LoadingOutlined } from "@ant-design/icons";
import { Divider, Steps } from "antd";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import Step1 from "./Step1";
import Step2 from "./Step2";
import Step3 from "./Step3";
import { useMetaMask } from "@/hooks/useMetaMask";
import { Button, notification } from "antd";
import useLoading from "@/hooks/useLoading";
import store from "@/store";
import Image from "next/image";
import { postBuildMessage, postPushMessage } from "@/app/api/modules";
import data_fetcher_contract from "@/server/data_fetcher";
import { Fill_liquid_contract_id, Fill_liquid_contract } from "@/contract";
import InfoTips from "@/components/infoTips";

import SuccessIcon from "@/assets/success_icon.png";

export default ({ btn }: { btn?: string | React.ReactNode }) => {
  const { currentAccount, connectButton } = useMetaMask();

  const [show, setShow] = useState(false);
  const [current, setCurrent] = useState(-1);
  const [miner, setMiner] = useState<string>("");
  const [sign, setSign] = useState("");
  const [msg, setMsg] = useState("");
  const [msgData, setMsgData] = useState<any>();
  const { loading, setLoading } = useLoading();

  const [api, contextHolder] = notification.useNotification();

  const handleClick = async () => {
    switch (current) {
      case -1:
        setCurrent(0);
        break;
      case 0:
        if (!miner)
          return api.warning({
            message: "Please input the miner address",
            placement: "top",
          });
        setLoading(true);

        let pendingData: any;
        data_fetcher_contract
          .getPendingStatus(Number(miner))
          .then((res) => {
            pendingData = res;
          })
          .catch(() => {
            setLoading(false);
          });
        if (
          pendingData &&
          pendingData?.[1] === true &&
          pendingData?.[0]?.toLocaleLowerCase() ===
            Fill_liquid_contract.toLocaleLowerCase()
        ) {
          setLoading(false);
          return setCurrent(2);
        }

        try {
          const msgData = await postBuildMessage({
            miner_id: Number(miner),
            to_address: Fill_liquid_contract_id,
          });
          // console.log("msgData ==> ", msgData);
          setMsgData(msgData);
          setCurrent(1);
        } finally {
          setLoading(false);
        }
        break;
      case 1:
        setLoading(true);
        try {
          const pushMessageParams = {
            message: msgData.msg_hex as string,
            cid: msgData.msg_cid_str as string,
            sign,
            wait: true,
          };
          try {
            const res = await postPushMessage(pushMessageParams);
            setMsgData({
              ...msgData,
              ...res,
            });
          } catch (err: any) {
            api.error({
              message: err.message,
              onClose: () => {
                setShow(false);
              },
            });
          }
          const msg = await Validation.getSigningMsg(miner);
          setMsg(msg);
          setCurrent(2);
        } finally {
          setLoading(false);
        }
        break;
      case 2:
        setLoading(true);
        try {
          const res = await FIL_contract.bindMiner(miner, sign, currentAccount);
          if (res) {
            setCurrent(current + 1);
          }
        } finally {
          setLoading(false);
        }
        break;
      default:
        if (current > 2) {
          setShow(false);
          store.dispatch({
            type: "common/change",
            payload: { refreshAllData: true },
          });
        }
        break;
    }
  };

  const clear = () => {
    setCurrent(-1);
    setMiner("");
    setSign("");
    setMsg("");
  };

  const getMsg = async () => {
    const msg = await Validation.getSigningMsg(miner);
    setMsg(msg);
  };

  useEffect(() => {
    if (current === 2 && !sign) {
      getMsg();
    }
  }, [current]);

  const renderStep = useCallback(
    (key: number) => {
      switch (key) {
        case -1:
          return (
            <div className="mx-auto max-w-[700px]">
              <p className="text-center text-[28px] font-bold">
                Form a Family / Transfer Beneficiary
              </p>
              <Divider />
              <div className="flex gap-[50px]">
                <p className="">
                  Transfer beneficiary with a third-party tool such as Lotus and
                  Venus, please refer to the Tutorial and skip the steps.
                </p>
                <p className="pt-[30px]">OR</p>
                <div className="mb-[30px]">
                  Transfer beneficiary and form a{" "}
                  <span className="font-semibold">Miner Family</span>{" "}
                  <InfoTips
                    type="small"
                    content="In order to extend the use cases to include new SPs who do not have a balance to borrow against, the concept of Family Miners is introduced. Family Miners refer to a group of Miners associated with the same Family role. Within a Family, the Total Account Balance of all members can be pooled as collateral, allowing any one or more family members to borrow against."
                  />{" "}
                  with FILLiquid user interface, please input the Miner ID below
                  and follow the steps.
                  <div>
                    <Button
                      className="mt-4 w-full !rounded-[60px]"
                      type="primary"
                      size="large"
                      onClick={() => {
                        handleClick();
                      }}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        case 0:
          return (
            <Step1
              onChange={(value) => {
                setMiner(value);
              }}
            />
          );
        case 1:
          return (
            <Step2
              msg={msgData?.msg_cid_hex}
              onChange={(value) => {
                setSign(value);
              }}
            />
          );
        case 2:
          return (
            <Step3
              msg={msg}
              onChange={(value) => {
                setSign(value?.slice(2));
              }}
            />
          );
        default:
          return (
            <div className="flex flex-col items-center justify-center">
              <Image src={SuccessIcon} width={120} height={120} alt="" />
              <p className="font-semibold text-[24px] mt-[24px]">
                Successfully created
              </p>
            </div>
          );
      }
    },
    [current, msg]
  );

  const renderBtn = useCallback(() => {
    if (current < 0) return null;
    return (
      <div className="mt-20 ">
        {current === 1 && loading && (
          <p className="text-sm mb-2 text-gray-300">
            It may take 2-3 minutes...
          </p>
        )}
        <Button
          className="w-1/3 !rounded-[60px]"
          type="primary"
          size="large"
          onClick={() => {
            if (loading) return;
            handleClick();
          }}
        >
          {loading ? (
            <LoadingOutlined />
          ) : (
            <span>{current > 2 ? "OK" : "Next"}</span>
          )}
        </Button>
      </div>
    );
  }, [current, loading, handleClick]);

  return (
    <>
      {currentAccount ? (
        btn ? (
          <Button
            size="large"
            type="primary"
            onClick={() => {
              clear();
              setShow(true);
            }}
          >
            {btn}
          </Button>
        ) : (
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
        )
      ) : (
        connectButton()
      )}
      <Modal
        width={1000}
        className="w-full form-family-modal"
        title=""
        show={show}
        onCancel={() => {
          setShow(false);
        }}
      >
        <div className="my-4 px-5">
          {current >= 0 && (
            <Steps
              type="navigation"
              current={current}
              className="site-navigation-steps custom_steps"
              items={[
                {
                  title: "Input Miner Address",
                  description: "Step 1",
                },
                {
                  title: "Transfer Miner",
                  description: "Step 2",
                },
                {
                  title: "Confirm",
                  description: "Step 3",
                },
              ]}
            />
          )}
          <div className="mt-5">
            {renderStep(current)}
            <div className="text-center">{renderBtn()}</div>
          </div>

          {contextHolder}
        </div>
      </Modal>
    </>
  );
};
