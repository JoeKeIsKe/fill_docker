import { postReq, putReq, getReq, delReq, patchReq } from "../abstract";

// // post buy market page api
// export function postBuyMessages(
//   miner_id: number,
//   data: { buyer: string }
// ): Promise<any> {
//   return postReq({
//     url: `/api/v1/spex/list-miners/${miner_id}/buy`,
//     data,
//   });
// }

export function getChartData(params?: {}): Promise<any> {
  return getReq({
    url: "api/getdata",
    params,
  });
}

export function getBorrowingsFamily(params?: {}): Promise<any> {
  return getReq({
    url: "api/getFamilyCount",
    params,
  });
}

export function getDataFromFilscan(params?: {}): Promise<any> {
  return postReq({
    url: "https://api-cali.filscan.io/api/v1/AccountInfoByID", //  https://api-v2.filscan.io/api/v1/AccountInfoByID
    data: params,
  });
}
