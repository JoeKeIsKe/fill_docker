import { Input } from "antd"
import Custom_Input from '@/packages/custom_input'


export default ({ onChange,suffixText,className='' }: {className?:string,suffixText:string,onChange:(value:string)=>void}) => { 
    return <div className={`relative flex h-[49px] w-full flex-row-reverse overflow-clip rounded-lg border hover:border-hover,${className}`}>
                <Input type="text" name="sign" className="peer w-full px-5  rounded-none transition-colors duration-300 hover:border-transparent" autoComplete="off" onChange={(e)=> { onChange(e.target.value)}}  />
                <span className="flex items-center  border border-r-0 border-[#EAEAEF] bg-slate-50 px-4 text-sm text-slate-400 transition-colors duration-300 peer-focus:border-hover peer-focus:bg-active peer-focus:text-white">{ suffixText}</span>
                </div>
}