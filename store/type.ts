import { FilLiquidInfo, StakeOverview, UserBorrow } from "@/utils/type";

export interface ITEM {
  label: string;
  key: string;
  link?: string;
  width?: string;
  render?: Function;
}

export interface userState {
  public_key: string;
  id: string | number;
  account?: number;
  [key: string]: any;
}

export interface contractState {
  account?: number | string;
  FIL: number | string;
  FIT: number | string;
  currentRate: number | string;
  loading: boolean;
  minerList: Record<string, any>;
  borrowList: Array<any>;
  contractBalance?: number;
  contractBalanceRes?: number;
  userBorrow?: UserBorrow;
  filInfo?: FilLiquidInfo;
  stakeOverview?: StakeOverview;
  balance: {
    FIL: number | string;
    FIT: number | string;
  };
}

export interface creditState {
  show: boolean;
}

export interface walletState {
  wallet?: string;
  account?: any;
  chainId?: string;
}
export interface commonState {
  refreshStakeData: boolean;
  refreshAllData: boolean;
  sendLoading: boolean;
}
export interface rootState {
  contract: contractState;
  user: userState;
  wallet: walletState;
  commonStore: commonState;
  credit: creditState;
}
