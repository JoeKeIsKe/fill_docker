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
    <div className="mb-2 flex justify-between text-[#191D23]">
      <span className="font-medium text-sm text-[#06081B] opacity-40">
        {title}
      </span>
      <span className={`text-sm ${color ? "text-linear" : ""}`}>{desc}</span>
    </div>
  );
}

export default DescRow;
