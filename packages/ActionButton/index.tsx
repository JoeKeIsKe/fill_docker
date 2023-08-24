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
      className="text-[#0093E9]"
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
