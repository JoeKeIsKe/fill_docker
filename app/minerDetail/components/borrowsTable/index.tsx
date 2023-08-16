"use client";

import { useState } from "react";
import type { TableColumnsType } from "antd";
import { Badge, Space, Table, Input } from "antd";
import Card from "@/packages/card";

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

  const expandedRowRender = () => {
    const columns: TableColumnsType<ExpandedDataType> = [
      { title: "Credit", dataIndex: "credit", key: "credit" },
      { title: "Credit ID", dataIndex: "id", key: "id" },
      {
        title: "Interest Rate",
        dataIndex: "rate",
        key: "rate",
        render: () => <Badge status="success" text="Finished" />,
      },
      { title: "Principal", dataIndex: "principal", key: "principal" },
      { title: "Interest", dataIndex: "interest", key: "interest" },
      { title: "Total", dataIndex: "total", key: "total" },
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
    { title: "Miner", dataIndex: "name", key: "name" },
    { title: "Miner ID", dataIndex: "id", key: "id" },
    {
      title: "Debt Outstanding",
      dataIndex: "outstanding",
      key: "outstanding",
      // render: () => <Badge status="success" text="Finished" />,
    },
    { title: "Lines of Credit", dataIndex: "num", key: "num" },
  ];

  const data: DataType[] = [];
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

  return (
    <>
      <Card>
        <Table
          columns={columns}
          expandable={{ expandedRowRender, defaultExpandedRowKeys: ["0"] }}
          dataSource={data}
          pagination={false}
        />
      </Card>
    </>
  );
}

export default BorrowsTable;
