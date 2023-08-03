import { Input } from "antd"

export default ({ sign='0171a0e402204f54ac7cba299ec1ad708b2b968f6d1917bd74773e4d91a86aa23568af98100d',onChange }: {sign?:string,onChange:(value:string)=>void}) => { 
    return <div className="h-40">
            <div className="flex flex-col mb-5">
            <span className="text-gray-500">Sign</span>
            <span className=" font-medium	text-gray-600">{sign}</span>
            <span className="text-gray-500">with owner address to propose transfer owner to SPex contract</span>
            </div>
        
            <div>
                <label htmlFor="sign" className="mb-[10px] block text-base">Sign:</label>
                <div className="relative flex h-[49px] w-full flex-row-reverse overflow-clip rounded-lg border hover:border-hover">
                <Input type="text" name="sign" className="peer w-full px-5  rounded-none transition-colors duration-300 hover:border-transparent" autoComplete="off" onChange={(e)=> { onChange(e.target.value)}}  />
                <span className="flex items-center  border border-r-0 border-[#EAEAEF] bg-slate-50 px-4 text-sm text-slate-400 transition-colors duration-300 peer-focus:border-hover peer-focus:bg-active peer-focus:text-white">0x</span>
                </div>
            </div>
     
    </div>
}