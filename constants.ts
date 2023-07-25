import { Banlance_type, ITEM, IWalletItem } from "./utils/type";

export const BanlanceList:Record<Banlance_type ,Array<Banlance_type>>  = {
  "FIT": ['FIL', 'FIT'],
  "FIG": ["FIT", 'FIG'],
  "FIL": ['FIL', 'FIT']
}


export const walletList:Array<IWalletItem> = [
  {
    value: "metamask",
    label: "Metamask",
    link: "https://metamask.io/",
  },
];

export const  RouterList:Array<ITEM> = [
    {
        label: 'Overview',
        value:'analytic'
    },
  
      {
        label: 'Deposit/WidthDraw',
        value:'deposit'
    },
    {
        label: 'Borrow/Reply',
        value:'cried'
    },
     {
        label: 'FIG',
        value:'other'
    },
      

]



export const  default_opt = {
      backgroundColor: "transparent",
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: [
          "2022-08",
          "2022-09",
          "2022-10",
          "2022-11",
          "2022-12",
          "2023-01",
          "2023-02",
        ],
      },

      series: [
        {
          data: [10, 30, 20, 60, 40, 65, 70],
            type: "line",
          areaStyle: undefined,
        },
      ],
    }