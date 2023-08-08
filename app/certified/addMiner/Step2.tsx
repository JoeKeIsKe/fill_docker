import Input from '@/packages/custom_input'
export default ({ onChange }: {onChange:(value:string)=>void}) => { 
    return <div className="h-40">
        <p className="mb-4 mt-5">Miner Address:</p>
        <Input className="h-16" suffixText='t0' onChange={(value) => {onChange(value)}} />
    </div>
}