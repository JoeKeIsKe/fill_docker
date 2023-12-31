import FILLiquid from "@/server/jsons/FILLiquid_metadata.json";
import { Fill_liquid_contract } from "@/contract";
import { getValueDivide, getValueMultiplied, formatUnits } from "@/utils";
import { UserBorrow, MinerBorrows } from "@/utils/type";
import store from "@/store";
import web3 from "@/utils/web3";
import BigNumber from "bignumber.js";

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
    this.contractAbi = JSON.parse(JSON.stringify(FILLiquid.output.abi));
    this.contractAddress = Fill_liquid_contract;
    this.myContract = new web3.eth.Contract(
      this.contractAbi,
      this.contractAddress
    );
  }

  getUserBorrow(account: string) {
    this.account = account;
    this.myContract.methods
      .userBorrows(account)
      .call()
      .then((res: any) => {
        if (res) {
          const r = res;
          const list = r.minerBorrowInfo.map((item: any) => ({
            availableBalance: getValueDivide(
              item?.availableBalance?.neg ? 0 : item?.availableBalance?.value,
              18,
              2
            ),
            balance: formatUnits(item.balance),
            borrowSum: formatUnits(item.borrowSum),
            debtOutStanding: getValueDivide(
              Number(item.debtOutStanding),
              18,
              2
            ),
            haveCollateralizing: item.haveCollateralizing,
            minerId: item.minerId.toString(),
            borrows: item?.borrows?.length,
          }));

          const userBorrow: UserBorrow = {
            user: r.user,
            availableCredit: getValueDivide(r.availableCredit, 18, 2),
            balanceSum: formatUnits(r.balanceSum),
            borrowSum: formatUnits(r.borrowSum),
            debtOutStanding: getValueDivide(r.debtOutStanding, 18, 2),
            liquidateConditionInfo: {
              rate: getValueDivide(
                Number(r.liquidateConditionInfo.rate) * 100,
                6,
                2
              ),
              alertable: r.liquidateConditionInfo.alertable,
              liquidatable: r.liquidateConditionInfo.liquidatable,
            },
            minerBorrowInfo: list,
          };
          store.dispatch({
            type: "contract/change",
            payload: { userBorrow },
          });
        }
      });
  }

  // stake & unstake
  async onStakeOrUnstake(
    amount: number | string,
    slippage: number | string,
    tabKey: string,
    account?: string
  ) {
    const isStake = tabKey === "stake";
    const type = isStake ? "deposit" : "redeem";
    const slippageParam = getValueMultiplied(slippage, 18);
    const amountParam = getValueMultiplied(amount, 18);
    const params = isStake ? [slippageParam] : [amountParam, slippageParam];
    return new Promise((resolve, reject) => {
      this.myContract.methods[type](...params)
        .send(
          {
            from: account,
            value: isStake ? amountParam : undefined,
          },
          (err: any, res: any) => {
            if (err) {
              resolve(false);
              throw new Error(err);
            }
          }
        )
        .on("receipt", (res: any) => {
          const returnValues =
            res?.events?.[isStake ? "Deposit" : "Redeem"]?.returnValues;
          const result = {
            amountFIL: returnValues?.amountFIL,
            amountFIT: returnValues?.amountFILTrust,
          };
          resolve(result);
        });
    });
  }

  getMinerBorrows(minerId: number | string) {
    return new Promise((resolve, reject) => {
      this.myContract.methods
        .minerBorrows(minerId)
        .call()
        .then((res: any) => {
          if (res) {
            const minerBorrows: MinerBorrows = {
              minerId: res.minerId,
              debtOutStanding: getValueDivide(
                Number(res.debtOutStanding),
                18,
                6
              ),
              balance: getValueDivide(Number(res.balance), 18, 6),
              borrowSum: getValueDivide(Number(res.borrowSum), 18, 6),
              availableBalance: res.availableBalance.neg
                ? 0
                : getValueDivide(Number(res.availableBalance?.value), 18, 6),
              haveCollateralizing: res.haveCollateralizing,
              borrows: res.borrows,
            };

            resolve(minerBorrows);
          }
        });
    });
  }

  // borrow
  async onBorrow(
    minerId: number | string,
    amount: number | string,
    expectInterestRate: string
  ) {
    const params = [
      minerId,
      getValueMultiplied(amount),
      getValueMultiplied(Number(expectInterestRate) / 100, 6),
    ];
    return new Promise((resolve, reject) => {
      this.myContract.methods
        .borrow(...params)
        .send(
          {
            from: this.account,
          },
          (err: any, res: any) => {
            if (err) {
              resolve(false);
              throw new Error(err);
            }
          }
        )
        .on("receipt", (res: any) => {
          const returnValues = res?.events?.["Borrow"]?.returnValues;
          const result = {
            amountFIL: getValueDivide(returnValues?.amountFIL || 0),
          };
          resolve(result);
        });
    });
  }

  // repay - from miner
  async onRepayFromMiner(
    minerIdPayer: string,
    minerIdPayee: string,
    amount: number | string
  ) {
    const params = [minerIdPayer, minerIdPayee, getValueMultiplied(amount)];
    return new Promise((resolve, reject) => {
      this.myContract.methods
        .withdraw4Payback(...params)
        .send(
          {
            from: this.account,
          },
          (err: any, res: any) => {
            if (err) {
              resolve(false);
              throw new Error(err);
            }
          }
        )
        .on("receipt", (res: any) => {
          const returnValues = res?.events?.["Payback"]?.returnValues;
          resolve({
            amount: getValueDivide(
              BigNumber(returnValues?.principal || 0)
                .plus(returnValues?.interest || 0)
                .decimalPlaces(6, 1)
                .toNumber() || 0
            ),
          });
        });
    });
  }

  // repay - from wallet / repay - for others
  async onRepayFromWallet(
    minerId: string,
    amount: string | number,
    account?: string
  ) {
    if (account) {
      this.account = account;
    }
    return new Promise((resolve, reject) => {
      this.myContract.methods
        .directPayback(minerId)
        .send(
          {
            from: this.account,
            value: getValueMultiplied(amount),
          },
          (err: any, res: any) => {
            if (err) {
              resolve(false);
              throw new Error(err);
            }
          }
        )
        .on("receipt", (res: any) => {
          const returnValues = res?.events?.["Payback"]?.returnValues;
          resolve({
            amount: getValueDivide(
              BigNumber(returnValues?.principal || 0)
                .plus(returnValues?.interest || 0)
                .decimalPlaces(6, 1)
                .toNumber() || 0
            ),
          });
        });
    });
  }

  async onLiquidate(
    minerIdPayer: number | string,
    minerIdPayee: number | string
  ) {
    const params = [minerIdPayee, minerIdPayer];
    return new Promise((resolve, reject) => {
      this.myContract.methods
        .liquidate(...params)
        .send(
          {
            from: this.account,
          },
          (err: any, res: any) => {
            if (err) {
              resolve(false);
              throw new Error(err);
            }
          }
        )
        .on("receipt", () => {
          resolve(true);
        });
    });
  }

  getFamilyByMiner(minerId: number | string) {
    return new Promise((resolve, reject) => {
      this.myContract.methods
        .minerUser(minerId)
        .call()
        .then((res: any) => {
          if (res) {
            const addressList = res;
            resolve(addressList);
          }
        });
    });
  }

  getBorrowPayBackFactors() {
    return new Promise((resolve, reject) => {
      this.myContract.methods
        .getBorrowPayBackFactors()
        .call()
        .then((res: any) => {
          if (res) {
            resolve(getValueDivide(res[3], 6));
          }
        });
    });
  }

  //bind miner
  bindMiner(minerAddr: string, signature: string, account: string) {
    this.account = account;
    return new Promise((resolve) => {
      this.myContract.methods
        .collateralizingMiner(minerAddr, "0x" + signature)
        .send(
          {
            from: this.account,
          },
          (err: any, res: any) => {
            if (err) {
              resolve(false);
              throw new Error(err);
            }
          }
        )
        .on("receipt", (data: any) => {
          resolve(true);
        });
    });
  }

  //unbind miner
  unBindMiner(minerId: string, account: string) {
    this.account = account;
    return new Promise((resolve) => {
      this.myContract.methods
        .uncollateralizingMiner(minerId)
        .send(
          {
            from: this.account,
          },
          (err: any, res: any) => {
            if (err) {
              resolve(false);
              throw new Error(err);
            }
          }
        )
        .on("receipt", (data: any) => {
          resolve(true);
        });
    });
  }
}

const Contract = new contract();
export default Contract;
