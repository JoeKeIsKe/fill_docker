"use client";

import { Modal, Divider } from "antd";
import { ReactNode, useState } from "react";
import NumberInput from "@/packages/NumberInput";
import DescRow from "@/packages/DescRow";

interface IProps {
  isOpen?: boolean;
  type?: "warning" | "success";
  title?: string;
  desc?: string | ReactNode;
  loading?: boolean;
  onCancel?: () => void;
  onConfirm?: () => void;
}

function BorrowModal(props: IProps) {
  const { isOpen = true, loading, onCancel, onConfirm } = props;

  const [amount, setAmount] = useState<number | null>();
  const [slippage, setSlippage] = useState();

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
  };

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
        loading,
      }}
    >
      <div className="text-xl font-bold my-4">Borrow</div>
      <p className="font-semibold my-2">Family Addr.</p>
      <div className="flex flex-wrap">
        <div className="w-1/2 text-sm">Debt Outstanding: 23,000</div>
        <div className="w-1/2 text-sm">Available Credit: 230</div>
        <div className="w-1/2 text-sm">D/A Ratio: 60%</div>
      </div>
      <p className="font-semibold my-2">Miner ID</p>
      <div className="flex flex-wrap">
        <div className="w-1/2 text-sm">Available Balance: 23,000</div>
        <div className="w-1/2 text-sm">Miner Debt Outstanding: 2300</div>
        <div className="w-1/2 text-sm">Initial Pledge: 23</div>
        <div className="w-1/2 text-sm">Lines of Credit: 4</div>
        <div className="w-1/2 text-sm">Miner Total Position: 230000</div>
      </div>
      <div className="my-5">
        <NumberInput
          label="Amount"
          value={amount}
          prefix="FIL"
          maxButton
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
      <DescRow title="Expected borrowing APR" desc="1.6%" />
      <DescRow title="Expected 6mo interest" desc="1.6%" />
      <DescRow title="Borrowing transaction fee" desc="20" />
    </Modal>
  );
}

export default BorrowModal;
