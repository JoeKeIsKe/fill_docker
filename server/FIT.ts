import Web3 from 'web3';
import Fill from '@/server/jsons/FILLiquid_metadata.json';
import fa from "@glif/filecoin-address";
import { Fill_contract } from '@/contract';
import { BanlanceList } from '@/constants';
import { getValueDivide } from '@/utils';
import {  Banlance_type } from '@/utils/type';
import store from '@/store';

const web3 = new Web3(window?.ethereum);
class contract {
    contractAbi: any;
    contractAddress: string;
    myContract: any;
    account: string ='';
    accountBalance: string | undefined;
    rate: number|string|undefined;
    myBorrowList: Array<any> =[];
    minerList: Record<string,any> = {};
    constructor() {
        this.contractAbi = JSON.parse(JSON.stringify(Fill.output.abi));
        this.contractAddress = Fill_contract;
        this.myContract = new web3.eth.Contract(this.contractAbi, this.contractAddress);
        this.contractBalance();
    }

    getAccountBalance() {
        return this.accountBalance;
    }



    // get banlance 
     getBalance(acc: string,type:Banlance_type) {
         this.account = acc;
         //fil 
         web3.eth.getBalance(this.account).then((res) => {
             const balance = getValueDivide(Number(res), 18, 4);
             store.dispatch({
                 type: 'contract/change',
                 payload: { FIL: balance }
             })
         });
         //fit 
        this.myContract.methods.filTrustBalanceOf(this.account).call((err: any, res: any) => {
            if (!err) {
                const FITBalance = getValueDivide(Number(res), 18);
                  store.dispatch({
                    type: 'contract/change',
                    payload: { FIT: FITBalance }
                     })                   
                }
            });
     }
    


    // allBalance() { 
    //     this.myContract.methods.allBorrows().call(async (err: any, res: any) => { 
    //            if (!err) { 
    //                const myBorrowList = []
    //                const myMinerList = Object.keys(this.minerList) || [];
                   
    //                if (myMinerList.length > 0) { 
    //                    for (const mine of myMinerList) { 
    //                     //    if(mine  ===  )
    //                     for (const item of res) { 
    //                         const minerAdr = item.minerAddr;
    //                             if (this.minerList[minerAdr] && item.account.toLocaleLowerCase() === this.account && !item.isPayback) { 
    //                                 const obj = {...item}
    //                                 const addrHex = item.minerAddr;
    //                                 const newAdree = fa.newAddress(0, utils.arrayify(utils.hexStripZeros(addrHex)));
    //                                 const filBalance = await this.callRpc("Filecoin.WalletBalance", [newAdree.toString()]); 
    //                                 obj.balanceData = filBalance;
    //                                 obj.miner_f = newAdree.toString();
    //                                 myBorrowList.push(obj)
    //                                 }
    //                         }
    //                    }
                
    //             store.dispatch({
    //                 type: 'contract/change',
    //                 payload: {
    //                     minerList: this.minerList,
    //                     borrowList:myBorrowList
    //                 }
    //             })
    //                } 
              
    //         }
    //     })
    // }


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
        })
    }

//     async callRpc(method:string, params: any) {
//     const options = {
//       method: "POST",
//       url: 'https://api.hyperspace.node.glif.io/rpc/v1',
//       headers: {
//           "Content-Type": "application/json",
//       },
//       data: JSON.stringify({
//         jsonrpc: "2.0",
//         method: method,
//         params: params,
//         id: 1,
//       }),
//     };
//         const res = await axios(options);
//         return res.data;
//   }


    
}
 

const Contract = new contract();
export default Contract;



//绑定miner _ getMinerBorrow(获取所有miner)