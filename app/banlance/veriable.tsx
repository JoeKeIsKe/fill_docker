import { CardItem } from "@/utils/type"
import Calc from '@/components/calc'

//Total Credit committed
export const banlance_card = {
    banlance: [
        {
            label: 'FIL',
            value:'fil',
        },
         {
            label: 'FIT',
            value:'fit',
        }
    ]
}


export const banlance_list:Array<CardItem> = [
    {
    label:'You will receive',
    value: 'receive',
    render: (text:string) => { 
        return '--'
    }
    },
     {
    label:'Available Liquidity',
    value:'Liquidity'
    },
    {
    label:'Exp. 30D Earnings',
        value: 'Exp',
        render: () => { 
            return <span>
                <Calc type='deposit'/>
            </span>
        }
    },
]


export const FIT_banlance_tabs = [
  {
    label: 'Deposit',
    value:'deposit',
  },
   {
    label: 'WidthDrow',
    value:'reedom',
  },

]