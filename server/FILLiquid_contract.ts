import Web3 from "web3";
import FILLiquid from "@/server/jsons/FILLiquid_metadata.json";
import fa from "@glif/filecoin-address";
import { Fill_liquid_contract } from "@/contract";
import { BanlanceList } from "@/constants";
import {
  getValueDivide,
  getValueMultiplied,
  convertToStruct,
  formatUnits,
} from "@/utils";
import {
  Banlance_type,
  MinerListItem,
  UserBorrow,
  MinerBorrows,
} from "@/utils/type";
import store from "@/store";
import web3 from "@/utils/web3";
import { ethers } from "ethers";
import { notification } from "antd";
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
              rate: getValueDivide(r.liquidateConditionInfo.rate, 6, 2),
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
    rate: number | string,
    tabKey: string,
    account: string
  ) {
    const isStake = tabKey === "stake";
    const type = isStake ? "deposit" : "redeem";
    const rateParam = getValueMultiplied(rate, 6);
    const amountParam = getValueMultiplied(amount, 18);
    const params = isStake ? [rateParam] : [amountParam, rateParam];
    return new Promise((resolve, reject) => {
      this.myContract.methods[type](...params)
        .send(
          {
            from: account,
            value: isStake ? amountParam : undefined,
          },
          (err: any, res: any) => {
            if (err) {
              resolve(true);
              throw new Error(err);
            }
          }
        )
        .on("receipt", () => {
          resolve(true);
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
      getValueMultiplied(expectInterestRate, 6),
    ];
    console.log("borrow params ==> ", params);

    return new Promise((resolve, reject) => {
      this.myContract.methods
        .borrow(...params)
        .send(
          {
            from: this.account,
          },
          (err: any, res: any) => {
            if (err) {
              resolve(true);
              throw new Error(err);
            }
          }
        )
        .on("receipt", () => {
          resolve(true);
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
    console.log("onRepay params ==> ", params);

    return new Promise((resolve, reject) => {
      this.myContract.methods
        .withdraw4Payback(...params)
        .send(
          {
            from: this.account,
          },
          (err: any, res: any) => {
            if (err) {
              resolve(true);
              throw new Error(err);
            }
          }
        )
        .on("receipt", () => {
          resolve(true);
        });
    });
  }

  // repay - from wallet
  async onRepayFromWallet(minerId: string, amount: string | number) {
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
              resolve(true);
              throw new Error(err);
            }
          }
        )
        .on("receipt", () => {
          resolve(true);
        });
    });
  }

  async onLiquidate(
    minerIdPayer: number | string,
    minerIdPayee: number | string
  ) {
    const params = [minerIdPayer, minerIdPayee];
    console.log("liquidate params ==> ", params);

    return new Promise((resolve, reject) => {
      this.myContract.methods
        .liquidate(...params)
        .send(
          {
            from: this.account,
          },
          (err: any, res: any) => {
            if (err) {
              resolve(true);
              throw new Error(err);
            }
          }
        )
        .on("receipt", () => {
          resolve(true);
        });
    });
  }

  //access or  redeem
  // async access(type: string, value: string | number, accept: number | string) {
  //   const number = getValueMultiplied(value, 18);
  //   const acceptValue = getValueMultiplied(accept, 6);
  //   const obj =
  //     type === "deposit"
  //       ? {
  //           value: number,
  //         }
  //       : {};
  //   console.log("====3=44", this.myContract.methods[type]);
  //   return new Promise((resolve, reject) => {
  //     this.myContract.methods[type](number, acceptValue)
  //       .send(
  //         {
  //           from: this.account,
  //           ...obj,
  //         },
  //         (err: any, res: any) => {
  //           if (err) {
  //             resolve(true);
  //             throw new Error(err);
  //           }
  //         }
  //       )
  //       .on("receipt", (data: any) => {
  //         console.log("receipt success", data);
  //         // success
  //         //     const typeStr = type === 'deposit' ? 'Deposit' : 'Redeem';
  //         //     const notiStr = type === 'deposit' ? 'Deposit' : 'Redemption';
  //         //  const returnValue = data.events[typeStr].returnValues;
  //         //  // FIT/FIL
  //         //  const value = getValueDivide(Number(returnValue[2]), 18)
  //         // notification.open({
  //         //     message: "",
  //         //     description: `${notiStr} is completed, ${value} ${type === 'deposit' ?'FIT received':'FIL withDrawn' }`,
  //         //     duration: 10,
  //         //     className: "app-notic",
  //         // });
  //         // //this.getBalance(this.account);
  //         //  return resolve(true);
  //         // this.getBalance(this.account);
  //       })
  //       .on("error", (err: any, res: any) => {
  //         throw new Error(err);
  //       });
  //   });
  // }

  //bind miner
  bindMiner(minerAddr: string, signature: string, account: string) {
    this.account = account;
    return new Promise((resolve) => {
      console.log("====3", minerAddr, "0x" + signature);
      this.myContract.methods
        .collateralizingMiner(minerAddr, "0x" + signature)
        .send(
          {
            from: this.account,
          },
          (err: any, res: any) => {
            if (err) {
              console.log(err);
              // resolve(true);
              throw new Error(err);
            }
          }
        )
        .on("receipt", (data: any) => {
          resolve(true);
          console.log("receipt success", data);
        })
        .on("error", (err: any, res: any) => {
          throw new Error(err);
        });
    });
  }

  //unbind miner
  unBindMiner(account: string) {
    this.account = account;
    return new Promise((resolve) => {
      this.myContract.methods
        .uncollateralizingMiner("29299")
        .send(
          {
            from: this.account,
          },
          (err: any, res: any) => {
            if (err) {
              console.log(err);
              // resolve(true);
              throw new Error(err);
            }
          }
        )
        .on("receipt", (data: any) => {
          resolve(true);
          console.log("receipt success", data);
        })
        .on("error", (err: any, res: any) => {
          throw new Error(err);
        });
    });
  }
}

const Contract = new contract();
export default Contract;
