import { Input, Table } from 'antd';
import {PlusCircleOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table';
import type { TableRowSelection } from 'antd/es/table/interface';
import { useState } from 'react';
import { DataType } from "./varible";


const data = [
    {
        family: 'test',
        address:'1234',
        debt: 1334, 
        threshold: '86%',
        key:'1',
        childres: [
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
        childres: [
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


export default () => { 

    const [showPlus, setShowPlus] = useState<Record<string, false | undefined>>({});


    const renderCard = (dataItem:any) => { 

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
                            <ul className='header px-4 py-4 w-full flex  list-none rounded-lg bg-bgColor hover:bg-white'>
                            <span className='flex items-center w-8 cursor-pointer' onClick={() => {setShowPlus({...showPlus,[record.key]:true}) } }><PlusCircleOutlined /></span>
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
     
        {/* <Table
        className='mt-5'
        columns={columns}
        rowSelection={{ ...rowSelection, checkStrictly }}
        dataSource={[]}
      /> */}
    </div>
}