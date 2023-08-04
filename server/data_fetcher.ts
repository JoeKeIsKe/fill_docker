import DataFetcher from "@/server/jsons/DataFetcher_metadata.json";
import fa from "@glif/filecoin-address";
import { data_fetcher_contract } from "@/contract";
import { BanlanceList } from "@/constants";
import { getValueDivide, getBlockHeightByDuration } from "@/utils";
import { Banlance_type } from "@/utils/type";
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

  fetchStakerData(address: string) {
    return new Promise((resolve, reject) => {
      this.myContract.methods
        .fetchStakerData(address)
        .call()
        .then((res: any) => {
          // console.log("fetchStakerData res ==> ", res);
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

  // following methods are not used

  // get banlance
  getBalance(acc: string, type: Banlance_type) {
    this.account = acc;
    //fil
    web3.eth.getBalance(this.account).then((res) => {
      const balance = getValueDivide(Number(res), 18, 4);
      store.dispatch({
        type: "contract/change",
        payload: { FIL: balance },
      });
    });
    //fit
    this.myContract.methods
      .stakeFilTrust(this.account)
      .call((err: any, res: any) => {
        if (!err) {
          const FITBalance = getValueDivide(Number(res), 18);
          store.dispatch({
            type: "contract/change",
            payload: { FIT: FITBalance },
          });
        }
      });
  }

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
