import { InputNumber, InputNumberProps } from "antd";

interface Props {
  title?: string;
  desc?: string;
  color?: string;
}

function DescRow(props: Props) {
  const { title, desc, color } = props;

  return (
    <div className="mb-3 flex justify-between text-gray-600">
      <span className="text-gray-400">{title}</span>
      <span className="font-normal" style={{ color: color ?? "inherit" }}>
        {desc}
      </span>
    </div>
  );
}

export default DescRow;
