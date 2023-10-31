import Stake from "@/server/jsons/FILStake_metadata.json";
import { stake_contract } from "@/contract";
import {
  getValueDivide,
  getBlockHeightByDuration,
  getValueMultiplied,
  formatUnits,
} from "@/utils";
import { StakeInfoType } from "@/utils/type";
import web3 from "@/utils/web3";

interface StakeType {
  canWithdraw: boolean;
  stake: StakeInfoType;
}

class contract {
  contractAbi: any;
  contractAddress: string;
  myContract: any;
  account: string = "";
  accountBalance: string | undefined;
  rate: number | string | undefined;
  myBorrowList: Array<any> = [];
  minerList: Record<string, any> = {};
  constructor() {
    this.contractAbi = JSON.parse(JSON.stringify(Stake.output.abi));
    this.contractAddress = stake_contract;
    this.myContract = new web3.eth.Contract(
      this.contractAbi,
      this.contractAddress
    );
  }

  onStake(amount: number, duration: number, address: string) {
    return new Promise((resolve, reject) => {
      this.myContract.methods
        .stakeFilTrust(
          getValueMultiplied(amount),
          200000000000,
          getBlockHeightByDuration(duration)
        )
        .send(
          {
            from: address,
          },
          (err: any, transactionHash: any) => {
            if (err) {
              resolve(false);
            }
          }
        )
        .then((res: any) => {
          resolve(true);
        })
        .catch((err: any) => {
          resolve(err);
        });
    });
  }

  onUnstake(id: string, address: string) {
    return new Promise((resolve, reject) => {
      this.myContract.methods
        .unStakeFilTrust(id)
        .send({
          from: address,
        })
        .then((res: any) => {
          resolve(res);
        })
        .catch((err: any) => {
          resolve(err);
        });
    });
  }

  onExpectedRewardsFromVariableTerm(id: string, address: string) {
    return new Promise((resolve, reject) => {
      this.myContract.methods
        .unStakeFilTrust(id)
        .call({
          from: address,
        })
        .then((res: any) => {
          resolve(getValueDivide(res, 18, 2));
        });
    });
  }

  onExpectedRewardsFromStake(amount: number, duration: number) {
    return new Promise((resolve, reject) => {
      this.myContract.methods
        .getCurrentMintedFromStake(
          getValueMultiplied(amount),
          getBlockHeightByDuration(duration)
        )
        .call()
        .then((res: any) => {
          if (res) {
            resolve(getValueDivide(Number(res[0]), 18, 2));
          }
        });
    });
  }

  getStakesFromStaker(address: string) {
    return new Promise((resolve, reject) => {
      this.myContract.methods
        .getStakerStakes(address)
        .call()
        .then((res: any) => {
          if (res) {
            const { stakeInfos = [] } = res;
            const list = stakeInfos
              ?.map((item: StakeType) => ({
                canWithdraw: item.canWithdraw,
                amount: getValueDivide(Number(item.stake.amount), 18, 2),
                id: item.stake.id.toString(),
                key: item.stake.id.toString(),
                start: item.stake.start,
                end: item.stake.end,
              }))
              .sort((a: any, b: any) => Number(b.id) - Number(a.id));
            resolve(list);
          }
        });
    });
  }

  getStakeStatus() {
    return new Promise((resolve, reject) => {
      this.myContract.methods
        .getStatus()
        .call()
        .then((res: any) => {
          if (res) {
            const { accumulatedStakeMint, accumulatedInterestMint } = res;
            const stakeStatus = {
              accumulatedStakeMint: formatUnits(accumulatedStakeMint),
              accumulatedInterestMint: formatUnits(accumulatedInterestMint),
            };
            resolve(stakeStatus);
          }
        });
    });
  }
}

const Contract = new contract();
export default Contract;
