"use client";

import { useEffect, useMemo, useState } from "react";
import type { TableColumnsType, TablePaginationConfig } from "antd";
import { Space, Table, Button } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import BorrowModal from "../borrowModal";
import RepayModal from "../repayModal";
import { DEFAULT_EMPTY, REPAY_MODAL_TITLE } from "../constans";
import FIL_contract from "@/server/FILLiquid_contract";
import data_fetcher_contract from "@/server/data_fetcher";
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
import UnbindMiner from "../../../certified/unbindMiner";
import { getBorrowingsFamily } from "../../../api/modules/index";
import ActionButton from "@/packages/ActionButton";
import { useDebounce } from "use-debounce";

interface ExpandedDataType extends MinerListItem {}

interface IProps {
  type?: string;
  searchText?: string | null;
}

const PAGE_SIZE = 10;

function BorrowsTable(props: IProps) {
  const { type, searchText } = props;
  const isMyFamily = type === "my";
  const [debouncedSearchText] = useDebounce(searchText, 600);

  const { currentAccount, wallet, isNetworkCorrect } = useMetaMask();
  const network = wallet?.chainId?.includes("0x1") ? "f0" : "t0";

  const [isBorrowModalOpen, setIsBorrowModalOpen] = useState<boolean>(false);
  const [isRepayModalOpen, setIsRepayModalOpen] = useState<boolean>(false);
  const [pageIndex, setPageIndex] = useState(1);
  const [familyCountRaw, setFamilyCountRaw] = useState<string[] | []>([]);
  const familyCount = useMemo(() => {
    return familyCountRaw.slice(
      (pageIndex - 1) * PAGE_SIZE,
      pageIndex * PAGE_SIZE
    );
  }, [familyCountRaw, pageIndex]);

  const [familyBorrows, setFamilyBorrows] = useState<UserBorrow[] | []>([]);
  const [selectedMiner, setSelectedMiner] = useState<MinerListItem | null>(
    null
  );
  const [selectedFamily, setSelectedFamily] = useState<UserBorrow | null>(null);
  const [repayModalTitle, setRepayModalTitle] = useState<string>(
    REPAY_MODAL_TITLE[1]
  );

  const userBorrow = useSelector(
    (state: rootState) => state?.contract?.userBorrow
  );

  const expandedRowRender = (record: UserBorrow) => {
    const columns: TableColumnsType<ExpandedDataType> = [
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
        title: "Actions",
        key: "operation",
        render: (val, row) =>
          isMyFamily ? (
            <Space size="middle" className="text-[#0093E9]">
              <ActionButton
                name="Borrow"
                disabled={
                  Number(row?.borrows) >= 5 ||
                  Number(record.availableCredit) <= 0
                }
                onClick={() => onBorrowClick(row)}
              />
              {row.borrows ? (
                <ActionButton
                  name="Repay"
                  onClick={() => {
                    setRepayModalTitle(REPAY_MODAL_TITLE[1]);
                    onRepayClick(row, 1);
                  }}
                />
              ) : null}
              <UnbindMiner
                minerId={row.minerId}
                disabled={Boolean(row.borrows)}
              />
            </Space>
          ) : (
            <ActionButton
              name="Repay for miner"
              disabled={Number(row?.borrows) <= 0}
              onClick={() => onRepayClick(row, 3)}
            />
          ),
      },
    ];

    const data: MinerListItem[] = isMyFamily
      ? userBorrow?.minerBorrowInfo || []
      : familyBorrows.find((item) => item.user === record.user)
          ?.minerBorrowInfo || [];

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
      title: "Actions",
      key: "action",
      render: (val, row) => (
        <ActionButton
          name="Liquidate"
          disabled={!row.liquidateConditionInfo.liquidatable}
          onClick={() => onLiquidateClick(row)}
        />
      ),
    });
  }

  const data = isMyFamily && userBorrow ? [userBorrow] : familyBorrows;
  const minerBorrowInfo: BorrowModalData = {
    minerId: selectedMiner?.minerId || "",
    familyInfo: {
      user: userBorrow?.user || "",
      debtOutstanding: userBorrow?.debtOutStanding || DEFAULT_EMPTY,
      availableCredit: userBorrow?.availableCredit || DEFAULT_EMPTY,
      ratio: userBorrow?.liquidateConditionInfo?.rate || DEFAULT_EMPTY,
    },
  };
  const minerRepayInfo: RepayModalData =
    repayModalTitle === REPAY_MODAL_TITLE[2]
      ? {
          familyInfo: {
            user: selectedFamily?.user || "",
            availableCredit: selectedFamily?.availableCredit || DEFAULT_EMPTY,
            liquidateConditionInfo: selectedFamily?.liquidateConditionInfo,
          },
          minerList: selectedFamily?.minerBorrowInfo || [],
        }
      : {
          familyInfo: {
            user: userBorrow?.user || "",
            availableCredit: userBorrow?.availableCredit || DEFAULT_EMPTY,
            liquidateConditionInfo: userBorrow?.liquidateConditionInfo,
          },
          miner: selectedMiner,
          minerList: userBorrow?.minerBorrowInfo || [],
        };

  const hasPagination = isMyFamily
    ? false
    : {
        current: pageIndex,
        pageSize: PAGE_SIZE,
        total: familyCountRaw?.length,
      };

  const onBorrowClick = (miner: MinerListItem) => {
    setSelectedMiner(miner);
    setIsBorrowModalOpen(true);
  };

  const onRepayClick = (miner: MinerListItem | null, type: 1 | 3) => {
    setSelectedMiner(miner);
    setRepayModalTitle(REPAY_MODAL_TITLE[type]);
    setIsRepayModalOpen(true);
  };

  const onLiquidateClick = (family: UserBorrow) => {
    setSelectedFamily(family);
    setRepayModalTitle(REPAY_MODAL_TITLE[2]); // Liquidate
    setIsRepayModalOpen(true);
  };

  const getUserBorrow = (refresh?: boolean) => {
    if (currentAccount) {
      FIL_contract.getUserBorrow(currentAccount);
      if (refresh) {
        store.dispatch({
          type: "common/change",
          payload: { refreshAllData: true },
        });
      }
    }
  };

  const getFamilyCount = async () => {
    if (!isMyFamily && currentAccount) {
      const res: any = await getBorrowingsFamily();
      setFamilyCountRaw(
        res._data.filter(
          (item: string) =>
            item?.toLocaleLowerCase() !== currentAccount.toLocaleLowerCase()
        ) || []
      );
    }
  };

  const getFamilyBorrows = async () => {
    if (!isMyFamily) {
      const list: any = await data_fetcher_contract.getBatchedFamily(
        familyCount
      );
      setFamilyBorrows(list);
    }
  };

  const getData = (refresh?: boolean) => {
    if (!isNetworkCorrect) return;
    getUserBorrow(refresh);
    getFamilyBorrows();
  };

  const handleTableChange = (page: TablePaginationConfig) => {
    setPageIndex(page.current || 1);
  };

  const handleSearch = async () => {
    setPageIndex(1);
    if (
      searchText &&
      (searchText.includes("t0") || searchText.includes("f0"))
    ) {
      const address: any = await FIL_contract.getFamilyByMiner(
        searchText?.trim().replace("t0", "").replace("f0", "")
      );
      const list = familyCountRaw.filter((item) =>
        item.toLocaleLowerCase().includes(address?.toLocaleLowerCase())
      );
      return setFamilyCountRaw(list);
    }
    if (searchText) {
      const list = familyCountRaw.filter((item) => item.includes(searchText));
      setFamilyCountRaw(list);
    }
    if (!searchText) {
      getFamilyCount();
    }
  };

  useEffect(() => {
    getUserBorrow();
  }, [currentAccount]);

  useEffect(() => {
    getFamilyBorrows();
  }, [familyCount]);

  useEffect(() => {
    getFamilyCount();
  }, [currentAccount]);

  useEffect(() => {
    if (!isMyFamily) {
      handleSearch();
    }
  }, [debouncedSearchText]);

  return (
    <div className="relative mt-[50px] md:mt-0">
      <Button
        className="flex items-center absolute -top-[40px] right-[0px] z-1"
        type="text"
        onClick={() => getData(true)}
      >
        Refresh list
        <ReloadOutlined />
      </Button>
      {((isMyFamily && userBorrow?.user) || !isMyFamily) && (
        <Table
          columns={columns}
          expandable={{
            expandedRowRender,
            defaultExpandedRowKeys: [userBorrow?.user || ""],
          }}
          dataSource={data}
          pagination={hasPagination}
          rowKey="user"
          onChange={handleTableChange}
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
        hideTabs={repayModalTitle !== REPAY_MODAL_TITLE[1]}
        onCancel={() => setIsRepayModalOpen(false)}
      />
    </div>
  );
}

export default BorrowsTable;
