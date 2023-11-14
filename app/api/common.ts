import { getChartData } from "./modules/index";
import { getValueDivide, timestampToDateTime } from "@/utils";
import store from "@/store";

const type = ["1d", "7d", "1m", "3m"];

export const formatChartTime = (timestamp: number) => {
  return timestampToDateTime(timestamp, "MM-DD HH:mm");
};

export const fetchChartAndPanelData = async () => {
  const res = await getChartData();
  if (res) {
    const {
      Basic,
      Basic1Day,
      Basic7Day,
      Basic1Month,
      Basic3Month,
      Senior,
      Senior1Day,
      Senior7Day,
      Senior1Month,
      Senior3Month,
      Panel,
    } = res;
    let targetPanel: any = {};
    Object.keys(Panel).forEach((key: string) => {
      targetPanel[key] =
        typeof Panel[key] === "string"
          ? getValueDivide(Panel[key])
          : Panel[key];
    });

    const targetAPR = Basic?.slice(-8) || [];
    const dataListAPR = targetAPR.map((item: any) => item.InterestRate * 100);
    const dateListAPR = targetAPR.map((item: any) =>
      formatChartTime(item.BlockTimeStamp)
    );
    const currentAPR = Basic[Basic?.length - 1]?.InterestRate * 100;

    const targetAPY = Senior?.slice(-8) || [];
    const dataListAPY = targetAPY.map((item: any) => item.APY * 100);
    const dateListAPY = targetAPY.map((item: any) =>
      formatChartTime(item.BlockTimeStamp)
    );
    const currentAPY = Senior[Senior?.length - 1]?.APY * 100;

    store.dispatch({
      type: "panel/change",
      payload: {
        APR: {
          all: Basic,
          "1d": Basic1Day,
          "7d": Basic7Day,
          "1m": Basic1Month,
          "3m": Basic3Month,
          current: currentAPR,
        },
        APY: {
          all: Senior,
          "1d": Senior1Day,
          "7d": Senior7Day,
          "1m": Senior1Month,
          "3m": Senior3Month,
          current: currentAPY,
        },
        panel: targetPanel,
      },
    });
  }
};
