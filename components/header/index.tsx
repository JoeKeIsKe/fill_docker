'use client';

import Image from 'next/image';
import logo from '@/assets/logo.svg';
import Link from 'next/link';
import Button from '@/packages/button';
import Wallet from '@/components/wallet';
import { RouterList } from '@/constants';
import { useEffect, useMemo, useState } from 'react';
import { isIndent } from '@/utils';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { rootState } from '@/store/type';
import Account from './account';

function Header() { 
    const dispath = useDispatch();
    const [isOpen,setIsOpen] = useState<boolean>(false)
    const wallet = useSelector((state: rootState) => state?.wallet, shallowEqual);
    
    useEffect(() => {
        const wallet_login = JSON.parse(localStorage?.getItem('login') || '{}');
        if (wallet_login?.account) { 
             dispath({
                type: "wallet/change",
                payload: {
                wallet: wallet_login.wallet,
                account: wallet_login.account,
                },
            });
        }
    }, [])
    

    const account = useMemo(() => { 
        return wallet.account
    },[wallet.account])
    
        const handleChange = (isOpen:boolean,data?:any) => { 
            setIsOpen(isOpen)
        }

    return  <>
        <div className='w-full h-12 flex items-center justify-between'>
            <Image src={logo} height={40} alt='logo' />
                <ul className='flex gap-x-5 items-center'>
                {RouterList.map(item => { 
                    return <Link href={`/${item.value}`} key={ item.value}>{ item.label}</Link>
                })}
                {account ? <Account account={ account} />: <Wallet /> }
               
        </ul> 
        
       

    </div> 
    </>
}

export default Header






