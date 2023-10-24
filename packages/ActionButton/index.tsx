interface Props {
  disabled?: boolean;
  name: string;
  onClick?: (data?: any) => void;
}

function ActionButton(props: Props) {
  const { name, disabled, onClick } = props;

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };
  return (
    <a
      className={`${!disabled && "text-linear"} font-bold`}
      style={
        disabled
          ? {
              color: "rgb(209 213 219)",
              cursor: "default",
            }
          : {}
      }
      onClick={() => {
        if (disabled) return;
        handleClick();
      }}
    >
      {name}
    </a>
  );
}

export default ActionButton;
