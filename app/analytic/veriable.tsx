import { CardItem } from "@/utils/type";

//Total Credit committed
export const main: CardItem[] = [
        {
        label: 'Net APY',
        value: '10%',
        render: (text:string|number) => {
            return <span className="text-red-600">10.89%</span> 
         }
    },
    {
        label: 'TVL',
        value: '2.90',
        render: (text:string|number) => {
            return <span className="text-green-600">$3.88</span> 
         }
    },
    
]
export const overview:CardItem[] = [
    {
        label: 'Available Liquidity',
        value: '203,864.54 FIL',
        
    },
    {
        label: 'Total',
        value: '532,818.83 FIL',
        render: (text:string|number) => {
            return <span className="text-foucs">532,818.83 FIL</span> 
         }
    },
        {
        label: 'Credit',
        value: '10%',
    },
    {
        label: 'committed',
        value: '390/30',
    },
]

export const staking_total = {
    label: 'Total Supply',
    value:'850,499.68 FIL'
}