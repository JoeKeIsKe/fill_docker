"use client";

import { Modal, Divider, Table, Select } from "antd";
import { ReactNode, useEffect, useState } from "react";
import NumberInput from "@/packages/NumberInput";
import DescRow from "@/packages/DescRow";
import Tabs from "@/packages/Tabs";
import type { ColumnsType } from "antd/es/table";
import { REPAY_MODAL_TITLE, REPAY_TAB_KEYS } from "../constans";

interface IProps {
  isOpen?: boolean;
  title?: string;
  desc?: string | ReactNode;
  loading?: boolean;
  hideTabs?: boolean;
  onCancel?: () => void;
  onConfirm?: () => void;
}

interface DataType {
  key: string;
  name: string;
  age: number;
  address: string;
}

function BorrowModal(props: IProps) {
  const {
    isOpen = true,
    title = "Repay",
    loading,
    // type,
    hideTabs = false,
    onCancel,
    onConfirm,
  } = props;

  const [amount, setAmount] = useState<number | null>();
  const [slippage, setSlippage] = useState();
  const [tabKey, setTabKey] = useState<string | null>(REPAY_TAB_KEYS[0]);

  const columns: ColumnsType<DataType> = [
    {
      title: "",
      dataIndex: "name",
      key: "name",
      render: (text) => <a>{text}</a>,
    },
    {
      title: "Credit Outstanding",
      dataIndex: "age",
      key: "age",
    },
    {
      title: "Available Balance",
      dataIndex: "address",
      key: "address",
    },
  ];

  const data: DataType[] = [
    {
      key: "1",
      name: "John Brown",
      age: 32,
      address: "New York No. 1 Lake Park",
    },
    {
      key: "2",
      name: "Jim Green",
      age: 42,
      address: "London No. 1 Lake Park",
    },
    {
      key: "3",
      name: "Joe Black",
      age: 32,
      address: "Sydney No. 1 Lake Park",
    },
  ];

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
  };

  const onTabChange = (tabKey: string) => {
    setTabKey(tabKey);
    clear();
  };

  const clear = () => {
    setAmount(undefined);
    setSlippage(undefined);
  };

  const handleChange = () => {};

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
        loading,
      }}
    >
      <div className="text-xl font-bold my-4">{title}</div>
      {!hideTabs && (
        <Tabs className="mb-4" tabs={REPAY_TAB_KEYS} onChange={onTabChange} />
      )}
      {tabKey === REPAY_TAB_KEYS[0] ? (
        <>
          <p className="text-lg font-semibold my-2">Family Addr.</p>
          <Table
            className="[& .ant-table-thead > tr > th]:border-b-0"
            columns={columns}
            dataSource={data}
            pagination={false}
          />
          <div className="my-8 flex">
            <div>
              <label className="block">From</label>
              <Select
                className="mr-10"
                defaultValue="lucy"
                style={{ width: 250 }}
                onChange={handleChange}
                options={[
                  { value: "jack", label: "Jack" },
                  { value: "lucy", label: "Lucy" },
                  { value: "Yiminghe", label: "yiminghe" },
                  { value: "disabled", label: "Disabled", disabled: true },
                ]}
              />
            </div>
            <div>
              <label className="block">To</label>
              <Select
                defaultValue="lucy"
                style={{ width: 250 }}
                onChange={handleChange}
                options={[
                  { value: "jack", label: "Jack" },
                  { value: "lucy", label: "Lucy" },
                  { value: "Yiminghe", label: "yiminghe" },
                  { value: "disabled", label: "Disabled", disabled: true },
                ]}
              />
            </div>
          </div>
        </>
      ) : (
        <>
          <p className="text-lg font-semibold my-2">Miner ID</p>
          <div className="flex flex-wrap">
            <div className="w-1/2">Family Available Credit: 23,000</div>
          </div>
          <div className="mt-5">
            <NumberInput
              label="Amount"
              value={amount}
              prefix="FIL"
              maxButton
              onChange={(val) => setAmount(val)}
            />
          </div>
        </>
      )}
    </Modal>
  );
}

export default BorrowModal;
