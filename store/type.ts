import { FilLiquidInfo, UserBorrow, MinerListItem } from "@/utils/type";

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
  ownFamilyList?: UserBorrow[];
  filInfo?: FilLiquidInfo;
  balance: {
    FIL: number | string;
    FIT: number | string;
  };
}

export interface PanelObject {
  TotalFIL: string;
  FitTotalSupply: string;
  UtilizationRate: number;
  FIL_FIT: number;
  AvailableFIL: string;
  UtilizedLiquidity: string;
  InterestRate: number;
  FigTotalSupply: string;
  AccumulatedStakeMint: string;
  AccumulatedInterestMint: string;
}

interface BasicItem {
  BlockTimeStamp: number;
  UtilizationRate: number;
  FIL_FIT: number;
  InterestRate: number;
  AccumulatedInterestMint: string;
  AccumulatedStakeMint: string;
}

export interface panelState {
  APY: {
    all: BasicItem[];
    "1d": BasicItem[];
    "7d": BasicItem[];
    "1m": BasicItem[];
    "3m": BasicItem[];
    current: number | string;
  };
  APR: {
    all: BasicItem[];
    "1d": BasicItem[];
    "7d": BasicItem[];
    "1m": BasicItem[];
    "3m": BasicItem[];
    current: number | string;
  };
  panel: PanelObject;
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
  sendLoading: {
    [key in string]: boolean;
  };
}

export interface rootState {
  contract: contractState;
  user: userState;
  wallet: walletState;
  panel: panelState;
  commonStore: commonState;
  credit: creditState;
}
