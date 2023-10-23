import * as echarts from "echarts/core";
import { BarChart, LineChart } from "echarts/charts";
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  // 数据集组件
  DatasetComponent,
  // 内置数据转换器组件 (filter, sort)
  TransformComponent,
} from "echarts/components";
import { LabelLayout, UniversalTransition } from "echarts/features";
import { CanvasRenderer } from "echarts/renderers";
import type {
  // 系列类型的定义后缀都为 SeriesOption
  BarSeriesOption,
  LineSeriesOption,
} from "echarts/charts";
import type {
  // 组件类型的定义后缀都为 ComponentOption
  TitleComponentOption,
  TooltipComponentOption,
  GridComponentOption,
  DatasetComponentOption,
} from "echarts/components";
import type { ComposeOption } from "echarts/core";
import { useEffect, useRef, memo } from "react";

// 通过 ComposeOption 来组合出一个只有必须组件和图表的 Option 类型
type ECOption = ComposeOption<
  | BarSeriesOption
  | LineSeriesOption
  | TitleComponentOption
  | TooltipComponentOption
  | GridComponentOption
  | DatasetComponentOption
>;

// 注册必须的组件
echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  BarChart,
  LineChart,
  LabelLayout,
  UniversalTransition,
  CanvasRenderer,
]);

let chart: any = null;

//ECOption
interface Props {
  height?: string;
  option: Record<string, any>;
}

const Chart = memo((props: Props) => {
  // 1. get DOM
  const chartRef = useRef(null);

  const { height, option } = props;
  useEffect(() => {
    // 2. 实例化表格对象
    if (chart != null && chart != "" && chart != undefined) {
      chart.dispose();
    }
    chart = echarts.init(chartRef.current as unknown as HTMLDivElement);
    // chart = echarts.init(document.getElementById("chart"));
    // 3. 定义数据
    const defaultOption = {
      backgroundColor: "transparent",
      color: "#4094E0",
      grid: {
        top: 15,
        left: "2%",
        right: "4.5%",
        bottom: 0,
        containLabel: true,
      },
      yAxis: {
        type: "value",
        min: 0,
      },
    };
    // 4. 调用表格数据
    chart?.setOption({ ...defaultOption, ...option });
  }, [option]);

  useEffect(() => {
    const handleSize = () => {
      chart?.resize();
    };
    window?.addEventListener("resize", handleSize);
    return () => {
      window?.removeEventListener("resize", handleSize);
    };
  }, []);

  return (
    <div
      id="chart"
      style={{ width: "100%", height: height ?? "80%", minHeight: "260px" }}
      ref={chartRef}
    />
  );
});

export default Chart;
