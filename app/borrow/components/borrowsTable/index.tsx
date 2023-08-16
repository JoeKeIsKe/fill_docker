"use client";

import { useState } from "react";
import type { TableColumnsType } from "antd";
import { Badge, Space, Table, Input, Button } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import BorrowModal from "../borrowModal";
import RepayModal from "../repayModal";
import { REPAY_MODAL_TITLE } from "../constans";

interface DataType {
  key: React.Key;
  family: string;
  address: string;
  debtOutstanding: string;
  availableCredit: number;
  ratio: string;
}

interface ExpandedDataType {
  key: React.Key;
  name: string;
  id: string;
  outstanding: string;
  num: number;
}

interface IProps {
  type?: string;
}

function BorrowsTable(props: IProps) {
  const { type } = props;

  const isMyFamily = type === "my";

  const [isBorrowModalOpen, setIsBorrowModalOpen] = useState<boolean>(false);
  const [isRepayModalOpen, setIsRepayModalOpen] = useState<boolean>(false);
  const [repayModalTitle, setRepayModalTitle] = useState<string>(
    REPAY_MODAL_TITLE[2]
  );

  const expandedRowRender = () => {
    const columns: TableColumnsType<ExpandedDataType> = [
      { title: "Miner", dataIndex: "name", key: "name" },
      { title: "Miner ID", dataIndex: "id", key: "id" },
      {
        title: "Debt Outstanding",
        dataIndex: "outstanding",
        key: "outstanding",
        render: () => <Badge status="success" text="Finished" />,
      },
      { title: "Lines of Credit", dataIndex: "num", key: "num" },
      {
        title: "Action",
        dataIndex: "operation",
        key: "operation",
        render: () =>
          isMyFamily ? (
            <Space size="middle" className="text-[#0093E9]">
              <a onClick={onBorrowClick}>Borrow</a>
              <a onClick={() => onRepayOrLiquidateClick(1)}>Repay</a>
              <a>Unbind</a>
            </Space>
          ) : (
            <a
              className="text-[#0093E9]"
              onClick={() => onRepayOrLiquidateClick(3)}
            >
              Repay for others
            </a>
          ),
      },
    ];

    const data = [];
    for (let i = 0; i < 3; ++i) {
      data.push({
        key: i.toString(),
        id: "2014-12-24 23:12:00",
        name: "This is production name",
        num: i,
        outstanding: "123",
      });
    }

    return <Table columns={columns} dataSource={data} pagination={false} />;
  };

  const columns: TableColumnsType<DataType> = [
    { title: "Family", dataIndex: "family", key: "family" },
    { title: "Address", dataIndex: "address", key: "address" },
    {
      title: "Debt Outstanding",
      dataIndex: "debtOutstanding",
      key: "debtOutstanding",
    },
    {
      title: "Available Credit",
      dataIndex: "availableCredit",
      key: "availableCredit",
    },
    { title: "D/A ratio(%)", dataIndex: "ratio", key: "ratio" },
  ];

  if (!isMyFamily) {
    columns.push({
      title: "Action",
      key: "operation",
      render: () => (
        <a
          className="text-[#0093E9]"
          onClick={() => onRepayOrLiquidateClick(2)}
        >
          Liquidate
        </a>
      ),
    });
  }

  const data: DataType[] = [];
  if (isMyFamily) {
    for (let i = 0; i < 1; ++i) {
      data.push({
        key: i.toString(),
        family: "Screen",
        address: "iOS",
        debtOutstanding: "10.3.4.5654",
        availableCredit: 500,
        ratio: "Jack",
      });
    }
  } else {
    for (let i = 0; i < 3; ++i) {
      data.push({
        key: i.toString(),
        family: "Screen",
        address: "iOS",
        debtOutstanding: "10.3.4.5654",
        availableCredit: 500,
        ratio: "Jack",
      });
    }
  }

  const onSearch = () => {};

  const onBorrowClick = () => {
    setIsBorrowModalOpen(true);
  };

  const onRepayOrLiquidateClick = (type: 1 | 2 | 3) => {
    setRepayModalTitle(REPAY_MODAL_TITLE[type]);
    setIsRepayModalOpen(true);
  };

  return (
    <div className="relative">
      <Button
        className="flex items-center absolute -top-[40px] right-[20px] z-1"
        type="text"
        onClick={() => {}}
      >
        Refresh list
        <ReloadOutlined />
      </Button>
      <Table
        columns={columns}
        expandable={{ expandedRowRender, defaultExpandedRowKeys: ["0"] }}
        dataSource={data}
        pagination={isMyFamily ? false : {}}
      />

      <BorrowModal
        isOpen={isBorrowModalOpen}
        onCancel={() => setIsBorrowModalOpen(false)}
      />
      <RepayModal
        isOpen={isRepayModalOpen}
        title={repayModalTitle}
        hideTabs={repayModalTitle !== "Repay"}
        onCancel={() => setIsRepayModalOpen(false)}
      />
    </div>
  );
}

export default BorrowsTable;
