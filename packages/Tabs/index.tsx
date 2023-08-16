import { useState, useEffect } from "react";

interface Props {
  defaultTab?: any;
  tabs: any[];
  className?: string;
  onChange?: (tabKey: string) => void;
}

function Tabs(props: Props) {
  const { tabs = [1, 2], className, defaultTab, onChange } = props;
  const [active, setActive] = useState(defaultTab || tabs[0]);

  const onTabClick = (tabKey: string) => {
    setActive(tabKey);
  };

  useEffect(() => {
    if (onChange) {
      onChange(active);
    }
  }, [active]);

  return (
    <div className={className}>
      <div className="flex gap-x-5">
        {tabs.map((item) => (
          <div
            className={`uppercase px-4 py-1 text-gray-500 rounded text-lg cursor-pointer ${
              active === item && "bg-gray-100"
            }`}
            key={item}
            style={{
              textTransform: "uppercase",
            }}
            onClick={() => onTabClick(item)}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
export default Tabs;
