export interface ITEM { 
    label: string,
    value: string
}

export interface IWalletItem extends ITEM { 
    link?: string   
}

export interface CardItem extends ITEM { 
    render?: Function
    unit?:string
    
}

export type Banlance_type = 'FIL' | 'FIT'|'FIG'

