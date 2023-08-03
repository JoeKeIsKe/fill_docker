'use client';
import { Input } from "antd";
import { useState } from "react";
import {SearchOutlined } from '@ant-design/icons'
import Credit from "./Credit";
import Header from "./Header";
import { market_tabs } from "./varible";

export default () => { 
    const [active,setActive] = useState('borrow')
    return <>
        <Header />
        <div className="flex justify-between items-center mt-12">
               <h3 className="flex  text-2xl font-medium items-center gap-x-2 ">
                {market_tabs.map(( item,index:number ) => { 
                    return <div key={index}>
                        <span key={item.value} onClick={() => { setActive(item.value) }}
                            className={`cursor-pointer  hover:text-hover ${active === item.value ? 'text-active' : ''}`}> {item.label}</span> 
                            {index === 0 && <span className="mx-2">/ </span> }
                    </div>
                })}               
                </h3>   
             <Input size="large" className='custom_input w-80 h-9 bg-transparent hover:border-parmas' placeholder="search" prefix={<SearchOutlined />} />
        </div>
      
        <Credit />
    </>
}