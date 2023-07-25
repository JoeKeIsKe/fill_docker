'use client';
import {useDispatch } from "react-redux";
import { walletList } from '@/constants';
import { getSvg } from '@/svgTypes';
import Modal from '@/packages/modal';
import { IWalletItem } from '@/utils/type';
import { loginMarck } from '@/server/wallet';


export default function DefaultModal() {
//   const dispath = useDispatch();
    
    const connectWallet = async (wallet:IWalletItem) => { 
        console.log('connectWallet');
        loginMarck()?.then(res => { 
            console.log('===33', res)
            if (res && Array.isArray(res)) {
                 localStorage.setItem('account', JSON.stringify(res[0]))
                // dispath({
                //     type: "wallet/change",
                //     payload: {
                //     wallet: wallet.value,
                //     result: res,
                //     },
                // });
            }
            
        })
    }

    return (
         <Modal title='Connect Wallet'
                btn_text ='Connect'
                footer={false}  >
                <div className="space-y-6">
                 {walletList.map((wallet:IWalletItem) => {
                 return (
                        <p
                            className='flex items-center gap-x-2.5 p-2.5 rounded cursor-pointer hover:bg-slate-200'
                            key={wallet.value}
                             onClick={() => connectWallet(wallet)}
                            >
                            <span className='icon'>{getSvg(`wallect_${wallet.value}`)}</span>
                            {wallet.label}
                        </p>
                        );
                 })}
          </div>        
        </Modal>
  )
}



