import { Collapse, } from 'antd';
import {PlusCircleOutlined ,MinusCircleOutlined} from '@ant-design/icons'
import { useState } from 'react';


const data = [
    {
        family: 'test',
        address:'1234',
        debt: 1334, 
        threshold: '86%',
        key:'1',
        children: [
            {
                miner: '1244',
                rate: 0.9,
                children: [
                    {
                        credit: '13234',
                        repay:56
                    }
                    
                ]
            }
        ]
    },
     {
        family: 'test',
        address:'1234',
         debt: 1334, 
         key:'2',
        threshold: '86%',
        children: [
            {
                miner: '1244',
                rate: 0.9,
                children: [
                    {
                        credit: '13234',
                        repay:56
                    }
                    
                ]
            }
        ]
    },

]

const familyList = [
    {
        title: 'Test',
        dataIndex: 'family',
        width:'20%'
    },
     {
        title: 'Address',
         dataIndex: 'address',
        width:'20%'
     },
      {
        title: 'Debt',
          dataIndex: 'debt',
        width:'20%'
    },
       {
        title: 'threshold',
         dataIndex: 'threshold',
    }
]
const minerList = [
    {
        title: 'miner',
        dataIndex: 'miner',
    },
     {
        title: 'Rate',
        dataIndex: 'rate',
    },
    
]
const creditList = [
    {
        title: 'Credit',
        dataIndex: 'credit',
        width:'20%',
    },
    {
        title: 'Repay',
         width:'20%',
        dataIndex: 'repay',
    },

]

export default () => { 

    const [showPlus, setShowPlus] = useState<Record<string, false | undefined>>({});
    const renderCard = (dataItem: any) => { 
        if (dataItem?.children?.length > 0) { 
            return <div className='bg-white px-5 pb-5 rounded-b-md'>
                {dataItem?.children?.map((item:any)=>{
                    return  <Collapse
                            defaultActiveKey={['1']}
                            accordion
                            items={[
                                {
                                key: '1',
                                    label: <div className='flex gap-x-5'>
                                        {minerList.map(minerItem => { 
                                            return <span className='flex gap-x-2'>
                                                    <label className='text-gary-500'>{minerItem.title}:</label>
                                                    <span className='font-meduim text-active'>{ item[minerItem.dataIndex]}</span>
                                            </span>
                                        }) }
                                    
                                </div>,
                                    children: <div>
                                        {renderCredit(item)}
                                    </div>
                                },
                            ]}
                        />
                })}
            </div>
             
        }

    }


    const renderCredit = (creditData: any) => {
        if (creditData?.children?.length > 0) { 
             return <>
             <ul className='px-4 py-2 w-full flex list-none font-medium'>
                {creditList.map(item => { 
                return <li style={{width:item?.width}} > 
                            { item.title}
                        </li>
                    })}
            </ul>
              <div className='body flex flex-col gap-y-5'>
                {creditData?.children.map((record: any) => { 
                    return  <ul className={`px-4 py-2 w-full  flex list-none rounded-lg cursor-pointer hover:bg-bgHover`}>
                                {creditList.map(item => { 
                                        return <li style={{width:item?.width}} >
                                        {record[item.dataIndex]}
                                    </li>
                                })}
                        </ul>  
                })}
             </div>
            </>
        }
     }
    
    return <div className='mt-5 '>
        <ul className='header px-4 py-2 w-full flex list-none font-medium text-xl'>
            <span className='flex items-center w-8'></span>
            {familyList.map(item => { 
            return <li style={{width:item?.width}} > 
                { item.title}
            </li>
         })}
        </ul>
        <div className='body flex flex-col gap-y-5'>
                {data.map((record: any) => { 
                    return <div>
                        <ul className={`header px-4 py-4 w-full flex cursor-pointer  list-none rounded-lg bg-bgColor hover:bg-white ${showPlus[record.key] ? 'bg-white rounded-t-md rounded-b-none' : ''}`}
                             onClick={() => {setShowPlus({...showPlus,[record.key]:!showPlus[record.key]}) } }
                        >
                            <span className='flex items-center w-8 '>
                                { showPlus[record.key] ?<MinusCircleOutlined />:<PlusCircleOutlined />}
                                
                            </span>
                                {familyList.map(item => { 
                                        return <li style={{width:item?.width}} >
                                        { record[item.dataIndex]}
                                    </li>
                                })}
                        </ul>  
                        { showPlus[record.key] && renderCard(record)}
                    </div>                 
                })}
        </div>
    </div>
}