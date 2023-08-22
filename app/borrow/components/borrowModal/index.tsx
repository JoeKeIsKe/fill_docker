"use client";

import { Modal, Divider, notification } from "antd";
import { useState, useEffect } from "react";
import NumberInput from "@/packages/NumberInput";
import DescRow from "@/packages/DescRow";
import { useDebounce } from "use-debounce";
import { ExpectedBorrow, BorrowModalData, MinerBorrows } from "@/utils/type";
import data_fetcher_contract from "@/server/data_fetcher";
import FIL_contract from "@/server/FILLiquid_contract";
import { isIndent } from "@/utils";
import { DEFAULT_EMPTY } from "../constans";
import useLoading from "@/hooks/useLoading";

interface IProps {
  isOpen?: boolean;
  data: BorrowModalData;
  onCancel?: () => void;
}

function BorrowModal(props: IProps) {
  const { isOpen = false, data, onCancel } = props;

  const [amount, setAmount] = useState<number | null>();
  const [debouncedAmount] = useDebounce(amount, 2);
  const [expected, setExpected] = useState<ExpectedBorrow>({
    expected6monthInterest: 0,
    expectedInterestRate: 0,
  });
  const [minerBorrow, setMinerBorrow] = useState<MinerBorrows | null>();
  const [slippage, setSlippage] = useState();
  const [api, contextHolder] = notification.useNotification();
  const { sendLoading, setSendLoading } = useLoading();

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  const handleConfirm = async () => {
    if (!amount)
      return api.warning({
        message: "Please input the amount",
        placement: "top",
      });
    if (!slippage)
      return api.warning({
        message: "Please input the slippage tolerance",
        placement: "top",
      });
    setSendLoading(true);
    try {
      const res = await FIL_contract.onBorrow(data.minerId, amount, slippage);
      if (res) {
        handleCancel();
        api.success({
          message: "successfully borrowed",
          placement: "bottomRight",
        });
      }
    } finally {
      setSendLoading(false);
    }
  };

  const onMaxButtonClick = () => {
    const num = Number(data?.familyInfo.availableCredit);
    setAmount(num);
  };

  const onExpectedRewards = async () => {
    const res: any = await data_fetcher_contract.getBorrowExpecting(
      debouncedAmount || 0
    );
    setExpected(res);
  };

  const onMinerBorrows = async () => {
    if (data?.minerId) {
      const res: any = await FIL_contract.getMinerBorrows(data.minerId);
      setMinerBorrow(res);
    }
  };

  useEffect(() => {
    onExpectedRewards();
  }, [debouncedAmount]);

  useEffect(() => {
    onMinerBorrows();
  }, [data, data?.minerId]);

  return (
    <Modal
      className="custom-modal"
      title=""
      open={isOpen}
      onCancel={handleCancel}
      cancelButtonProps={{
        size: "large",
      }}
      onOk={handleConfirm}
      okText="Borrow"
      okButtonProps={{
        size: "large",
        loading: sendLoading,
      }}
    >
      <div className="text-xl font-bold my-4">Borrow</div>
      <p className="font-semibold my-2">{isIndent(data?.familyInfo.user)}</p>
      <div className="flex flex-wrap">
        <div className="w-1/2 text-sm">{`Debt Outstanding: ${
          data?.familyInfo.debtOutstanding || DEFAULT_EMPTY
        } FIL`}</div>
        <div className="w-1/2 text-sm">{`Available Credit: ${
          data?.familyInfo.availableCredit || DEFAULT_EMPTY
        } FIL`}</div>
        <div className="w-1/2 text-sm">{`D/A Ratio: ${data?.familyInfo.ratio}%`}</div>
      </div>
      {/* to do: network */}
      <p className="font-semibold my-2">{`Miner ID: t0${minerBorrow?.minerId}`}</p>
      <div className="flex flex-wrap">
        <div className="w-1/2 text-sm">{`Available Balance: ${minerBorrow?.availableBalance} FIL`}</div>
        <div className="w-1/2 text-sm">{`Miner Debt Outstanding: ${
          minerBorrow?.debtOutStanding || DEFAULT_EMPTY
        } FIL`}</div>
        {/* <div className="w-1/2 text-sm">{`Initial Pledge: 23`}</div>
        <div className="w-1/2 text-sm">{`Locked Reward: 23`}</div> */}
        <div className="w-1/2 text-sm">{`Lines of Credit: ${
          minerBorrow?.borrows?.length || 0
        }`}</div>
        <div className="w-1/2 text-sm">
          Miner Total Position:
          <span>{`${minerBorrow?.balance || DEFAULT_EMPTY} FIL`}</span>
        </div>
      </div>
      <div className="my-5">
        <NumberInput
          label="Amount"
          value={amount}
          prefix="FIL"
          min={10}
          max={data?.familyInfo.availableCredit}
          maxButton
          onMaxButtonClick={onMaxButtonClick}
          onChange={(val) => setAmount(val)}
        />
        <NumberInput
          label="Slippage tolerance"
          className="w-[100px]"
          value={slippage}
          onChange={(val) => setSlippage(val)}
        />
      </div>
      <Divider />
      <DescRow
        title="Expected borrowing APR"
        desc={`${expected.expectedInterestRate}%`}
      />
      <DescRow
        title="Expected 6mo interest"
        desc={`${expected.expected6monthInterest} FIL`}
      />
      <DescRow title="Borrowing transaction fee" desc="1%" />
      {contextHolder}
    </Modal>
  );
}

export default BorrowModal;
