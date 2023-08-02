
import { Input} from 'antd'
import Button from '@/packages/button'
import Accept from './Accept';
import FIT_contract from "@/server/FIT";
import { shallowEqual, useSelector } from 'react-redux';
import { rootState } from '@/store/type';
import { useEffect, useState } from 'react';


interface Props { 
    list: Array<any>
    className?: string,
    type:string
}


function Accect(props: Props) { 
    const currentRate = useSelector((state: rootState) => state?.contract?.currentRate, shallowEqual);
    const { list,type, className = '' } = props;
    const [rate, setRate] = useState(currentRate)
    const [value, setValue] = useState('')
    useEffect(() => { 
        setRate(currentRate)
    },[currentRate])
    
    const handleChange = () => { 
        console.log('---maxwell')
    }

    const handleClick = () => { 
        console.log('--click-',type)
        if (value && rate) { 
        //deposit or redeem
             FIT_contract.access(type,value,rate)
        }
       

    }

    return <div className={`bg-white rounded-t-2xl p-4 ${className}`}>
        <Input
            value={value}
            onChange={ (e)=>setValue(e.target.value)}
            suffix={ 
            <span className='bg-red-700 px-2.5 py-2.5 rounded cursor-pointer' onClick={handleChange}>Max</span>
        } />  
        <ul className='mt-5 flex gap-y-2 flex-col'>
            {list.map(item => { 
              return <li key={ item.value} className='flex justify-between'>
                  <span className='text-gray-600 text-sm	'>{item.label}</span>
                  {item.value === 'accept' ? <Accept rate={rate} onChange={(value:any) => { setRate(value)}} /> : <span className='text-base text-black'>{ item.render? item.render(): item.value}</span>}
                
            </li>
        })}
        </ul>
      <Button className='w-full mt-4 btn-default' onClick={handleClick}>Deposit</Button>

</div>


}

export default Accect