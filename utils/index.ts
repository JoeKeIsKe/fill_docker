import BigNumber from 'bignumber.js';

export function formatNumber(v: number | string, len = 4) {
      return Number(v).toLocaleString('en', { maximumFractionDigits: len })
}
export function isIndent(str: string, unit: number = 6) { 
    return str&&unit&&str.length > unit*2 ? str?.slice(0,unit)+'...'+ str?.slice(-unit):str
}
export function getValueDivide(num: number,pow:number =18,unit:number=6 ) {
  let res = new BigNumber(num || 0).dividedBy(Math.pow(10, pow));
  return res.toFixed(unit);
}