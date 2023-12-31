"use client";

import { Modal, notification, Space } from "antd";
import { useState, useEffect, useMemo } from "react";
import NumberInput from "@/packages/NumberInput";
import DescRow from "@/packages/DescRow";
import { useDebounce } from "use-debounce";
import { ExpectedBorrow, BorrowModalData, MinerBorrows } from "@/utils/type";
import data_fetcher_contract from "@/server/data_fetcher";
import FIL_contract from "@/server/FILLiquid_contract";
import { getValueDivide, isIndent, numberWithCommas } from "@/utils";
import { DEFAULT_EMPTY } from "../constans";
import { SLIPPAGE_TAG_MAP } from "@/constants";
import useLoading from "@/hooks/useLoading";
import { useMetaMask } from "@/hooks/useMetaMask";
import InfoTips from "@/components/InfoTips";
import { getDataFromFilscan } from "../../../api/modules";
import ConfirmModal from "@/components/ConfirmModal";
import { Tag } from "antd";
import BigNumber from "bignumber.js";

const { CheckableTag } = Tag;

interface IProps {
  isOpen?: boolean;
  data: BorrowModalData;
  onCancel?: () => void;
  updateList?: () => void;
}

interface Rewards {
  amountFIT?: number | string;
  amountFIL?: number | string;
}

const defaultExpected = {
  expected6monthInterest: 0,
  expectedInterestRate: 0,
};

const defaultBorrowFactors = {
  maxBorrowAPR: undefined,
};

function BorrowModal(props: IProps) {
  const { isOpen = false, data, onCancel, updateList } = props;

  const [amount, setAmount] = useState<number | null>();
  const [selectedTags, setSelectedTags] = useState<string>("");
  const [debouncedAmount] = useDebounce(amount, 2);
  const [expected, setExpected] = useState<ExpectedBorrow>(defaultExpected);
  const [minerBorrow, setMinerBorrow] = useState<MinerBorrows | null>();
  const [maxBorrowable, setMaxBorrowable] = useState();
  const [slippage, setSlippage] = useState<any>();
  const [api, contextHolder] = notification.useNotification();
  const { loading, setLoading } = useLoading();
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [rewards, setRewards] = useState<Rewards>();
  const [borrowFactors, setBorrowFactors] = useState(defaultBorrowFactors);

  const { wallet } = useMetaMask();
  const network = wallet?.chainId?.includes("0x1") ? "f0" : "t0";

  const handleCancel = () => {
    if (onCancel) {
      clear();
      onCancel();
    }
  };

  const handleFeedbackCancel = () => {
    setIsFeedbackOpen(false);
    if (rewards) {
      setRewards(undefined);
      if (updateList) {
        updateList();
      }
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
      const res: any = await FIL_contract.onBorrow(
        data.minerId,
        amount,
        slippage
      );
      if (res) {
        handleCancel();
        setIsFeedbackOpen(true);
        setRewards({
          amountFIL: res?.amountFIL,
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

  const getBorrowFactors = async () => {
    if (data?.minerId) {
      const res: any = await FIL_contract.getBorrowPayBackFactors();
      setBorrowFactors({
        maxBorrowAPR: res,
      });
    }
  };

  const clear = () => {
    setAmount(undefined);
    setSlippage(undefined);
    setSelectedTags("");
    setExpected(defaultExpected);
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

  useEffect(() => {
    onExpectedRewards();
  }, [debouncedAmount]);

  useEffect(() => {
    onMinerBorrows();
    getMaxBorrowable();
    getBorrowFactors();
  }, [data, data?.minerId]);

  const familyData = useMemo(() => {
    return [
      {
        title: "Debt Outstanding",
        value: numberWithCommas(
          data?.familyInfo.debtOutstanding || DEFAULT_EMPTY
        ),
        unit: "FIL",
      },
      {
        title: "Available Credit",
        value: numberWithCommas(
          data?.familyInfo.availableCredit || DEFAULT_EMPTY
        ),
        unit: "FIL",
      },
      {
        title: "Debt Ratio",
        value: (
          <span style={getDebtRatioStyle(Number(data?.familyInfo.ratio || 0))}>
            {data?.familyInfo.ratio || DEFAULT_EMPTY}
          </span>
        ),
        tip: "Debt-to-assets Ratio = Debt Outstanding / Total Account Balance",
        unit: "%",
      },
    ];
  }, [data?.familyInfo]);

  const minerData = useMemo(() => {
    return [
      {
        title: "Miner Debt Outstanding",
        value: numberWithCommas(minerBorrow?.debtOutStanding || 0),
        unit: "FIL",
        tip: "Sum of principal borrowed and interest accrued",
      },
      {
        title: "Lines of Credit",
        value: minerBorrow?.borrows?.length || 0,
      },
      {
        title: "Miner Total Position",
        value: numberWithCommas(minerBorrow?.balance || DEFAULT_EMPTY),
        tip: `Sum of miner’s total account balance and borrowed funds`,
      },
      {
        title: "Available Balance",
        value: numberWithCommas(minerBorrow?.availableBalance || DEFAULT_EMPTY),
        unit: "FIL",
      },
      {
        title: "Initial Pledge*",
        value: "--",
        // unit: "FIL",
      },
      {
        title: "QAP*",
        value: "--",
        tip: "Quality Adjusted Power",
      },
    ];
  }, [minerBorrow]);

  const getMinerInfo = async () => {
    const res = await getDataFromFilscan({
      account_id: "f02816081",
    });
    if (res && res?._data) {
      const {
        result: {
          account_info: { account_miner },
        },
      } = res?._data;
      const initialPledge = getValueDivide(account_miner?.init_pledge || 0);
    }
  };

  useEffect(() => {
    // getMinerInfo();
  }, []);

  const handleChange = (tag: string, checked: boolean) => {
    if (selectedTags === tag) {
      setSelectedTags("");
    } else {
      setSelectedTags(tag);
    }
  };

  useEffect(() => {
    switch (selectedTags) {
      case SLIPPAGE_TAG_MAP[0]:
      case SLIPPAGE_TAG_MAP[1]:
      case SLIPPAGE_TAG_MAP[2]:
        setSlippage(
          BigNumber(expected.expectedInterestRate)
            .times(1 + Number.parseInt(selectedTags) / 100)
            .decimalPlaces(2, BigNumber.ROUND_DOWN)
            .toNumber()
        );
        break;
      case SLIPPAGE_TAG_MAP[3]:
        setSlippage((borrowFactors?.maxBorrowAPR || 0) * 100 + 10);
        break;
      case "":
        setSlippage(undefined);
        break;
      default:
        break;
    }
  }, [selectedTags, expected.expectedInterestRate]);

  return (
    <>
      <Modal
        className="custom-modal big-btn top-[30px]"
        title=""
        open={isOpen}
        onCancel={handleCancel}
        cancelButtonProps={{
          size: "large",
        }}
        width={670}
        onOk={handleConfirm}
        okText="Borrow"
        okButtonProps={{
          size: "large",
          loading: loading,
        }}
      >
        <p className="font-bold text-[18px] mb-4">
          {isIndent(data?.familyInfo.user)}
        </p>
        <div className="grid grid-cols-3 gap-[16px]">
          {familyData.map((item, index) => (
            <div
              className={`data-card ${index === 0 && "btn-default text-white"}`}
              key={item.title}
            >
              <Space className="mb-4">
                <p className="text-xs font-semibold">{item.title}</p>
                {item.tip && <InfoTips type="small" content={item.tip} />}
              </Space>

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
              <Space className="mb-4">
                <p className="text-xs font-semibold">{item.title}</p>
                {item.tip && <InfoTips type="small" content={item.tip} />}
              </Space>
              <p className="text-[22px] font-bold">
                {item.value}
                {item.unit && (
                  <span className="text-sm font-normal ml-2">{item.unit}</span>
                )}
              </p>
            </div>
          ))}
        </div>
        <p className="text-gray-400 text-sm mt-[10px]">
          *Miner specific data is provided by{" "}
          <a className="underline" target="_blank" href="https://filscan.io/">
            Filscan.io
          </a>
        </p>
        <div className="my-5">
          <NumberInput
            label="Loan Amount"
            value={amount}
            prefix="FIL"
            min={10}
            max={maxBorrowable}
            maxButton
            onMaxButtonClick={onMaxButtonClick}
            onChange={(val) => setAmount(val)}
          />
          <NumberInput
            label={
              <Space size={[4, 4]}>
                Slippage Tolerance{" "}
                <InfoTips
                  type="small"
                  content="Due to the potential slippage of on-chain transactions, there may be discrepancies in the actual Borrowing APR compared to the expected Borrowing APR. Input the maximum acceptable borrowing APR for this transaction."
                />
              </Space>
            }
            className="w-[100px] border-r-none"
            placeholder="Max. Acceptable Borrowing APR"
            affix="%"
            value={slippage}
            disabled={selectedTags === SLIPPAGE_TAG_MAP[3]}
            onChange={(val) => setSlippage(val)}
          />
          <Space className="mt-2" size={[0, 8]} wrap>
            {SLIPPAGE_TAG_MAP.map((tag) => (
              <CheckableTag
                key={tag}
                checked={selectedTags.includes(tag)}
                onChange={(checked) => handleChange(tag, checked)}
              >
                {tag}
              </CheckableTag>
            ))}
          </Space>
        </div>
        <DescRow
          title="Expected Borrowing APR"
          desc={`${expected.expectedInterestRate}%`}
        />
        <DescRow
          title="Expected 6-Month Interest"
          desc={`${expected.expected6monthInterest} FIL`}
        />
        <DescRow title="Borrowing Transaction Fee" desc="1%" />
        {contextHolder}
      </Modal>

      <ConfirmModal
        isOpen={isFeedbackOpen}
        type="success"
        title="Successfully Borrowed"
        desc={`${rewards?.amountFIL} FIL borrowed`}
        onConfirm={handleFeedbackCancel}
        onCancel={handleFeedbackCancel}
      />
    </>
  );
}

export default BorrowModal;
