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
import { useMetaMask } from "@/hooks/useMetaMask";

interface IProps {
  isOpen?: boolean;
  data: BorrowModalData;
  onCancel?: () => void;
}

const defaultExpected = {
  expected6monthInterest: 0,
  expectedInterestRate: 0,
};

function BorrowModal(props: IProps) {
  const { isOpen = false, data, onCancel } = props;

  const [amount, setAmount] = useState<number | null>();
  const [debouncedAmount] = useDebounce(amount, 2);
  const [expected, setExpected] = useState<ExpectedBorrow>(defaultExpected);
  const [minerBorrow, setMinerBorrow] = useState<MinerBorrows | null>();
  const [maxBorrowable, setMaxBorrowable] = useState();
  const [slippage, setSlippage] = useState();
  const [api, contextHolder] = notification.useNotification();
  const { loading, setLoading } = useLoading();

  const { wallet } = useMetaMask();
  const network = wallet?.chainId?.includes("0x1") ? "f0" : "t0";

  const handleCancel = () => {
    if (onCancel) {
      clear();
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
    setLoading(true);
    try {
      const res = await FIL_contract.onBorrow(data.minerId, amount, slippage);
      if (res) {
        handleCancel();
        api.success({
          message: "successfully borrowed",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const onMaxButtonClick = () => {
    if (maxBorrowable) {
      setAmount(Number(maxBorrowable));
    }
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

  const getMaxBorrowable = async () => {
    if (data?.minerId) {
      const res: any = await data_fetcher_contract.getMaxBorrowable(
        data.minerId
      );
      setMaxBorrowable(res);
    }
  };

  const clear = () => {
    setAmount(undefined);
    setSlippage(undefined);
    setExpected(defaultExpected);
  };

  useEffect(() => {
    onExpectedRewards();
  }, [debouncedAmount]);

  useEffect(() => {
    onMinerBorrows();
    getMaxBorrowable();
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
        loading: loading,
      }}
    >
      <div className="text-xl font-bold my-4">Borrow</div>
      <p className="font-semibold my-2">{isIndent(data?.familyInfo.user)}</p>
      <div className="flex flex-wrap">
        <DescRow
          title="Debt Outstanding"
          desc={`${data?.familyInfo.debtOutstanding || DEFAULT_EMPTY} FIL`}
          noSpace
        />
        <DescRow
          title="Available Credit"
          desc={`${data?.familyInfo.availableCredit || DEFAULT_EMPTY} FIL`}
          noSpace
        />
        <DescRow
          title="D/A Ratio"
          desc={`${data?.familyInfo.ratio || DEFAULT_EMPTY}%`}
          noSpace
        />
      </div>
      <p className="font-semibold my-2">{`Miner ID: ${network}${minerBorrow?.minerId}`}</p>
      <div className="flex flex-wrap">
        <DescRow
          title="Available Balance"
          desc={`${minerBorrow?.availableBalance || DEFAULT_EMPTY} FIL`}
          noSpace
        />
        <DescRow
          title="Miner Debt Outstanding"
          desc={`${minerBorrow?.debtOutStanding || DEFAULT_EMPTY} FIL`}
          noSpace
        />
        {/* <div className="w-1/2 text-sm">{`Initial Pledge: 23`}</div>
        <div className="w-1/2 text-sm">{`Locked Reward: 23`}</div> */}
        <DescRow
          title="Lines of Credit"
          desc={`${minerBorrow?.borrows?.length || 0}`}
          noSpace
        />
        <DescRow
          title="Miner Total Position"
          desc={`${minerBorrow?.balance || DEFAULT_EMPTY} FIL`}
          noSpace
        />
      </div>
      <div className="my-5">
        <NumberInput
          label="Amount"
          value={amount}
          prefix="FIL"
          min={10}
          max={maxBorrowable}
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
