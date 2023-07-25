'use client';

import { banlance_card,banlance_list } from './veriable';
import Banlance from '@/components/banlance_card';
import Access from './card'
import Card from "@/packages/card"
import { default_opt } from '@/constants';
import Chart from "@/components/charts";
import FIT from "@/server/FIT";
import { useContext, useEffect, useMemo } from 'react';
import { WalletState } from '@/server/content';



function Deposit() {
  const { account } = useContext<any>(WalletState);

    const contract = useMemo(() => {
        return FIT
    }, []);



    useEffect(() => { 
        if (account && contract) { 
           // contract.getBalance(account,'FIT')
        }

    },[account,contract])
    return <>
        <div className='flex gap-x-4'>
            <Banlance banlance={banlance_card.banlance} className='mt-12 rounded-lg'>
            <Access list={banlance_list} className='rounded-b-lg' />
            </Banlance>
             <Card title='Depoosit Rate' className='mt-12 w-1/2' >
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