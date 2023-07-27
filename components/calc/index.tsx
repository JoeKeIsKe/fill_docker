import { getSvg } from '@/svgTypes';
import Modal from '@/packages/modal';
import { CalcItem, calcType,CALC } from './varible';
import Input from '@/packages/input';
import InputNumber from '@/packages/inputNumber';
import Button from '@/packages/button';
import { useMemo, useState } from 'react';

interface Props { 
    type: keyof CALC,
    data?:Record<string,any>
}

function Calc(props:Props) { 
    const { type, data = {} } = props;
    const [isCalc,setIsCalc] = useState(false)
    

    const renderChange = (record: CalcItem) => { 
        let content:any='';
        switch (record.type) { 
            case 'Input':
                content = <Input />
                break;
            case 'InputNumber':
                content = <InputNumber />
                break;
        }
        return <div key={ record.label}>
            <label >{record.label}</label>
            <div className='mt-2'>{content}</div>
        </div>
    }

    const typeData = useMemo(() => { 
        return calcType[type]
    }, [type])
    
    const handleChange = () => { 
        setIsCalc(false)
    }
      return (
          <>
            <div className='cursor-pointer w-4' onClick={()=> setIsCalc(true)}>{getSvg('calc')}</div>
              <Modal title='Calculate'
                show={isCalc}
                onChange={handleChange}
              >
                <div className="space-y-6">
                  {typeData.list.map((item,index) => { 
                      return renderChange(item)
                  })}
                  
                  <div className='border rounded-3xl default-card p-5'>
                      <label className='text-active'>{ typeData.rate.label}</label>  
                      <div className='font-medium'>
                        {typeData.rate.render ? typeData.rate.render(data[typeData.rate.value], data) : data[typeData.rate.value]}
                     </div>
                  </div>
                  <Button className='default-btn w-full'>{typeData.btn.label}</Button>
          </div>        
        </Modal>
          </>
  )
}

export default Calc