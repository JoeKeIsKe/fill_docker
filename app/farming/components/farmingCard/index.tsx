"use client";

import { isIndent } from "@/utils";
import { rootState } from "@/store/type";
import { useSelector } from "react-redux";
import { Select, Button, notification, Space } from "antd";
import { useState, useEffect, useMemo } from "react";
import { STAKE_MONTH_OPTIONS } from "@/constants";
import stake_contract from "@/server/stake";
import data_fetcher_contract from "@/server/data_fetcher";
import store from "@/store";
import ConfirmModal from "@/components/confirmModal";
import { useMetaMask } from "@/hooks/useMetaMask";
import NumberInput from "@/packages/NumberInput";
import useLoading from "@/hooks/useLoading";
import { FIG_contract } from "@/contract";
import Card from "@/packages/card";

interface Props {}

interface StakerDataType {
  filTrustBalance: number | string;
  filTrustFixed: number | string;
  filTrustVariable: number | string;
  filGovernanceBalance: number | string;
}

const defaultAmount = 1;

const defaultStakerData = {
  filTrustBalance: 0,
  filTrustFixed: 0,
  filTrustVariable: 0,
  filGovernanceBalance: 0,
};

function FarmingCard(props: Props) {
  const [amount, setAmount] = useState<number | null>();
  const [stakeTime, setStakeTime] = useState<number | null>();
  const [isClient, setIsClient] = useState<boolean>(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState<boolean>(false);
  const [stakerData, setStakerData] =
    useState<StakerDataType>(defaultStakerData);
  const [expectedRewards, setExpectedRewards] = useState<any>(0);
  const [rewards, setRewards] = useState<any>("");

  const [api, contextHolder] = notification.useNotification();

  const { currentAccount, isNetworkCorrect } = useMetaMask();
  const { loading, setLoading } = useLoading();

  const { refreshStakeData } = useSelector(
    (state: rootState) => state?.commonStore
  );

  const fetchStakerData = async () => {
    if (!isNetworkCorrect) return;
    const staker = currentAccount;
    if (staker) {
      const data: any = await data_fetcher_contract.fetchStakerData(staker);
      setStakerData(data);
    }
  };

  const fetchExpectedRewardsFromStake = async () => {
    if (!stakeTime || !amount) {
      return setExpectedRewards(0);
    }
    if (amount && stakeTime) {
      const data = await stake_contract.onExpectedRewardsFromStake(
        amount,
        stakeTime
      );
      setExpectedRewards(data);
    }
  };

  const onChange = (val: number | null) => {
    setAmount(val);
  };

  const onSelectChange = (val: any) => {
    setStakeTime(val);
  };

  const onMaxBtnClick = () => {
    // set max amount
    setAmount(Number(stakerData.filTrustBalance));
  };

  const onFarm = async () => {
    if (!stakeTime)
      return api.warning({
        message: "Please select the time you want to stake",
        placement: "top",
      });
    if (!amount)
      return api.warning({
        message: "Please input the number of FIT you want to stake",
        placement: "top",
      });
    if (amount && stakeTime) {
      const staker = currentAccount;
      setLoading(true);
      try {
        const res: any = await stake_contract.onStake(
          amount,
          stakeTime,
          staker
        );
        if (res) {
          if (res?.message) {
            api.error({
              message: res?.message,
            });
          } else {
            setRewards(res);
            onFeedbackOpen();
          }
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const onFeedbackOpen = () => {
    setIsFeedbackOpen(true);
  };

  const onFeedbackClose = () => {
    setIsFeedbackOpen(false);
    if (rewards) {
      setRewards(null);
      store.dispatch({
        type: "common/change",
        payload: { refreshStakeData: true },
      });
    }
  };

  const handleAddToWallet = async () => {
    const res = await window?.ethereum.request({
      method: "wallet_watchAsset",
      params: {
        type: "ERC20",
        options: {
          address: FIG_contract,
          symbol: "FIG",
          decimals: 18,
        },
      },
    });
    if (res) {
      api.success({
        message: "Token successfully added",
      });
    }
  };

  // hack for text mismatch error in next.js
  useEffect(() => {
    setIsClient(true);
    fetchStakerData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAccount]);

  useEffect(() => {
    if (refreshStakeData) {
      fetchStakerData();
      setAmount(null);
      setStakeTime(null);
      store.dispatch({
        type: "common/change",
        payload: { refreshStakeData: false },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshStakeData]);

  useEffect(() => {
    fetchExpectedRewardsFromStake();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount, stakeTime]);

  const overviewData = useMemo(() => {
    return [
      {
        title: "Available to Farm",
        value: stakerData.filTrustBalance,
        unit: "FIT",
        span: true,
      },
      {
        title: "Fixed-term",
        value: stakerData.filTrustFixed,
        unit: "FIT",
      },
      {
        title: "Variable-term",
        value: stakerData.filTrustVariable,
        unit: "FIT",
      },
      {
        title: "FIG Balance",
        value: stakerData.filGovernanceBalance,
        unit: "FIG",
        span: true,
        action: (
          <Button
            className="bg-gray-400 text-[#fff] !text-xs !rounded-[24px] border-none hover:!text-[#fff] h-[28px] ml-2"
            size="small"
            onClick={handleAddToWallet}
          >
            Add to wallet
          </Button>
        ),
      },
    ];
  }, [stakerData]);

  return (
    <Card title="overview" className="lg:min-w-[450px] h-full relative">
      <p className="absolute top-[24px] right-[20px] py-1 px-2 rounded-[24px] bg-gray-100 text-gray-500 text-sm">
        {isClient && isIndent(currentAccount)}
      </p>
      <div className="grid grid-cols-2 gap-4">
        {overviewData.map((item, index) => (
          <div
            className={`data-card ${index === 0 && "btn-default text-white"} ${
              item.span ? "col-span-2" : ""
            }`}
            key={item.title}
          >
            {item.action ? (
              <Space className="m-0 mb-4" align="center">
                <p className="text-xs font-semibold">{item.title}</p>
                {item.action}
              </Space>
            ) : (
              <p className="text-xs font-semibold mb-4">{item.title}</p>
            )}

            <p className="text-[22px] font-bold">
              {item.value}
              {item.unit && (
                <span className="text-sm font-normal ml-2">{item.unit}</span>
              )}
            </p>
          </div>
        ))}
      </div>
      <div className="bg-white pt-2 rounded-[10px] mt-[-10px]">
        <div className="">
          <NumberInput
            label="Amount"
            value={amount}
            prefix="FIT"
            min={1}
            max={Number(stakerData.filTrustBalance) || undefined}
            maxButton
            onMaxButtonClick={onMaxBtnClick}
            onChange={onChange}
          />
        </div>

        <div className="flex flex-col items-start mt-4">
          <label className="inline-block mb-[5px] font-medium text-sm text-[#06081B] opacity-40">
            Farming Terms
          </label>
          <div className="flex gap-[20px] items-center">
            <Select
              style={{ width: 120 }}
              value={stakeTime}
              onChange={onSelectChange}
              options={STAKE_MONTH_OPTIONS}
              size="large"
            />
            <span>Months</span>
          </div>
        </div>
        <div className="mt-[16px] space-y-3">
          <p className="text-xs font-medium text-[#06081B]">
            <span className="opacity-40">
              Expected FIG rewards from Fixed-term Farming :{" "}
            </span>
            <span className="text-[#4094E0]">{expectedRewards}</span>
            <span className="opacity-40"> FIG</span>
          </p>
          <Button
            className="w-full !rounded-[24px] !h-[54px] !mt-[32px]"
            type="primary"
            loading={loading}
            onClick={onFarm}
          >
            Farm
          </Button>
        </div>
      </div>
      {/* feedback modal */}
      <ConfirmModal
        type="success"
        isOpen={isFeedbackOpen}
        title="Successfully Farmed"
        onConfirm={onFeedbackClose}
      />
      {contextHolder}
    </Card>
  );
}

export default FarmingCard;
