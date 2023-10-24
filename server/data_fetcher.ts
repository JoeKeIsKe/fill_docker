import DataFetcher from "@/server/jsons/DataFetcher_metadata.json";
import { data_fetcher_contract } from "@/contract";
import {
  getValueDivide,
  formatUnits,
  getValueMultiplied,
  getStorage,
} from "@/utils";
import {
  FilLiquidInfo,
  StakeOverview,
  BalanceType,
  ExpectedStake,
  ExpectedBorrow,
  UserBorrow,
} from "@/utils/type";
import store from "@/store";
import web3 from "@/utils/web3";

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
    this.contractAbi = JSON.parse(JSON.stringify(DataFetcher.output.abi));
    this.contractAddress = data_fetcher_contract;
    this.myContract = new web3.eth.Contract(
      this.contractAbi,
      this.contractAddress
    );
  }

  fetchAllData() {
    return new Promise((resolve, reject) => {
      this.myContract.methods
        .fetchData()
        .call()
        .then((res: any) => {
          if (res) {
            // data for Stake
            // console.log("fetchAll Data ==>", res);
            const { fitTotalSupply }: StakeOverview = res;
            const stakeOverview: StakeOverview = {
              fitTotalSupply: formatUnits(fitTotalSupply),
            };
            // data for Borrow
            const {
              totalFIL,
              availableFIL,
              interestRate,
              utilizationRate,
              utilizedLiquidity,
              exchangeRate,
            }: FilLiquidInfo = res.filLiquidInfo;
            console.log("exchangeRate ==> ", exchangeRate);

            const filInfo: FilLiquidInfo = {
              totalFIL: getValueDivide(Number(totalFIL), 18, 2),
              availableFIL: getValueDivide(Number(availableFIL), 18, 2),
              interestRate: getValueDivide(Number(interestRate) * 100, 6, 2),
              utilizationRate: getValueDivide(
                Number(utilizationRate) * 100,
                6,
                2
              ),
              utilizedLiquidity: formatUnits(utilizedLiquidity),
              exchangeRate: getValueDivide(Number(exchangeRate), 6, 2),
            };
            store.dispatch({
              type: "contract/change",
              payload: { stakeOverview, filInfo },
            });
          }
        });
    });
  }

  fetchPersonalData(account: string) {
    this.myContract.methods
      .fetchPersonalData(account)
      .call()
      .then((res: any) => {
        if (res) {
          const { filBalance, filTrustBalance }: BalanceType = res;
          const balance = {
            FIL: formatUnits(filBalance),
            FIT: formatUnits(filTrustBalance),
          };
          store.dispatch({
            type: "contract/change",
            payload: { balance },
          });
        }
      });
  }

  fetchStakerData(address: string) {
    return new Promise((resolve, reject) => {
      this.myContract.methods
        .fetchStakerData(address)
        .call()
        .then((res: any) => {
          if (res) {
            const {
              filGovernanceBalance,
              filTrustBalance,
              filTrustFixed,
              filTrustVariable,
            } = res;
            const data = {
              filTrustBalance: getValueDivide(filTrustBalance, 18, 2),
              filTrustFixed: getValueDivide(filTrustFixed, 18, 2),
              filTrustVariable: getValueDivide(filTrustVariable, 18, 2),
              filGovernanceBalance: getValueDivide(filGovernanceBalance, 18, 2),
            };
            resolve(data);
          }
        })
        .catch((err: any) => {
          console.log("err ==> ", err);
        });
    });
  }

  getStakeOrUnstakeExpecting(amount: number | string, tabKey: string) {
    const isStake = tabKey === "stake";
    const type = isStake ? "getDepositExpecting" : "getRedeemExpecting";
    return new Promise((resolve, reject) => {
      this.myContract.methods[type](getValueMultiplied(amount)) // to do:
        .call()
        .then((res: any) => {
          if (res) {
            const data: ExpectedStake = {
              expectedAmount: formatUnits(res),
            };
            resolve(data);
          }
        })
        .catch((err: any) => {
          console.log("err ==> ", err);
        });
    });
  }

  getBorrowExpecting(amount: number | string) {
    return new Promise((resolve, reject) => {
      this.myContract.methods
        .getBorrowExpecting(getValueMultiplied(amount))
        .call()
        .then((res: any) => {
          if (res) {
            const { expectedInterestRate, sixMonthInterest } = res;
            const data: ExpectedBorrow = {
              expectedInterestRate: getValueDivide(
                Number(expectedInterestRate) * 100,
                6,
                2
              ),
              expected6monthInterest: getValueDivide(sixMonthInterest),
            };
            resolve(data);
          }
        })
        .catch((err: any) => {
          console.log("err ==> ", err);
        });
    });
  }

  getMaxBorrowable(minerId: string | number) {
    return new Promise((resolve, reject) => {
      this.myContract.methods
        .maxBorrowAllowed(minerId)
        .call()
        .then((res: any) => {
          const num = getValueDivide(res, 18, 6);
          resolve(num);
        })
        .catch((err: any) => {
          console.log("err ==> ", err);
        });
    });
  }

  getBatchedFamily(accounts: string[]) {
    return new Promise((resolve, reject) => {
      this.myContract.methods
        .getBatchedUserBorrows(accounts)
        .call()
        .then((res: any) => {
          if (res) {
            const l = res?.map((r: UserBorrow) => {
              const list = r.minerBorrowInfo?.map((item: any) => ({
                availableBalance: getValueDivide(
                  item?.availableBalance?.neg
                    ? 0
                    : item?.availableBalance?.value,
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
              return {
                user: r.user,
                availableCredit: getValueDivide(
                  Number(r.availableCredit),
                  18,
                  2
                ),
                balanceSum: formatUnits(r.balanceSum),
                borrowSum: formatUnits(r.borrowSum),
                debtOutStanding: getValueDivide(
                  Number(r.debtOutStanding),
                  18,
                  2
                ),
                liquidateConditionInfo: {
                  rate: getValueDivide(
                    Number(r.liquidateConditionInfo?.rate) * 100,
                    6,
                    2
                  ),
                  alertable: r.liquidateConditionInfo?.alertable,
                  liquidatable: r.liquidateConditionInfo?.liquidatable,
                },
                minerBorrowInfo: list,
              };
            });
            resolve(l);
          }
        })
        .catch((err: any) => {
          console.log("err ==> ", err);
        });
    });
  }
}

const Contract = new contract();
export default Contract;
