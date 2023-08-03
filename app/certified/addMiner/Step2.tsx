import { Card, Input } from "antd"

export default ({ onChange }: {onChange:(value:string)=>void}) => { 
    return <div className="h-40">
         <p className="mb-4 mt-5">Miner Address:</p>
        <Input className="h-16" onChange={(e) => { onChange(e.target.value)}} />
    </div>
}