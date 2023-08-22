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

export function getChartData(params?: {}, account?: string): Promise<any> {
  return getReq({
    url: "getdata",
    params,
  });
}
