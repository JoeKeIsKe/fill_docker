import BigNumber from "bignumber.js";
import dayjs from "dayjs";

export function formatNumber(v: number | string, len = 4) {
  return Number(v).toLocaleString("en", { maximumFractionDigits: len });
}
export function isIndent(str: string, unit: number = 6) {
  return str && unit && str.length > unit * 2
    ? str?.slice(0, unit) + "..." + str?.slice(-unit)
    : str;
}
export function getValueDivide(
  num: number,
  pow: number = 18,
  unit: number = 6
) {
  let res = new BigNumber(num || 0).dividedBy(Math.pow(10, pow));
  return res.toFixed(unit);
}

export function getBlockHeightByDuration(duration: number) {
  // 30 secs equal 1 block height
  // 1 mon queals 86400 block height
  return duration * 86400;
}

export function getValueMultiplied(num: number | string, pow: number = 18) {
  return new BigNumber(num).multipliedBy(Math.pow(10, pow)).toFixed(0);
}

export function getValueToFixed(num: string | number, unit: number = 2) {
  return Number(new BigNumber(Number(num || 0)).toFixed(unit, 1));
}

const FILECOIN_GENESIS_UNIX_EPOCH = 1598306400;
const FILECOIN_GENESIS_UNIX_EPOCH_TEST = 1667297580;

// get the time for a given block height
export function heightToUnix(filEpoch: number, network?: string) {
  return (
    filEpoch * 30 +
    (network === "test"
      ? FILECOIN_GENESIS_UNIX_EPOCH_TEST
      : FILECOIN_GENESIS_UNIX_EPOCH)
  );
}

export function heightToDate(inputHeight: number, network?: string) {
  const timestamp = heightToUnix(inputHeight, network) * 1000;
  return dayjs(timestamp).format("YYYY-MM-DD");
}

export function heightToDateTime(inputHeight: number, network?: string) {
  const timestamp = heightToUnix(inputHeight, network) * 1000;
  return dayjs(timestamp).format("YYYY-MM-DD HH:mm:ss");
}

export function timestampToDateTime(timestamp: number) {
  return dayjs(timestamp * 1000).format("YYYY-MM-DD HH:mm:ss");
}

// convertToStruct takes an array type eg. Inventory.ItemStructOutput and converts it to an object type.
export const convertToStruct = <A extends Array<unknown>>(
  arr: A
): ExtractPropsFromArray<A> => {
  const keys = Object.keys(arr).filter((key) => isNaN(Number(key)));
  const result: any = {};
  // @ts-ignore
  arr.forEach((item, index) => (result[keys[index]] = item));
  return result as A;
};

// This is to remove unnecessary properties from the output type. Use it eg. `ExtractPropsFromArray<Inventory.ItemStructOutput>`
export type ExtractPropsFromArray<T> = Omit<
  T,
  keyof Array<unknown> | `${number}`
>;

export const formatUnits = (val: any) => {
  // return ethers.utils.formatUnits(val);
  return getValueDivide(Number(val), 18, 2);
};

export const formatResult = (res: any) => {
  const r = convertToStruct(res);
};

export const formatBalance = (rawBalance: string) => {
  const balance = (parseInt(rawBalance) / 1000000000000000000).toFixed(2);
  return balance;
};
