import { getSvg } from "@/svgTypes"
import AddMiner from './addMiner'


export default () => { 
    return <div className="pt-20 flex items-center justify-between ">
            <div className="w-3/5">
                 <h3 className="flex text-2xl font-medium items-center gap-x-2">
                <div className="w-4 text-hover ">{getSvg('holders')}</div>
                Miner Account Market
                 </h3>
            <div className="mt-2 text-slate-600	">
                Allowing Storage Providers to implement securely trustless account trading, optimize capital efficiency, select special ID numbers, etc.
            </div>
        </div>
        <AddMiner />
        
         </div>
}

//a236119922b56c51a437b22495000a770291382bce51718516a99d8b5b7ab86f27d9c6296530d092d5495a43a56028e60ac074e2e52a6ec556a2cbb113955440977fc6d6df2d4ce577bbcb924e85a87fcc903a71a8ea5a4e9ff11a680da75cf4