import { CardItem } from "@/utils/type"

export interface CalcItem extends CardItem { 
    type: "Input" | "Progress" | 'InputNumber',
    render?:Function

}

export interface CALC {
    deposit: {
        list: Array<CalcItem>
        btn: CardItem,
        rate: CardItem
    },
    redeem: {
        list: Array<CalcItem>
        btn: CardItem,
        rate: CardItem
    }
}

export const calcType: CALC = {
    'deposit': {
        list:[
        { label: 'FIL Deposit', value: '',type:'Input' },
        { label: 'Minaccptex Rate', value: '',type:'InputNumber' },
        ],
        btn: {
            label: 'Deposit',
            value:'deposit',
        },
        rate: {
            label: 'ROI AT CURRENT APY',
            value:'deposit rate',
            render: (text:string) => { 
                return '123FIT'
            }
        }
    },
     'redeem': {
        list:[
        { label: 'FIL Redeem', value: '',type:'Input' },
        { label: 'Minaccptex Rate', value: '',type:'InputNumber' },
        ],
        btn: {
            label: 'Redeem',
            value:'redeem',
        },
        rate: {
            label: 'ROI AT CURRENT APY',
            value:'Redeem rate',
            render: (text:string) => { 
                return '123FIT'
            }
        }
    }
}