import { ColumnsType } from "antd/es/table";

export const market_title = {
    title:''
}
 
export const market_tabs = [
     {
    label: 'Borrow',
    value:'borrow',
  },
   {
    label: 'Repay',
    value:'repay',
  },
]


export interface DataType {
  key: React.ReactNode;
  name: string;
  age: number;
  address: string;
  children?: DataType[];
}

