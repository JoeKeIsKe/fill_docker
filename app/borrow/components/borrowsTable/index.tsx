"use client";

import { useEffect, useState } from "react";
import type { TableColumnsType } from "antd";
import { Space, Table, Button } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import BorrowModal from "../borrowModal";
import RepayModal from "../repayModal";
import { DEFAULT_EMPTY, REPAY_MODAL_TITLE } from "../constans";
import FIL_contract from "@/server/FILLiquid_contract";
import { useMetaMask } from "@/hooks/useMetaMask";
import { useSelector } from "react-redux";
import { rootState } from "@/store/type";
import { isIndent } from "@/utils";
import store from "@/store";
import {
  MinerListItem,
  BorrowModalData,
  UserBorrow,
  RepayModalData,
} from "@/utils/type";
import Link from "next/link";

interface ExpandedDataType extends MinerListItem {}

interface IProps {
  type?: string;
}

function BorrowsTable(props: IProps) {
  const { type } = props;
  const isMyFamily = type === "my";

  const { currentAccount } = useMetaMask();

  const [isBorrowModalOpen, setIsBorrowModalOpen] = useState<boolean>(false);
  const [isRepayModalOpen, setIsRepayModalOpen] = useState<boolean>(false);
  const [selectedMiner, setSelectedMiner] = useState<MinerListItem | null>(
    null
  );
  const [repayModalTitle, setRepayModalTitle] = useState<string>(
    REPAY_MODAL_TITLE[2]
  );

  const userBorrow = useSelector(
    (state: rootState) => state?.contract?.userBorrow
  );

  console.log("userBorrow ==> ", userBorrow);

  const expandedRowRender = () => {
    const columns: TableColumnsType<ExpandedDataType> = [
      // {
      //   title: "Miner",
      //   dataIndex: "miner",
      //   key: "miner",
      // },
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
        ), // to do: change the netwrok
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
      },
      {
        title: "Action",
        key: "operation",
        render: (val, row) =>
          isMyFamily ? (
            <Space size="middle" className="text-[#0093E9]">
              <a onClick={() => onBorrowClick(row)}>Borrow</a>
              {row.haveCollateralizing && (
                <a onClick={() => onRepayOrLiquidateClick(row, 1)}>Repay</a>
              )}
              <a>Unbind</a>
            </Space>
          ) : (
            <a
              className="text-[#0093E9]"
              onClick={() => onRepayOrLiquidateClick(row, 3)}
            >
              Repay for others
            </a>
          ),
      },
    ];

    const data: MinerListItem[] = isMyFamily
      ? userBorrow?.minerBorrowInfo || []
      : [];
    console.log("expanded data  ==> ", data);

    return (
      <Table
        columns={columns}
        dataSource={data}
        pagination={false}
        rowKey="minerId"
      />
    );
  };

  const columns: TableColumnsType<UserBorrow> = [
    // { title: "Family", dataIndex: "family", key: "family" },
    {
      title: "Family Address",
      dataIndex: "user",
      key: "user",
      render: (val) => isIndent(val),
    },
    {
      title: "Debt Outstanding",
      dataIndex: "debtOutStanding",
      key: "debtOutStanding",
      render: (val) => `${val} FIL`,
    },
    {
      title: "Available Credit",
      dataIndex: "availableCredit",
      key: "availableCredit",
      render: (val) => `${val} FIL`,
    },
    {
      title: "D/A ratio(%)",
      dataIndex: "liquidateConditionInfo",
      key: "ratio",
      render: (val) => val?.rate,
    },
  ];

  if (!isMyFamily) {
    columns.push({
      title: "Action",
      key: "action",
      render: (val, row) => (
        <a
          className="text-[#0093E9]"
          onClick={() => onRepayOrLiquidateClick(null, 2)}
        >
          Liquidate
        </a>
      ),
    });
  }

  const data = isMyFamily && userBorrow ? [userBorrow] : [];
  const minerBorrowInfo: BorrowModalData = {
    minerId: selectedMiner?.minerId || "",
    familyInfo: {
      user: userBorrow?.user || "",
      debtOutstanding: userBorrow?.debtOutStanding || DEFAULT_EMPTY,
      availableCredit: userBorrow?.availableCredit || DEFAULT_EMPTY,
      ratio: userBorrow?.liquidateConditionInfo?.rate || DEFAULT_EMPTY,
    },
  };
  const minerRepayInfo: RepayModalData = {
    familyInfo: {
      user: userBorrow?.user || "",
      availableCredit: userBorrow?.availableCredit || DEFAULT_EMPTY,
    },
    miner: selectedMiner,
    minerList: userBorrow?.minerBorrowInfo || [],
  };

  const hasPagination = isMyFamily ? false : {};

  const onBorrowClick = (miner: MinerListItem) => {
    setSelectedMiner(miner);
    setIsBorrowModalOpen(true);
  };

  const onRepayOrLiquidateClick = (
    miner: MinerListItem | null,
    type: 1 | 2 | 3
  ) => {
    setSelectedMiner(miner);
    setRepayModalTitle(REPAY_MODAL_TITLE[type]);
    setIsRepayModalOpen(true);
  };

  const getUserBorrow = () => {
    if (currentAccount) {
      FIL_contract.getUserBorrow(currentAccount);
      store.dispatch({
        type: "common/change",
        payload: { refreshAllData: true },
      });
    }
  };

  useEffect(() => {
    getUserBorrow();
  }, [currentAccount]);

  return (
    <div className="relative">
      <Button
        className="flex items-center absolute -top-[40px] right-[20px] z-1"
        type="text"
        onClick={getUserBorrow}
      >
        Refresh list
        <ReloadOutlined />
      </Button>
      {userBorrow?.user && (
        <Table
          columns={columns}
          expandable={{
            expandedRowRender,
            defaultExpandedRowKeys: [userBorrow?.user || ""],
          }}
          dataSource={data}
          pagination={hasPagination}
          rowKey="user"
        />
      )}

      <BorrowModal
        isOpen={isBorrowModalOpen}
        data={minerBorrowInfo}
        onCancel={() => setIsBorrowModalOpen(false)}
      />
      <RepayModal
        isOpen={isRepayModalOpen}
        title={repayModalTitle}
        rawData={minerRepayInfo}
        hideTabs={repayModalTitle !== "Repay"}
        onCancel={() => setIsRepayModalOpen(false)}
      />
    </div>
  );
}

export default BorrowsTable;
