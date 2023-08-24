import * as echarts from "echarts/core";
import { BarChart, LineChart, PieChart } from "echarts/charts";
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
import React, { useEffect, useRef, memo } from "react";

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
  PieChart,
  LabelLayout,
  UniversalTransition,
  CanvasRenderer,
]);

//ECOption
interface Props {
  option: Record<string, any>;
}

let pieChart: any = null;

const PieChartComponent = memo((props: Props) => {
  const { option } = props;
  // 1. get DOM
  const chartRef = useRef(null);

  useEffect(() => {
    if (pieChart != null && pieChart != "" && pieChart != undefined) {
      pieChart.dispose();
    }
    // 2. 实例化表格对象
    pieChart = echarts.init(chartRef.current as unknown as HTMLDivElement);
    // 3. 定义数据
    const defaultOption = {
      backgroundColor: "transparent",
      tooltip: {},
    };
    // 4. 调用表格数据
    pieChart.setOption({ ...defaultOption, ...option });
  }, [option]);

  useEffect(() => {
    const handleSize = () => {};
    window?.addEventListener("resize", handleSize);
    return () => {
      window?.removeEventListener("resize", handleSize);
    };
  }, []);

  return (
    <div
      id="pie_chart"
      style={{ width: "100%", height: "90%", minHeight: "100px" }}
      ref={chartRef}
    />
  );
});

export default PieChartComponent;
