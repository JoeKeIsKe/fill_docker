import Button from '@/packages/button';
import Modal from '@/packages/modal';
import Validation from '@/server/Validation';
import FIT_contract from "@/server/FIT";
import { LoadingOutlined } from '@ant-design/icons';
import { Steps } from 'antd';
import { useState } from 'react';
import Step1 from './Step1';
import Step2 from './Step2';
import Step3 from './Step3';
import { shallowEqual, useSelector } from 'react-redux';
import { rootState } from '@/store/type';


export default () => { 
        const account = useSelector((state: rootState) => state?.wallet?.account, shallowEqual);

    const [show, setShow] = useState(false)
    const [current, setCurrent] = useState(0);
    const [miner, setMiner] = useState<string>('');
    const [sign, setSign] = useState('');
    const [msg,setMsg]= useState('');
    const [loading,setLoading]= useState(false);


    const handleClick = async () => { 
        switch (current) { 
            //add miner get msg
            case 1:
                setLoading(true)
                const msg = await Validation.getSigningMsg(miner);
                console.log('---3', msg)
                setMsg(msg)
                setLoading(false);
                
                break;
            case 2:
                // add miner
                setLoading(true)
                console.log('----3',miner, sign)
                const ass = await FIT_contract.bindMiner(miner, sign, account);
                console.log('----333',ass)
                
            default:
                setCurrent(current + 1);
                break;
            
        }

        if (current < 2) {
            setCurrent(current+1)
        }
    }

    const handleChange = (type:string,value:string) => { 
        if (type === 'miner') { 
            setMiner(value)
        }
    }
    


    return <>
        <Button onClick={() => { setShow(true) }}>{account ? 'Add Miner +' : 'Connect wallet'}</Button> 
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
                    {current === 1 && <Step2 onChange={(value) => { setMiner(value)}}/>}
                    {current === 2 && <Step3 msg={ msg} onChange={(value) => { setSign(value)}}/>}

                    <Button className='w-1/3 mt-20' onClick={handleClick}>
                        { loading ? <LoadingOutlined />: <span>{current === 2 ? 'Add Miner' : 'Next'}</span>}
                       
                    </Button>
                </div>
               

            </div>
            
        </Modal>
            
    </>
  
}