'use client';
import {useDispatch } from "react-redux";
import { walletList } from '@/constants';
import { getSvg } from '@/svgTypes';
import Modal from '@/packages/modal';
import { IWalletItem } from '@/utils/type';
import { loginMarck, getChainId } from '@/server/wallet';
import Button from "@/packages/button";
import { useState } from "react";


export default function DefaultModal() {
    const dispath = useDispatch();
    const [isConnect,setConnect] = useState<boolean>(false)
    
    const connectWallet = async (wallet:IWalletItem) => { 
        console.log('connectWallet');
        const chainId = await getChainId()
        dispath({
            type: "wallet/change",
            payload: {
                chainId
            },
        }); 
        loginMarck()?.then(res => { 
        if (res && Array.isArray(res)) {
            dispath({
                type: "wallet/change",
                payload: {
                wallet: wallet.value,
                account: res[0],
                },
            });           
        }     
        })
    }

    const handleChange = () => { 
        setConnect(false)
    }

    return (
        <>
            <Button onClick={()=>setConnect(true)}>Connect Wallet</Button>
            <Modal
                onCancel={()=>setConnect(false)}
                show={isConnect}
                title='Connect Wallet'
               // footer={[{ label: 'Connect', value: 'confirm', className: 'w-full mt-5', onClick={handleChange} }]}
                onChange={handleChange}
            >
            <div className="space-y-6 mt-5">
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
        </>
  )
}



