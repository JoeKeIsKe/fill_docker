"use client";

import type { TableColumnsType } from "antd";
import { Table, Button } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { getValueDivide } from "@/utils";
import { UserBorrow, MinerBorrows, MinerDetailItem } from "@/utils/type";
import BigNumber from "bignumber.js";
import { useMetaMask } from "@/hooks/useMetaMask";

interface ExpandedDataType extends MinerDetailItem {}

interface IProps {
  rawData?: MinerBorrows | null;
  refresh?: () => void;
}

function MinerDetailTable(props: IProps) {
  const { rawData, refresh } = props;
  const { wallet } = useMetaMask();
  const network = wallet?.chainId?.includes("0x1") ? "f0" : "t0";

  const handleRefreshList = () => {
    if (refresh) [refresh()];
  };

  const expandedRowRender = () => {
    const columns: TableColumnsType<ExpandedDataType> = [
      {
        title: "Credit ID",
        dataIndex: "id",
        key: "id",
        render: (val) => `${val}`,
      },
      {
        title: "Interest Rate",
        dataIndex: "interestRate",
        key: "interestRate",
        render: (val) => `${val} %`,
      },
      {
        title: "Principal",
        dataIndex: "remainingOriginalAmount",
        key: "remainingOriginalAmount",
        render: (val) => `${val} FIL`,
      },
      {
        title: "Interest",
        dataIndex: "interest",
        key: "interest",
        render: (val) => `${val} FIL`,
      },
      {
        title: "Total",
        dataIndex: "borrowAmount",
        key: "borrowAmount",
        render: (val, row) =>
          `${BigNumber(val).plus(
            BigNumber(row.interest).toNumber().toFixed(6)
          )} FIL`,
      },
    ];

    const data: MinerDetailItem[] | [] =
      rawData?.borrows?.map((item) => ({
        id: item.borrow.id,
        interest: getValueDivide(item.interest, 18, 6),
        borrowAmount: getValueDivide(item.borrow.borrowAmount, 18, 6),
        interestRate: getValueDivide(
          Number(item.borrow.interestRate) * 100,
          6,
          2
        ),
        remainingOriginalAmount: getValueDivide(
          item.borrow.remainingOriginalAmount,
          18,
          6
        ),
      })) || [];

    return (
      <Table
        columns={columns}
        dataSource={data}
        pagination={false}
        rowKey="id"
      />
    );
  };

  const columns: TableColumnsType<UserBorrow> = [
    {
      title: "Miner ID",
      dataIndex: "minerId",
      key: "minerId",
      render: (val, row) => `${network}${val}`,
    },
    {
      title: "Debt Outstanding",
      dataIndex: "debtOutStanding",
      key: "debtOutStanding",
      render: (val, row) => `${val} FIL`,
    },
    {
      title: "Lines of Credit",
      dataIndex: "borrows",
      key: "borrows",
      render: (val, row) => val?.length || 0,
    },
  ];

  const data: any = [rawData];

  const hasPagination = false;

  return (
    <div className="relative">
      <Button
        className="flex items-center absolute -top-[40px] right-[20px] z-1"
        type="text"
        onClick={handleRefreshList}
      >
        Refresh list
        <ReloadOutlined />
      </Button>
      {rawData?.minerId && (
        <Table
          columns={columns}
          expandable={{
            expandedRowRender,
            defaultExpandedRowKeys: [rawData?.minerId || ""],
          }}
          dataSource={data}
          pagination={hasPagination}
          rowKey="minerId"
        />
      )}
    </div>
  );
}

export default MinerDetailTable;
