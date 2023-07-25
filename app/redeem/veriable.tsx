import { CardItem } from "@/utils/type"
import Calc from '@/components/calc'

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
    value: '',
    render: (text:string) => { 
        return '--'
    }
    },
     {
    label:'Available Liquidity',
    value:''
    },
    {
    label:'Exp. 30D Earnings',
        value: '',
        render: () => { 
            return <span>
                <Calc type='redeem' data={{}}/>
            </span>
        }
    },
]