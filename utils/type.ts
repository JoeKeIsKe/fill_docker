export interface ITEM {
  label: string;
  value: string;
}

export interface IWalletItem extends ITEM {
  link?: string;
}

export interface CardItem extends ITEM {
  render?: Function;
  unit?: string;
}

export type Banlance_type = "FIL" | "FIT" | "FIG";

export interface StakeInfoType {
  amount: string | number;
  end: number;
  start: number;
  key: string;
  id: string;
}

export interface StakeOverview {
  fitTotalSupply: string | number;
}

export interface BalanceType {
  filBalance: string | number;
  filTrustBalance: string | number;
}

export interface FilLiquidInfo {
  totalFIL: string | number;
  availableFIL: string | number;
  utilizationRate: string | number;
  interestRate: string | number;
  utilizedLiquidity: string | number;
  exchangeRate: string | number;
}

export interface UserBorrow {
  user: string;
  availableCredit: string | number;
  balanceSum: string | number;
  borrowSum: string | number;
  debtOutStanding: string | number;
  liquidateConditionInfo: {
    rate: string | number;
    alertable: boolean;
    liquidatable: boolean;
  };
  minerBorrowInfo?: MinerListItem[];
}

export interface MinerBorrows {
  minerId: string | number;
  debtOutStanding: string | number;
  balance: string | number;
  borrowSum: string | number;
  availableBalance: string | number;
  haveCollateralizing: boolean;
  borrows: any[];
}

export interface MinerListItem {
  availableBalance: string | number;
  balance: string | number;
  minerId: string;
  debtOutStanding: string | number;
  borrowSum: string | number;
  haveCollateralizing: boolean;
  borrows?: any[];
}

export interface MinerDetailItem {
  interest: string | number;
  borrowAmount: string | number;
  id: string;
  interestRate: string | number;
  remainingOriginalAmount: string | number;
}

export interface ExpectedStake {
  expectedAmount: string | number;
  expectedRate: string | number;
}

export interface ExpectedBorrow {
  expectedInterestRate: string | number;
  expected6monthInterest: string | number;
}

export interface BorrowModalData {
  minerId: number | string;
  familyInfo: {
    user: string;
    debtOutstanding: number | string;
    availableCredit: number | string;
    ratio: number | string;
  };
}

export interface RepayModalData {
  miner: MinerListItem | null;
  familyInfo: {
    user: string;
    availableCredit: number | string;
  };
  minerList: MinerListItem[];
}
