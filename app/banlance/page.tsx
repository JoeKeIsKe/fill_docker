'use client';

import { banlance_card,banlance_list } from './veriable';
import Banlance from '@/components/banlance_card';
import Access from './card'
import Card from "@/packages/card"
import { default_opt } from '@/constants';
import Chart from "@/components/charts";
import FIT_contract from "@/server/FIT";
import { useEffect, useMemo, useState } from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { rootState } from '@/store/type';
import Header from './Header'


function Deposit() {
    const account = useSelector((state: rootState) => state?.wallet?.account, shallowEqual);
        const FIT_banlance = useSelector((state: rootState) => state?.contract?.FIT, shallowEqual);
        const FIL_banlance = useSelector((state: rootState) => state?.contract?.FIL, shallowEqual);


    const [active,setActive] = useState('deposit');





    useEffect(() => { 
        if (account ) { 
         FIT_contract.getBalance(account,'FIT')
        }

    }, [account])
    
    return <>
        <Header active={active} onChange={(value) => { setActive(value)}}/>
        <div className='flex gap-x-4 mt-20'>
            <Banlance banlance={banlance_card.banlance} className='rounded-lg'>
            <Access list={banlance_list} className='rounded-b-lg' />
            </Banlance>
             <Card title='Depoosit Rate' className=' w-1/2' >
           <Chart option={default_opt }/>
            </Card>
        </div>
         <Card title='Depoosit' className='mt-20' >
        <div className="mt-10">
            <Chart option={default_opt }/>
            </div>
        </Card>
    </>

}
export default Deposit