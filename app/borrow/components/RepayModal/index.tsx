"use client";

import { Modal, Table, Select, notification } from "antd";
import { useEffect, useState } from "react";
import NumberInput from "@/packages/NumberInput";
import Tabs from "@/packages/Tabs";
import type { ColumnsType } from "antd/es/table";
import { DEFAULT_EMPTY, REPAY_MODAL_TITLE, REPAY_TAB_KEYS } from "../constans";
import { MinerListItem, RepayModalData } from "@/utils/type";
import { isIndent, numberWithCommas } from "@/utils";
import Link from "next/link";
import useLoading from "@/hooks/useLoading";
import FIL_contract from "@/server/FILLiquid_contract";
import { useMetaMask } from "@/hooks/useMetaMask";
import ConfirmModal from "@/components/ConfirmModal";

interface IProps {
  isOpen?: boolean;
  title?: string;
  rawData?: RepayModalData;
  hideTabs?: boolean;
  updateList?: () => void;
  onCancel?: () => void;
}

interface DataType extends MinerListItem {}

interface Rewards {
  amountFIT?: number | string;
  amountFIL?: number | string;
}

function RepayModal(props: IProps) {
  const {
    isOpen = false,
    title = "Repay",
    rawData,
    hideTabs = false,
    updateList,
    onCancel,
  } = props;

  const [amount, setAmount] = useState<number | null>();
  const [tabKey, setTabKey] = useState<string | null>(REPAY_TAB_KEYS[0]);
  const [minerFrom, setMinerFrom] = useState<string | null>();
  const [minerTo, setMinerTo] = useState<string>();
  const [repayAll, setRepayAll] = useState<boolean>(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [rewards, setRewards] = useState<Rewards>();

  const [api, contextHolder] = notification.useNotification();
  const { loading, setLoading } = useLoading();
  const { currentAccount, wallet } = useMetaMask();
  const network = wallet?.chainId?.includes("0x1") ? "f0" : "t0";

  const list = rawData?.minerList || [];
  const options = list?.map((item) => ({
    value: item.minerId,
    label: `${network}${item.minerId}`,
  }));
  let maxNum = Number(wallet.balance);

  const currentMinerId = rawData?.miner?.minerId;

  const columns: ColumnsType<DataType> = [
    {
      title: "Miner ID",
      dataIndex: "minerId",
      key: "minerId",
      render: (val, row) => (
        <Link
          className="text-[#4094e0]"
          href={`/miner/detail/${val}`}
          target="_blank"
        >{`${network}${val}`}</Link>
      ),
    },
    {
      title: "Credit Outstanding",
      dataIndex: "debtOutStanding",
      key: "debtOutStanding",
      render: (val) => `${numberWithCommas(val)} FIL`,
    },
    {
      title: "Available Balance",
      dataIndex: "availableBalance",
      key: "availableBalance",
      render: (val) => `${numberWithCommas(val)} FIL`,
    },
  ];

  const handleFeedbackCancel = () => {
    setIsFeedbackOpen(false);
    if (rewards) {
      setRewards(undefined);
      if (updateList) {
        updateList();
      }
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      clear();
      onCancel();
    }
  };

  const handleConfirm = async () => {
    if (tabKey === REPAY_TAB_KEYS[0] && (!minerFrom || !minerTo))
      return api.warning({
        message: "Please select the miner",
        placement: "top",
      });
    if (!repayAll && !hideTabs && !amount)
      return api.warning({
        message: "Please input the amount",
        placement: "top",
      });
    setLoading(true);
    try {
      let res: any;
      switch (title) {
        case REPAY_MODAL_TITLE[1]:
          // repay - from miner
          if (tabKey === REPAY_TAB_KEYS[0] && minerFrom && minerTo) {
            res = await FIL_contract.onRepayFromMiner(
              minerFrom,
              minerTo,
              repayAll ? maxNum : amount || 0
            );
          }
          // repay - from wallet
          if (tabKey === REPAY_TAB_KEYS[1] && currentMinerId) {
            res = await FIL_contract.onRepayFromWallet(
              currentMinerId,
              repayAll ? maxNum : amount || 0
            );
          }
          break;
        case REPAY_MODAL_TITLE[2]:
          // liquidate
          if (minerFrom && minerTo) {
            res = await FIL_contract.onLiquidate(minerFrom, minerTo);
          }
          break;
        case REPAY_MODAL_TITLE[3]:
          // repay - for others
          if (currentMinerId && amount) {
            res = await FIL_contract.onRepayFromWallet(
              currentMinerId,
              amount,
              currentAccount
            );
          }
          break;
        default:
          break;
      }

      if (res) {
        handleCancel();
        setIsFeedbackOpen(true);
        setRewards({
          amountFIL: res?.amount || 0,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const onTabChange = (tabKey: string) => {
    setTabKey(tabKey);
    setAmount(undefined);
  };

  const clear = () => {
    setAmount(undefined);
    setMinerFrom(undefined);
    setMinerTo(undefined);
  };

  const handleChangeFrom = (value: string) => {
    setMinerFrom(value);
  };

  const handleChangeTo = (value: string) => {
    setMinerTo(value);
  };

  // const onMaxButtonClick = () => {
  //   if (minerFrom) {
  //     const target = rawData?.minerList.find(
  //       (item) => item.minerId === minerFrom
  //     );
  //     maxNum = BigNumber.min(
  //       ...[Number(target?.availableBalance), Number(maxNum)]
  //     ).toNumber();
  //   }
  //   setAmount(Number(maxNum));
  // };

  const handleNumberInputChange = (val: any) => {
    if (typeof val === "boolean") {
      setRepayAll(val);
    } else {
      setAmount(val);
    }
  };

  useEffect(() => {
    switch (title) {
      case REPAY_MODAL_TITLE[1]:
        setTabKey(REPAY_TAB_KEYS[0]);
        break;
      case REPAY_MODAL_TITLE[2]:
        setTabKey(REPAY_TAB_KEYS[0]);
        break;
      case REPAY_MODAL_TITLE[3]:
        setTabKey(REPAY_TAB_KEYS[1]);
        break;
      default:
        break;
    }
  }, [title]);

  useEffect(() => {
    if (!hideTabs && currentMinerId) {
      setMinerTo(currentMinerId);
    }
  }, [hideTabs, currentMinerId, isOpen]);

  return (
    <>
      <Modal
        className="custom-modal big-btn"
        title=""
        open={isOpen}
        width={600}
        onCancel={handleCancel}
        cancelButtonProps={{
          size: "large",
        }}
        onOk={handleConfirm}
        okText={title === "Liquidate" ? "Liquidate" : "Repay"}
        okButtonProps={{
          size: "large",
          loading: loading,
        }}
      >
        {!hideTabs && (
          <Tabs className="mb-4" tabs={REPAY_TAB_KEYS} onChange={onTabChange} />
        )}
        {tabKey === REPAY_TAB_KEYS[0] ? (
          <>
            <p className="text-lg font-semibold mb-4">
              {isIndent(rawData?.familyInfo?.user || "")}
            </p>
            <Table
              className="[& .ant-table-thead > tr > th]:border-b-0"
              columns={columns}
              dataSource={list}
              pagination={false}
              rowKey="minerId"
            />
            <div className="my-4 flex">
              <div>
                <label className="block opacity-40 text-[#06081B] text-sm font-medium mb-[5px]">
                  From
                </label>
                <Select
                  className="mr-12"
                  style={{ width: 250 }}
                  size="large"
                  value={minerFrom}
                  onChange={handleChangeFrom}
                  options={options}
                />
              </div>
              <div>
                <label className="block opacity-40 text-[#06081B] text-sm font-medium mb-[5px]">
                  To
                </label>
                <Select
                  disabled={title === REPAY_MODAL_TITLE[1]}
                  style={{ width: 250 }}
                  size="large"
                  value={minerTo}
                  onChange={handleChangeTo}
                  options={options}
                />
              </div>
            </div>
            {!hideTabs && (
              <NumberInput
                label="Amount"
                value={amount}
                prefix="FIL"
                min={1}
                max={maxNum}
                repayAll
                onChange={handleNumberInputChange}
              />
            )}
          </>
        ) : (
          <>
            <p className="font-semibold my-2 opacity-60">{`Miner ID: ${network}${currentMinerId}`}</p>
            <div className="data-card">
              {/* <div className="w-1/2">{`Family Available Credit: ${
              rawData?.familyInfo.availableCredit || DEFAULT_EMPTY
            } FIL`}</div> */}
              <p className="text-xs font-semibold mb-4">
                Family Debt Outstanding
              </p>
              <p className="text-[22px] font-bold">
                {rawData?.miner?.debtOutStanding || DEFAULT_EMPTY}
                <span className="text-sm font-normal ml-2">FIL</span>
              </p>
            </div>
            <div className="mt-5">
              <NumberInput
                label="Amount"
                value={amount}
                prefix="FIL"
                max={maxNum}
                repayAll
                onChange={handleNumberInputChange}
              />
            </div>
          </>
        )}
        {contextHolder}
      </Modal>
      <ConfirmModal
        isOpen={isFeedbackOpen}
        type="success"
        title={`Successfully ${
          title === REPAY_MODAL_TITLE[2] ? "Liquidated" : "Repayed"
        }`}
        desc={`${rewards?.amountFIL} FIL ${
          title === REPAY_MODAL_TITLE[2] ? "liquidated" : "repayed"
        }`}
        onConfirm={handleFeedbackCancel}
        onCancel={handleFeedbackCancel}
      />
    </>
  );
}

export default RepayModal;
