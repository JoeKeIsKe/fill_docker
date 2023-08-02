import Web3 from 'web3';
import Fill from '@/server/jsons/FILLiquid_metadata.json';
import fa from "@glif/filecoin-address";
import { Fill_contract } from '@/contract';
import { BanlanceList } from '@/constants';
import { getValueDivide, getValueMultiplied } from '@/utils';
import {  Banlance_type } from '@/utils/type';
import store from '@/store';
import web3 from "@/utils/web3";
import { notification } from 'antd';

// const web3 = new Web3(window?.ethereum);
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
    }





      // get banlance 
     getBalance(acc: string) {
         
         this.account = acc;
         //fil 
         web3.eth.getBalance(this.account).then((res) => {
             const balance = getValueDivide(Number(res), 18, 4);
             console.log('----FILBalance',balance)
             store.dispatch({
                 type: 'contract/change',
                 payload: { FIL: balance }
             })
         });
         //fit 
         this.myContract.methods.filTrustBalanceOf(this.account).call().then((res: any) => {
             if (res) {
                 const FITBalance = getValueDivide(Number(res), 18);
                 console.log('----FITBalance',res)
                 store.dispatch({
                     type: 'contract/change',
                     payload: { FIT: FITBalance }
                 })
             }
         });
     }
    
      // get  current rate
     getCurrentRate() { 
         //get current rate 
       this.myContract.methods.exchangeRate().call().then((res:any) => { 
           console.log('----3', res)
           if (res) { 
                store.dispatch({
                    type: 'contract/change',
                    payload: {
                        currentRate:getValueDivide(Number(res), 6),
                    }
                })
           }
        })
     }
    
     //access or  redeem
     async access(type: string,value: string | number,accept:number|string) { 
         const number = getValueMultiplied(value, 18);
         const acceptValue = getValueMultiplied(accept,6)
          const obj = type === 'deposit' ? {
            value:number
          } : {}
         console.log('====3=44',this.myContract.methods[type])
        return new Promise((resolve, reject) => { 
             this.myContract.methods[type](number,acceptValue).send({
                 from: this.account,
                ...obj
         },
            (err: any, res: any) => {
                if (err) { 
                resolve(true);
                throw new Error(err);
                }
            }).on('receipt', (data: any) => {
             console.log('receipt success', data)
             // success
            //     const typeStr = type === 'deposit' ? 'Deposit' : 'Redeem';
            //     const notiStr = type === 'deposit' ? 'Deposit' : 'Redemption';
            //  const returnValue = data.events[typeStr].returnValues;
            //  // FIT/FIL
            //  const value = getValueDivide(Number(returnValue[2]), 18)
            // notification.open({
            //     message: "",
            //     description: `${notiStr} is completed, ${value} ${type === 'deposit' ?'FIT received':'FIL withDrawn' }`,
            //     duration: 10,
            //     className: "app-notic",
            // });
            // //this.getBalance(this.account);
            //  return resolve(true);
                this.getBalance(this.account);
            }).on('error', (err: any, res: any) => { 
                throw new Error(err);
            })
        })
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



