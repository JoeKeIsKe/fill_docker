"use client";

import { Modal, Divider, Table, Select, notification } from "antd";
import { ReactNode, useEffect, useState } from "react";
import NumberInput from "@/packages/NumberInput";
import Tabs from "@/packages/Tabs";
import type { ColumnsType } from "antd/es/table";
import { DEFAULT_EMPTY, REPAY_MODAL_TITLE, REPAY_TAB_KEYS } from "../constans";
import { MinerListItem, RepayModalData } from "@/utils/type";
import { isIndent } from "@/utils";
import Link from "next/link";
import BigNumber from "bignumber.js";
import useLoading from "@/hooks/useLoading";
import FIL_contract from "@/server/FILLiquid_contract";
import { useMetaMask } from "@/hooks/useMetaMask";

interface IProps {
  isOpen?: boolean;
  title?: string;
  rawData?: RepayModalData;
  hideTabs?: boolean;
  onCancel?: () => void;
}

interface DataType extends MinerListItem {}

function RepayModal(props: IProps) {
  const {
    isOpen = false,
    title = "Repay",
    rawData,
    hideTabs = false,
    onCancel,
  } = props;

  const [amount, setAmount] = useState<number | null>();
  const [tabKey, setTabKey] = useState<string | null>(REPAY_TAB_KEYS[0]);
  const [minerFrom, setMinerFrom] = useState<string | null>();
  const [minerTo, setMinerTo] = useState<string>();
  const [repayAll, setRepayAll] = useState<boolean>(false);

  const [api, contextHolder] = notification.useNotification();
  const { sendLoading, setSendLoading } = useLoading();
  const { wallet } = useMetaMask();

  console.log("rawData ==> ", rawData);
  const list = rawData?.minerList || [];
  const options = list?.map((item) => ({
    value: item.minerId,
    label: `t0${item.minerId}`,
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
          className="text-[#0093E9]"
          href={`/miner/detail/${val}`}
          target="_blank"
        >{`t0${val}`}</Link>
      ),
    },
    {
      title: "Credit Outstanding",
      dataIndex: "debtOutStanding",
      key: "debtOutStanding",
      render: (val) => `${val} FIL`,
    },
    {
      title: "Available Balance",
      dataIndex: "availableBalance",
      key: "availableBalance",
      render: (val) => `${val} FIL`,
    },
  ];

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
    if (!repayAll && !amount)
      return api.warning({
        message: "Please input the amount",
        placement: "top",
      });
    setSendLoading(true);
    try {
      let res;
      if (tabKey === REPAY_TAB_KEYS[0]) {
        if (minerFrom && minerTo) {
          res = await FIL_contract.onRepayFromMiner(
            minerFrom,
            minerTo,
            repayAll ? maxNum : amount || 0
          );
        }
      } else {
        if (currentMinerId) {
          res = await FIL_contract.onRepayFromWallet(
            currentMinerId,
            repayAll ? maxNum : amount || 0
          );
        }
      }
      if (res) {
        handleCancel();
        api.success({
          message: "successfully repayed",
          placement: "bottomRight",
        });
      }
    } finally {
      setSendLoading(false);
    }
  };

  const onTabChange = (tabKey: string) => {
    setTabKey(tabKey);
    clear();
  };

  const clear = () => {
    setAmount(undefined);
    setMinerFrom(undefined);
  };

  const handleChange = (value: string) => {
    setMinerFrom(value);
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
  }, [hideTabs, currentMinerId]);

  return (
    <Modal
      className="custom-modal"
      title=""
      open={isOpen}
      width={600}
      onCancel={handleCancel}
      cancelButtonProps={{
        size: "large",
      }}
      onOk={handleConfirm}
      okText={title === "Liquidate" ? "Confirm" : "Repay"}
      okButtonProps={{
        size: "large",
        loading: sendLoading,
      }}
    >
      <div className="text-xl font-bold my-4">{title}</div>
      {!hideTabs && (
        <Tabs className="mb-4" tabs={REPAY_TAB_KEYS} onChange={onTabChange} />
      )}
      {tabKey === REPAY_TAB_KEYS[0] ? (
        <>
          <p className="text-lg font-semibold my-2">
            {isIndent(rawData?.familyInfo?.user || "")}
          </p>
          <Table
            className="[& .ant-table-thead > tr > th]:border-b-0"
            columns={columns}
            dataSource={list}
            pagination={false}
            rowKey="minerId"
          />
          <div className="my-8 flex">
            <div>
              <label className="block">From</label>
              <Select
                className="mr-12"
                style={{ width: 250 }}
                value={minerFrom}
                onChange={handleChange}
                options={options}
              />
            </div>
            <div>
              <label className="block">To</label>
              <Select
                disabled
                defaultValue={currentMinerId}
                style={{ width: 250 }}
                options={options}
              />
            </div>
          </div>
          <NumberInput
            label="Amount"
            value={amount}
            prefix="FIL"
            min={1}
            max={maxNum}
            // maxButton
            // onMaxButtonClick={onMaxButtonClick}
            repayAll
            onChange={handleNumberInputChange}
          />
        </>
      ) : (
        <>
          {/* to do: network */}
          <p className="text-lg font-semibold my-2">{`Miner ID: t0${currentMinerId}`}</p>
          <div className="flex flex-wrap">
            {/* <div className="w-1/2">{`Family Available Credit: ${
              rawData?.familyInfo.availableCredit || DEFAULT_EMPTY
            } FIL`}</div> */}
            <div className="w-1/2">{`Debt Outstanding: ${
              rawData?.miner?.debtOutStanding || DEFAULT_EMPTY
            } FIL`}</div>
          </div>
          <div className="mt-5">
            <NumberInput
              label="Amount"
              value={amount}
              prefix="FIL"
              max={maxNum}
              // maxButton
              // onMaxButtonClick={onMaxButtonClick}
              repayAll
              onChange={handleNumberInputChange}
            />
          </div>
        </>
      )}
      {contextHolder}
    </Modal>
  );
}

export default RepayModal;
