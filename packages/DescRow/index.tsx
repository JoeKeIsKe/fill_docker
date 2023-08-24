interface Props {
  title?: string;
  desc?: string;
  color?: string;
  noSpace?: boolean;
}

function DescRow(props: Props) {
  const { title, desc, color, noSpace = false } = props;
  return noSpace ? (
    <div className="w-1/2 text-sm flex flex-wrap gap-x-1">
      <span>{title}:</span>
      <span>{desc}</span>
    </div>
  ) : (
    <div className="mb-3 flex justify-between text-gray-600">
      <span className="text-gray-400">{title}</span>
      <span className="font-normal" style={{ color: color ?? "inherit" }}>
        {desc}
      </span>
    </div>
  );
}

export default DescRow;
