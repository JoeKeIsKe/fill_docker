"use client";

import { isIndent } from "@/utils";
import { rootState } from "@/store/type";
import { shallowEqual, useSelector } from "react-redux";
import { InputNumber, Select, Button } from "antd";
import { useState, useEffect } from "react";
import { STAKE_MONTH_OPTIONS } from "@/constants";
import stake_contract from "@/server/stake";
import data_fetcher_contract from "@/server/data_fetcher";
import store from "@/store";
import ConfirmModal from "../confirmModal";

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

function StakingCard(props: Props) {
  const {} = props;

  const [amount, setAmount] = useState<number | null>(defaultAmount);
  const [stakeTime, setStakeTime] = useState<number | null>();
  const [isClient, setIsClient] = useState<boolean>(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState<boolean>(false);
  const [stakerData, setStakerData] =
    useState<StakerDataType>(defaultStakerData);
  const [expectedRewards, setExpectedRewards] = useState<any>(0);
  const [rewards, setRewards] = useState<any>("");

  const wallet = useSelector((state: rootState) => state?.wallet, shallowEqual);

  const { refreshStakeData } = useSelector(
    (state: rootState) => state?.commonStore
  );

  const fetchStakerData = async () => {
    const staker = wallet?.account;
    if (staker) {
      const data: any = await data_fetcher_contract.fetchStakerData(staker);
      setStakerData(data);
    }
  };

  const fetchExpectedRewardsFromStake = async () => {
    if (!stakeTime) {
      return;
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
    if (!stakeTime) return;
    if (amount && stakeTime) {
      const staker = wallet?.account;
      setSendLoading(true);
      const res = await stake_contract.onStake(amount, stakeTime, staker);
      if (res) {
        setRewards(res);
        onFeedbackOpen();
      }
      setSendLoading(false);
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

  const setSendLoading = (status: boolean) => {
    store.dispatch({
      type: "common/change",
      payload: { sendLoading: status },
    });
  };

  // hack for text mismatch error in next.js
  useEffect(() => {
    setIsClient(true);
    fetchStakerData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    <div className="min-w-[450px] h-full relative">
      <div className="btn-default p-4 rounded-t-[10px] text-[#fff]">
        <div className="flex justify-between mb-2">
          <div className="flex flex-col">
            <p className="">Avaliable to stake</p>
            <p className="font-semibold text-lg">{`${stakerData.filTrustBalance} FIT`}</p>
          </div>
          <p className="h-full py-1 px-2 rounded-[10px] bg-gray-100 text-gray-500 text-sm">
            {isClient && wallet?.account && isIndent(wallet.account)}
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
          <p className="">FIG Balance</p>
          <p className="font-semibold text-lg">{`${stakerData.filGovernanceBalance} FIT`}</p>
        </div>
      </div>
      <div className="bg-white p-4 rounded-[10px] mt-[-10px]">
        <div className="">
          <InputNumber
            className="w-full"
            defaultValue={defaultAmount}
            min={1}
            max={Number(stakerData.filTrustBalance)}
            size="large"
            prefix="FIT"
            addonAfter={
              <div className="cursor-pointer" onClick={onMaxBtnClick}>
                Max
              </div>
            }
            value={amount}
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
            Expected FIG rewards from Fixed-term staking :{" "}
            <em>{expectedRewards}</em> FIG
          </p>
          <Button className="w-full" type="primary" onClick={onFarm}>
            Farm
          </Button>
        </div>
      </div>
      {/* feedback modal */}
      <ConfirmModal
        type="success"
        isOpen={isFeedbackOpen}
        title="Successfully Staked"
        // desc={`You received ${rewards} FIG`}
        onConfirm={onFeedbackClose}
      />
    </div>
  );
}

export default StakingCard;
