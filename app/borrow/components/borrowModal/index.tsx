"use client";

import { Modal, Divider, notification } from "antd";
import { useState, useEffect, useMemo } from "react";
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

  const familyData = useMemo(() => {
    return [
      {
        title: "Debt Outstanding",
        value: data?.familyInfo.debtOutstanding || DEFAULT_EMPTY,
        unit: "FIL",
      },
      {
        title: "Available Credit",
        value: data?.familyInfo.availableCredit || DEFAULT_EMPTY,
        unit: "FIL",
      },
      {
        title: "D/A Ratio",
        value: data?.familyInfo.availableCredit || DEFAULT_EMPTY,
        unit: "%",
      },
    ];
  }, [data?.familyInfo]);

  const minerData = useMemo(() => {
    return [
      {
        title: "Available Balance",
        value: minerBorrow?.availableBalance || DEFAULT_EMPTY,
        unit: "FIL",
      },
      {
        title: "Miner Debt Outstanding",
        value: minerBorrow?.debtOutStanding || DEFAULT_EMPTY,
        unit: "FIL",
      },
      {
        title: "Lines of Credit",
        value: minerBorrow?.borrows?.length || 0,
      },
      {
        title: "Miner Total Position",
        value: minerBorrow?.balance || DEFAULT_EMPTY,
      },
    ];
  }, [minerBorrow]);

  return (
    <Modal
      className="custom-modal big-btn"
      title=""
      open={isOpen}
      onCancel={handleCancel}
      cancelButtonProps={{
        size: "large",
      }}
      width={620}
      onOk={handleConfirm}
      okText="Borrow"
      okButtonProps={{
        size: "large",
        loading: loading,
      }}
    >
      {/* <div className="text-xl font-bold">Borrow</div> */}
      <p className="font-bold text-[18px] mb-4">
        {isIndent(data?.familyInfo.user)}
      </p>
      <div className="grid grid-cols-3 gap-[16px]">
        {familyData.map((item, index) => (
          <div
            className={`data-card ${index === 0 && "btn-default text-white"}`}
            key={item.title}
          >
            <p className="text-xs font-semibold mb-4">{item.title}</p>
            <p className="text-[22px] font-bold">
              {item.value}
              {item.unit && (
                <span className="text-sm font-normal ml-2">{item.unit}</span>
              )}
            </p>
          </div>
        ))}
      </div>
      <p className="font-bold text-[18px] my-4">{`Miner ID: ${network}${minerBorrow?.minerId}`}</p>
      <div className="grid grid-cols-3 gap-[16px]">
        {minerData.map((item, index) => (
          <div
            className={`data-card ${index === 0 && "btn-default text-white"}`}
            key={item.title}
          >
            <p className="text-xs font-semibold mb-4 whitespace-nowrap">
              {item.title}
            </p>
            <p className="text-[22px] font-bold">
              {item.value}
              {item.unit && (
                <span className="text-sm font-normal ml-2">{item.unit}</span>
              )}
            </p>
          </div>
        ))}
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
          addonAfter="%"
          onChange={(val) => setSlippage(val)}
        />
      </div>
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
