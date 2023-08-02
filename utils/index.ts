import BigNumber from "bignumber.js";
import dayjs from 'dayjs'

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

// const FILECOIN_GENESIS_UNIX_EPOCH = 1598306400
const getChainId = async () => {
  return await window?.ethereum.request({ method: 'eth_chainId' });
}
const chainId = getChainId()

const FILECOIN_GENESIS_UNIX_EPOCH = 1598306400
const FILECOIN_GENESIS_UNIX_EPOCH_TEST = 1667297580

// get the time for a given block height
export function heightToUnix (filEpoch: number, network?:string) {
  return (filEpoch * 30) + (network === 'test' ? FILECOIN_GENESIS_UNIX_EPOCH_TEST :  FILECOIN_GENESIS_UNIX_EPOCH)
}

export function heightToDate (inputHeight: number, network?:string) {
  const timestamp = heightToUnix(inputHeight, network) * 1000
  return dayjs(timestamp).format('YYYY-MM-DD')
}
