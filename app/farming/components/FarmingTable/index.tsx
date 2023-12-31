"use client";

import { heightToDate } from "@/utils";
import { rootState } from "@/store/type";
import { shallowEqual, useSelector } from "react-redux";
import { Table, Space, Button, notification, Tag } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import stake_contract from "@/server/stake";
import type { ColumnsType } from "antd/es/table";
import store from "@/store";
import ConfirmModal from "@/components/ConfirmModal";
import { ReloadOutlined } from "@ant-design/icons";
import { useMetaMask } from "@/hooks/useMetaMask";
import useLoading from "@/hooks/useLoading";
import Card from "@/packages/card";
import { fetchChartAndPanelData } from "@/app/api/common";

interface Props {}

interface DataType {
  [key: string]: any;
}

const defaultPageNum = 6;

function StakingCard(props: Props) {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState<boolean>(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);

  const [list, setList] = useState<DataType[]>([]);
  const [listLoading, setListLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const [selectedRow, setSelectedRow] = useState<any>();

  const [expectedRewards, setExpectedRewards] = useState<any>("");
  const [rewards, setRewards] = useState<any>("");

  const [api, contextHolder] = notification.useNotification();

  const { currentAccount, wallet, isNetworkCorrect } = useMetaMask();
  const network = wallet?.chainId?.includes("0x1") ? "main" : "test";

  const { loading, setLoading } = useLoading();

  const { refreshStakeData } = useSelector(
    (state: rootState) => state?.commonStore,
    shallowEqual
  );

  const { panel } = useSelector((state: rootState) => state?.panel);

  const getList = async () => {
    if (!isNetworkCorrect) return;
    const staker = currentAccount || "";
    if (staker) {
      setListLoading(true);
      try {
        const data: any = await stake_contract.getStakesFromStaker(staker);
        setList(data);
      } finally {
        setListLoading(false);
      }
    }
  };

  const onWithdrawBtnClick = async (row: any) => {
    const staker = currentAccount || "";
    setSelectedRow(row);
    onConfirmOpen();
    const res = await stake_contract.onExpectedRewardsFromVariableTerm(
      row.id,
      staker
    );
    if (res) {
      setExpectedRewards(res);
    }
  };

  const onWithdraw = async () => {
    const staker = currentAccount || "";
    setLoading(true);
    try {
      const res: any = await stake_contract.onUnstake(selectedRow?.id, staker);
      if (res) {
        if (res?.message) {
          api.error({
            message: res?.message,
            placement: "top",
          });
        } else {
          setRewards(res?.amount || 0);
          onConfirmClose();
          onFeedbackOpen();
          refresh();
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<DataType> = [
    {
      title: "Id",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
    },
    {
      title: "Start Date",
      dataIndex: "start",
      key: "start",
      render: (val, row) => heightToDate(Number(val), network),
    },
    {
      title: "Maturity Date",
      key: "end",
      dataIndex: "end",
      render: (val, row) => heightToDate(Number(val), network),
    },
    {
      title: "Status",
      key: "action",
      render: (_, row) =>
        row?.canWithdraw ? (
          <Space size="middle">
            <Button
              type="primary"
              className="text-sm"
              onClick={() => onWithdrawBtnClick(row)}
            >
              Withdraw
            </Button>
          </Space>
        ) : (
          <Tag bordered={false} color="volcano">
            Locked
          </Tag>
        ),
    },
  ];

  const onFeedbackOpen = () => {
    setIsFeedbackOpen(true);
  };

  const onFeedbackClose = () => {
    setIsFeedbackOpen(false);
  };

  const onConfirmOpen = () => {
    setIsConfirmOpen(true);
  };

  const onConfirmClose = () => {
    setIsConfirmOpen(false);
    setLoading(false);
    setExpectedRewards("");
  };

  const onTableChange = (pageNum: any) => {
    setCurrentPage(pageNum);
  };

  const refresh = () => {
    store.dispatch({
      type: "common/change",
      payload: { refreshStakeData: true, refreshAllData: true },
    });
  };

  useEffect(() => {
    getList();
    fetchChartAndPanelData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAccount]);

  useEffect(() => {
    if (refreshStakeData) {
      getList();
      store.dispatch({
        type: "common/change",
        payload: { refreshStakeData: false },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshStakeData]);

  return (
    <div className="relative">
      <Card className="!p-[10px]">
        <div className="flex justify-end mb-2">
          <Button className="!flex items-center" type="text" onClick={refresh}>
            Refresh list
            <ReloadOutlined />
          </Button>
        </div>
        <Table
          columns={columns}
          dataSource={list}
          loading={{
            spinning: listLoading,
            indicator: <LoadingOutlined />,
          }}
          pagination={{
            pageSize: defaultPageNum,
            current: currentPage,
            total: list?.length,
            onChange: onTableChange,
          }}
        />
      </Card>

      {/* confirm modal */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        title="Are you sure to withdraw now?"
        desc={
          <>
            Expected FIG rewards from this Variable-term Farm:
            <p>{`${expectedRewards || "calculating..."} FIG`}</p>
          </>
        }
        loading={loading}
        onCancel={onConfirmClose}
        onConfirm={onWithdraw}
      />
      {/* feedback modal */}
      <ConfirmModal
        isOpen={isFeedbackOpen}
        type="success"
        title="Successfully Withdrawn"
        desc={`You received ${rewards || 0} FIG`}
        onConfirm={onFeedbackClose}
        onCancel={onFeedbackClose}
      />
      {contextHolder}
    </div>
  );
}

export default StakingCard;
