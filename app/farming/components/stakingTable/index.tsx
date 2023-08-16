"use client";

import { heightToDate } from "@/utils";
import { rootState } from "@/store/type";
import { shallowEqual, useSelector } from "react-redux";
import { Table, Space, Button, notification } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import stake_contract from "@/server/stake";
import type { ColumnsType } from "antd/es/table";
import store from "@/store";
import ConfirmModal from "@/components/confirmModal";
import { ReloadOutlined } from "@ant-design/icons";
import { useMetaMask } from "@/hooks/useMetaMask";

interface Props {}

interface DataType {
  [key: string]: any;
}

const defaultPageNum = 6;

function StakingCard(props: Props) {
  const {} = props;

  const [isFeedbackOpen, setIsFeedbackOpen] = useState<boolean>(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);

  const [list, setList] = useState<DataType[]>([]);
  const [listLoading, setListLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const [selectedRow, setSelectedRow] = useState<any>();

  const [expectedRewards, setExpectedRewards] = useState<any>("");

  const [api, contextHolder] = notification.useNotification();

  const { currentAccount, wallet } = useMetaMask();
  const nework = wallet?.chainId?.includes("0x1") ? "main" : "test";

  const { refreshStakeData, sendLoading } = useSelector(
    (state: rootState) => state?.commonStore,
    shallowEqual
  );

  const getList = async () => {
    const staker = currentAccount;

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
    const staker = currentAccount;
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

  const setSendLoading = (status: boolean) => {
    store.dispatch({
      type: "common/change",
      payload: { sendLoading: status },
    });
  };

  const onWithdraw = async () => {
    const staker = currentAccount;
    setSendLoading(true);
    try {
      const res: any = await stake_contract.onUnstake(selectedRow?.id, staker);
      if (res) {
        if (res?.message) {
          api.error({
            message: res?.message,
            placement: "top",
          });
        } else {
          setExpectedRewards(res);
          onConfirmClose();
          onFeedbackOpen();
          refresh();
        }
      }
    } finally {
      setSendLoading(false);
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
      render: (val, row) => heightToDate(Number(val), nework),
    },
    {
      title: "Maturity Date",
      key: "end",
      dataIndex: "end",
      render: (val, row) => heightToDate(Number(val), nework),
    },
    {
      title: "Status",
      key: "action",
      render: (_, row) =>
        row?.canWithdraw ? (
          <Space size="middle">
            <Button type="primary" onClick={() => onWithdrawBtnClick(row)}>
              Withdraw
            </Button>
          </Space>
        ) : (
          "locked"
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
    setSendLoading(false);
    setExpectedRewards("");
  };

  const onTableChange = (pageNum: any) => {
    setCurrentPage(pageNum);
  };

  const refresh = () => {
    store.dispatch({
      type: "common/change",
      payload: { refreshStakeData: true },
    });
  };

  useEffect(() => {
    getList();
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
    <div>
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
      {/* confirm modal */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        title="Are you sure to withdraw this stake now?"
        desc={
          <>
            Expected FIG rewards from this Variable-term staking:
            <p>{`${expectedRewards || "calculating..."} FIG`}</p>
          </>
        }
        loading={sendLoading}
        onCancel={onConfirmClose}
        onConfirm={onWithdraw}
      />
      {/* feedback modal */}
      <ConfirmModal
        isOpen={isFeedbackOpen}
        type="success"
        title="Successfully Withdrawn"
        // desc={`You received ${expectedRewards} FIG`}
        onConfirm={onFeedbackClose}
      />
      {contextHolder}
    </div>
  );
}

export default StakingCard;
