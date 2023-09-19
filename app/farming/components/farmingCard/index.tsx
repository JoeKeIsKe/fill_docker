"use client";

import { isIndent } from "@/utils";
import { rootState } from "@/store/type";
import { useSelector } from "react-redux";
import { Select, Button, notification, Space } from "antd";
import { useState, useEffect } from "react";
import { STAKE_MONTH_OPTIONS } from "@/constants";
import stake_contract from "@/server/stake";
import data_fetcher_contract from "@/server/data_fetcher";
import store from "@/store";
import ConfirmModal from "@/components/confirmModal";
import { useMetaMask } from "@/hooks/useMetaMask";
import NumberInput from "@/packages/NumberInput";
import useLoading from "@/hooks/useLoading";

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
  const [amount, setAmount] = useState<number | null>(defaultAmount);
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
      const res: any = await stake_contract.onStake(amount, stakeTime, staker);
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
      setLoading(false);
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
          address: "0xbc90Ef7544a6ff693cc5316e0D3541090eEfD961",
          symbol: "FIG",
          decimals: 18,
        },
      },
    });
    if (res) {
      api.success({
        message: "Successfully added",
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

  return (
    <div className="lg:min-w-[450px] h-full relative">
      <div className="btn-default p-4 rounded-t-[24px] text-[#fff]">
        <div className="flex justify-between mb-2">
          <div className="flex flex-col">
            <p className="">Available to farm</p>
            <p className="font-semibold text-lg">{`${stakerData.filTrustBalance} FIT`}</p>
          </div>
          <p className="h-full py-1 px-2 rounded-[24px] bg-gray-100 text-gray-500 text-sm">
            {isClient && isIndent(currentAccount)}
          </p>
        </div>
        <div className="flex gap-[40px] text-sm">
          <div className="flex flex-col">
            <p className="">Fixed-term FIT</p>
            <p className="font-semibold text-lg">{`${stakerData.filTrustFixed} FIT`}</p>
          </div>
          <div className="flex flex-col">
            <p className="">Variable-term FIT</p>
            <p className="font-semibold text-lg">{`${stakerData.filTrustVariable} FIT`}</p>
          </div>
        </div>
        <hr className="my-4 h-0.5 border-t-0 bg-neutral-100 opacity-70 dark:opacity-50" />
        <div className="flex flex-col text-sm">
          <Space>
            <p className="">FIG Balance</p>

            <Button
              className="bg-gray-400 text-[#fff] text-sm rounded-[24px] border-none hover:!text-[#fff] h-[28px] ml-2"
              onClick={handleAddToWallet}
            >
              Add to wallet
            </Button>
          </Space>
          <p className="font-semibold text-lg">{`${stakerData.filGovernanceBalance} FIG`}</p>
        </div>
      </div>
      <div className="bg-white p-4 rounded-[10px] mt-[-10px]">
        <div className="">
          <NumberInput
            label=""
            value={amount}
            prefix="FIT"
            min={1}
            max={Number(stakerData.filTrustBalance) || undefined}
            maxButton
            onMaxButtonClick={onMaxBtnClick}
            onChange={onChange}
          />
        </div>
        <div className="flex items-end gap-2 mt-4">
          <Select
            style={{ width: 120 }}
            value={stakeTime}
            onChange={onSelectChange}
            options={STAKE_MONTH_OPTIONS}
          />
          <span>mos</span>
        </div>
        <div className="mt-12 space-y-3">
          <p className="text-sm">
            Expected FIG rewards from Fixed-term farming :{" "}
            <em>{expectedRewards}</em> FIG
          </p>
          <Button
            className="w-full"
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
        title="Successfully Staked"
        onConfirm={onFeedbackClose}
      />
      {contextHolder}
    </div>
  );
}

export default FarmingCard;
