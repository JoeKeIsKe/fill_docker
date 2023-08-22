import DataFetcher from "@/server/jsons/DataFetcher_metadata.json";
import fa from "@glif/filecoin-address";
import { data_fetcher_contract } from "@/contract";
import { BanlanceList } from "@/constants";
import {
  getValueDivide,
  getBlockHeightByDuration,
  convertToStruct,
  formatUnits,
  getValueMultiplied,
} from "@/utils";
import {
  Banlance_type,
  MinerListItem,
  FilLiquidInfo,
  StakeOverview,
  BalanceType,
  ExpectedStake,
  ExpectedBorrow,
} from "@/utils/type";
import store from "@/store";
import web3 from "@/utils/web3";
import { ethers } from "ethers";

const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();

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
    // this.myContract = new ethers.Contract(
    //   this.contractAddress,
    //   this.contractAbi,
    //   signer
    // );
  }

  fetchAllData() {
    return new Promise((resolve, reject) => {
      this.myContract.methods
        .fetchData()
        .call()
        .then((res: any) => {
          if (res) {
            // data for Stake
            console.log("fetchAll Data 1111 ==>", res);
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
            const filInfo: FilLiquidInfo = {
              totalFIL: getValueDivide(Number(totalFIL), 18, 2),
              availableFIL: getValueDivide(Number(availableFIL), 18, 2),
              interestRate: getValueDivide(Number(interestRate), 6, 2),
              utilizationRate: getValueDivide(Number(utilizationRate), 6, 2),
              utilizedLiquidity: formatUnits(utilizedLiquidity),
              exchangeRate: getValueDivide(Number(exchangeRate), 6, 0),
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
          console.log("fetchPersonalData ==> ", res);
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
      this.myContract.methods[type](getValueMultiplied(amount))
        .call()
        .then((res: any) => {
          if (res) {
            const {
              expectedExchangeRate,
              expectedAmountFILTrust,
              expectedAmountFIL,
            } = res;
            const data: ExpectedStake = {
              expectedRate: getValueDivide(Number(expectedExchangeRate), 6, 1),
              expectedAmount: isStake
                ? formatUnits(expectedAmountFILTrust)
                : formatUnits(expectedAmountFIL),
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
                Number(expectedInterestRate),
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

  // following methods are not used

  contractBalance() {
    web3.eth.getBalance(this.contractAddress).then((res: any) => {
      if (res) {
        // store.dispatch({
        //     type: 'contract/change',
        //     payload: {
        //         contractBalanceRes:res,
        //         contractBalance: getValueDivide(Number(res), 18)
        //     }
        // })
      }
    });
  }
}

const Contract = new contract();
export default Contract;
