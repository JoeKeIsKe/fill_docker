'use client';

import Image from 'next/image';
import logo from '@/assets/logo.svg';
import Link from 'next/link';
import { RouterList } from '@/constants';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useMetaMask } from '@/hooks/useMetaMask'

function Header() { 
    const dispath = useDispatch();
    const { connectButton } = useMetaMask()
    
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
    
    return  <>
        <div className='w-full h-12 flex items-center justify-between'>
            <Image src={logo} height={40} alt='logo' />
                <ul className='flex gap-x-5 items-center'>
                {RouterList.map(item => { 
                    return <Link className='text-[#000]' href={`/${item.value}`} key={ item.value}>{ item.label}</Link>
                })}
               { connectButton() }
        </ul> 
        
       

    </div> 
    </>
}

export default Header






