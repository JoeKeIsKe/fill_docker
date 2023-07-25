import Header from './header';
import Card from '@/packages/card';
import Items from '@/packages/items';
import Staking from './staking'
import { overview,main } from './veriable';





function Analysis() { 
    return <div>
        <Header />
        <Card title='Overview' className='mt-20' >
            <>
            <ul className='flex mt-10 gap-x-4'>
                {main.map((item,index:number) => { 
                    return <Items key={index} record={item} />
                })}
            </ul>
            <ul className='flex justify-between mt-5'>
                {overview.map((item,index:number) => { 
                    return <Items key={index} record={item} />
                })}
            </ul>
            </>
        </Card>
        <Staking />
    </div>
    
}

export default Analysis