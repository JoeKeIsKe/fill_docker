import { InputNumber, InputNumberProps } from "antd";

interface Props extends InputNumberProps {
  className?: string;
  label?: string;
  maxButton?: boolean;
  onChange?: (val: any) => void;
}

function NumberInput(props: Props) {
  const { className, label, maxButton = false, onChange, ...rest } = props;

  const handleChange = (val: any) => {
    if (onChange) {
      onChange(val);
    }
  };

  return (
    <div className="mt-4">
      {label && (
        <label
          className="text-lg"
          style={{ display: "inline-block", marginBottom: "3px" }}
        >
          {label}
        </label>
      )}
      <div className="relative">
        <InputNumber
          className={`w-full ${className}`}
          size="large"
          controls={false}
          onChange={handleChange}
          {...rest}
        />
        {maxButton && (
          <div
            className="absolute cursor-pointer px-2 py-1 bg-gray-100 rounded text-gray-500"
            style={{ top: "10px", right: "20px", zIndex: 10 }}
          >
            Max
          </div>
        )}
      </div>
    </div>
  );
}

export default NumberInput;
