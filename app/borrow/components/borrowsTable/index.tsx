"use client";

import { useEffect, useMemo, useState } from "react";
import type { TableColumnsType, TablePaginationConfig } from "antd";
import { Space, Table, Button } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import BorrowModal from "../BorrowModal";
import RepayModal from "../RepayModal";
import { DEFAULT_EMPTY, REPAY_MODAL_TITLE } from "../constans";
import FIL_contract from "@/server/FILLiquid_contract";
import data_fetcher_contract from "@/server/data_fetcher";
import { useMetaMask } from "@/hooks/useMetaMask";
import { useSelector } from "react-redux";
import { rootState } from "@/store/type";
import {
  isIndent,
  numberWithCommas,
  getValueDivide,
  formatUnits,
} from "@/utils";
import store from "@/store";
import {
  MinerListItem,
  BorrowModalData,
  UserBorrow,
  RepayModalData,
} from "@/utils/type";
import Link from "next/link";
import UnbindMiner from "../../../certified/unbindMiner";
import { getBorrowFamilies } from "../../../api/modules/index";
import ActionButton from "@/packages/ActionButton";
import { useDebounce } from "use-debounce";
import InfoTips from "@/components/InfoTips";
import { LoadingOutlined } from "@ant-design/icons";

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

  const [loading, setLoading] = useState(false);

  const { currentAccount, wallet, isNetworkCorrect } = useMetaMask();
  const network = wallet?.chainId?.includes("0x1") ? "f0" : "t0";

  const [isBorrowModalOpen, setIsBorrowModalOpen] = useState<boolean>(false);
  const [isRepayModalOpen, setIsRepayModalOpen] = useState<boolean>(false);
  const [pageIndex, setPageIndex] = useState(1);

  const [familyBorrows, setFamilyBorrows] = useState<UserBorrow[] | []>([]);
  const [selectedMiner, setSelectedMiner] = useState<MinerListItem | null>(
    null
  );
  const [selectedFamily, setSelectedFamily] = useState<UserBorrow | null>(null);
  const [repayModalTitle, setRepayModalTitle] = useState<string>(
    REPAY_MODAL_TITLE[1]
  );

  const { userBorrow, ownFamilyList } = useSelector(
    (state: rootState) => state?.contract
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
        render: (val, row) => `${numberWithCommas(val)} FIL`,
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
              <Space className="!text-[rgb(209,213,219)]">
                <ActionButton
                  name="Borrow"
                  disabled={!row.borrowable}
                  onClick={() => onBorrowClick(row)}
                />
                {!row.borrowable && (
                  <InfoTips type="small" content={row.reason} />
                )}
              </Space>
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
              name="Repay for this miner"
              disabled={Number(row?.borrows) <= 0 || !currentAccount}
              onClick={() => onRepayClick(row, 3)}
            />
          ),
      },
    ];

    const data: MinerListItem[] = isMyFamily
      ? ownFamilyList?.[0]?.minerBorrowInfo || []
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

  const getDebtRatioStyle = (rate: number) => {
    if (Number(rate) > 85)
      return {
        color: "#ff4d4f",
        fontWeight: 700,
      };
    if (Number(rate) > 75)
      return {
        color: "#faad14",
        fontWeight: 700,
      };
    return {};
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
      render: (val) => `${numberWithCommas(val)} FIL`,
    },
    {
      title: "Available Credit",
      dataIndex: "availableCredit",
      key: "availableCredit",
      render: (val) => `${numberWithCommas(val)} FIL`,
    },
    {
      title: (
        <Space size={[4, 4]}>
          Debt Ratio(%){" "}
          <InfoTips
            type="small"
            content="Debt-to-assets Ratio = Debt Outstanding / Total Account Balance"
          />
        </Space>
      ),
      dataIndex: "liquidateConditionInfo",
      key: "ratio",
      render: (val) => (
        <span style={getDebtRatioStyle(val?.rate)}>{val?.rate}</span>
      ),
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

  const familyList = useMemo(() => {
    const search = debouncedSearchText
      ?.toLocaleLowerCase()
      .trim()
      .replace("t0", "")
      .replace("f0", "");
    if (search) {
      return familyBorrows.filter((item) => {
        return (
          item.user.toLowerCase().includes(search) ||
          item.minerBorrowInfo?.some((i) => i.minerId.includes(search))
        );
      });
    }
    return familyBorrows;
  }, [familyBorrows, debouncedSearchText]);

  const data = isMyFamily && ownFamilyList ? ownFamilyList : familyList;

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
        total: familyBorrows?.length,
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
    if (refresh) {
      store.dispatch({
        type: "common/change",
        payload: { refreshAllData: true },
      });
    }
    if (currentAccount) {
      FIL_contract.getUserBorrow(currentAccount);
    }
  };

  const getOwnFamily = () => {
    if (currentAccount) {
      data_fetcher_contract.getOwnFamily(currentAccount);
    }
  };

  const getFamilyBorrows = async () => {
    if (!isMyFamily) {
      const res: any = await getBorrowFamilies();
      const l = res._data?.map((r: any) => {
        const list = r.MinerBorrowInfo?.map((item: any) => ({
          availableBalance: getValueDivide(
            item?.AvailableBalance?.Neg ? 0 : item?.AvailableBalance?.Value,
            18,
            2
          ),
          balance: formatUnits(item.Balance),
          borrowSum: formatUnits(item.BorrowSum),
          debtOutStanding: getValueDivide(Number(item.DebtOutStanding), 18, 2),
          haveCollateralizing: item.HaveCollateralizing,
          minerId: item.MinerId.toString(),
          borrows: item?.Borrows?.length,
        }));
        return {
          user: r.User,
          availableCredit: getValueDivide(Number(r.AvailableCredit), 18, 2),
          balanceSum: formatUnits(r.BalanceSum),
          borrowSum: formatUnits(r.BorrowSum),
          debtOutStanding: getValueDivide(Number(r.DebtOutStanding), 18, 2),
          liquidateConditionInfo: {
            rate: getValueDivide(
              Number(r.LiquidateConditionInfo?.Rate) * 100,
              6,
              2
            ),
            alertable: r.LiquidateConditionInfo?.Alertable,
            liquidatable: r.LiquidateConditionInfo?.Liquidatable,
          },
          minerBorrowInfo: list,
        };
      });
      setFamilyBorrows(
        l.filter(
          (item: UserBorrow) => item.user.toLowerCase() !== currentAccount
        )
      );
    }
  };

  const getData = async (refresh?: boolean) => {
    getUserBorrow(refresh);
    await getFamilyBorrows();
    if (!isNetworkCorrect) return;
    getOwnFamily();
  };

  const handleTableChange = (page: TablePaginationConfig) => {
    setPageIndex(page.current || 1);
  };

  useEffect(() => {
    getOwnFamily();
    getUserBorrow();
    getFamilyBorrows();
  }, [currentAccount]);

  useEffect(() => {
    setPageIndex(1);
  }, [debouncedSearchText]);

  const updateList = async () => {
    if (loading) return;
    try {
      setLoading(true);
      getData(true);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 2000);
    }
  };

  return (
    <div className="relative mt-[50px] md:mt-0">
      <Button
        className="flex items-center absolute -top-[40px] right-[0px] z-1"
        type="text"
        onClick={updateList}
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
          loading={{
            spinning: loading,
            indicator: <LoadingOutlined />,
          }}
          onChange={handleTableChange}
        />
      )}

      <BorrowModal
        isOpen={isBorrowModalOpen}
        data={minerBorrowInfo}
        updateList={updateList}
        onCancel={() => setIsBorrowModalOpen(false)}
      />
      <RepayModal
        isOpen={isRepayModalOpen}
        title={repayModalTitle}
        rawData={minerRepayInfo}
        hideTabs={repayModalTitle !== REPAY_MODAL_TITLE[1]}
        updateList={updateList}
        onCancel={() => setIsRepayModalOpen(false)}
      />
    </div>
  );
}

export default BorrowsTable;
