import { getSvg } from "@/svgTypes"
import { FIT_banlance_tabs } from "./veriable"

function Header({ active,onChange,currentRate }: {currentRate:number|string,active:string,onChange:(value:string)=>void}) { 
    return <div className="pt-20 flex items-center justify-between">
            <div>
                 <h3 className="flex text-3xl font-medium items-center gap-x-2">
                <div className="w-4 text-hover ">{getSvg('holders')}</div>
                {FIT_banlance_tabs.map(( item,index:number ) => { 
                    return <div key={index}>
                        <span key={item.value} onClick={() => { onChange(item.value) }}
                            className={`cursor-pointer  hover:text-hover ${active === item.value ? 'text-active' : ''}`}> {item.label}</span> 
                        {index === 0 && <span className="mx-2">/ </span> }
                    </div>
                })}
                 </h3>
                <div className="mt-2">Transparent data analysis, track your reward changes in real-time!</div>
             </div>
            <div className="flex text-2xl  items-center gap-x-2	">
                <h3 className="text-gray-700">Current Rate:</h3>
            <span className='text-2xl font-medium text-blue-focus'>{ currentRate}</span>
            </div>
         </div>
}


export default Header