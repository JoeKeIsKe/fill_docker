import {InputNumber } from "antd"

export default ({ rate,onChange }: {rate:string|number,onChange:(value:number|string|null)=>void}) => { 


    return <InputNumber value={rate} onChange={ (value)=>onChange(value)} className="w-28" />
}