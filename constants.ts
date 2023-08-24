import { ITEM, IWalletItem } from "./utils/type";

export const walletList: Array<IWalletItem> = [
  {
    value: "metamask",
    label: "Metamask",
    link: "https://metamask.io/",
  },
];

export const RouterList: Array<ITEM> = [
  {
    label: "Stake",
    value: "staking",
  },
  {
    label: "Borrow",
    value: "borrow",
  },
  {
    label: "Farming",
    value: "farming",
  },
  // {
  //   label: "Analytics",
  //   value: "analytic",
  // },
];

export const default_opt = {
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
};

export const STAKE_MONTH_OPTIONS = [
  { value: 1 / 86400, label: "for test: 1 block" },
  { value: 1, label: "1" },
  { value: 2, label: "2" },
  { value: 3, label: "3" },
  { value: 4, label: "4" },
  { value: 5, label: "5" },
  { value: 6, label: "6" },
  { value: 7, label: "7" },
  { value: 8, label: "8" },
  { value: 9, label: "9" },
  { value: 10, label: "10" },
  { value: 11, label: "11" },
  { value: 12, label: "12" },
];
