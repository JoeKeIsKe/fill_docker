import { getSvg } from "@/svgTypes";

function Header() { 

    return <div className="pt-20 flex items-center justify-between">
        <div>
             <h3 className="flex text-3xl font-medium items-center gap-x-2	">
            <div className="w-4 ">{ getSvg('analysis')}</div>
            Analytics：</h3>
        <div className="mt-2">Transparent data analysis, track your reward changes in real-time!</div>
        </div>
        <div className="flex text-2xl  items-center gap-x-2	">
            <h3 className="text-gray-700">Current FIL Price:</h3>
            <span className='text-2xl font-medium text-blue-focus'>$4.13</span>
        </div>
    </div>
}
export default Header;