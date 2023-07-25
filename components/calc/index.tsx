import { walletList } from '@/constants';
import { getSvg } from '@/svgTypes';
import Modal from '@/packages/modal';
import { CalcItem, calcType,CALC } from './varible';
import Input from '@/packages/input';
import InputNumber from '@/packages/inputNumber';
// import { Progress } from 'flowbite-react';
import Progress from '@/packages/progress'
import Button from '@/packages/button';
import { useMemo } from 'react';

interface Props { 
    type: keyof CALC,
    data?:Record<string,any>
}

function Calc(props:Props) { 
    const { type, data = {} } = props;
    

    const renderChange = (record: CalcItem) => { 
        let content:any='';
        switch (record.type) { 
            case 'Input':
                content = <Input />
                break;
            case 'InputNumber':
                content = <InputNumber />
                break;
            case 'Progress':
                content=<Progress value={10} />
        }
        return <div key={ record.label}>
            <label >{record.label}</label>
            <div className='mt-2'>{content}</div>
        </div>
    }

    const typeData = useMemo(() => { 
        return calcType[type]
    },[type])
      return (
         <Modal title='Calculate'
              btn_text='Connect'
              btn={<span className='cursor-pointer'>{getSvg('calc')}</span>}
                footer={false} >
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
  )
}

export default Calc