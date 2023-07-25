'use client';

import Image from 'next/image';
import logo from '@/assets/logo.svg';
import Link from 'next/link';
import Button from '@/packages/button';
import Wallet from '@/components/wallet';
import { RouterList } from '@/constants';
import { useContext, useMemo, useState } from 'react';
import { WalletState } from '@/server/content';
import { isIndent } from '@/utils';

function Header() { 
      const walletStore: any = useContext(WalletState);

    const [isOpen,setIsOpen] = useState<boolean>(false)

    const account = useMemo(() => { 
        
        return walletStore.account;
    }, [walletStore.account])
    
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
                {account ? <Button>{isIndent(account)}</Button>: <Wallet /> }
               
        </ul> 
        
       

    </div> 
    </>
}

export default Header






