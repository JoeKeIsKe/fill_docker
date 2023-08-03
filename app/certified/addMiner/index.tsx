import Button from '@/packages/button';
import Modal from '@/packages/modal';
import { Steps } from 'antd';
import { useState } from 'react';
import Step1 from './Step1';
import Step2 from './Step2';
import Step3 from './Step3';


export default () => { 
    const [show, setShow] = useState(false)
    const [current, setCurrent] = useState(0);
    const [miner, setMiner] = useState('');
    const [sign, setSign] = useState('');
    const [loading,setLoading]= useState(false);


    const handleClick = () => { 
        if (current === 2) {
            //confirm
            setLoading(true)
            // setShow(false)
        } else { 
              setCurrent(current+1)
        }
      
    }
    


    return <>
        <Button onClick={() => {setShow(true) }}>Add Miner +</Button> 
        <Modal width={1000}  className='w-full' title='add Miner' show={show} onCancel={() => {setShow(false) } }>
            <div className='my-4 border-t px-5 border-slate-300	'>
                <Steps
                type="navigation"
                size="small"
                current={current}
                className="site-navigation-steps custom_steps"
                items={[
                    {
                    status: 'process',
                    title: 'Change Beneficiary',
                    description:'Step 1'
                },
                {
                    title: 'minerID',
                    description:'Step 2'
                },
                {
                    title: 'Messages',
                    description:'Step 3'
                },
                ]}
                />
                <div className='mt-5'>
                    {current === 0 && <Step1 />}
                    {current === 1 && <Step2 onChange={(value) => {setMiner(value)}}/>}
                    {current === 2 && <Step3  onChange={(value) => { setSign(value)}}/>}

                    <Button className='w-1/3 mt-20' onClick={handleClick}>
                        <span>{current === 2 ? 'Confirm' : 'Next'}</span>
                    </Button>
                </div>
               

            </div>
            
        </Modal>
            
    </>
  
}