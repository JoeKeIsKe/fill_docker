import { PropsWithChildren } from "react";

interface Props {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

function Card(props: Props) {
  const { title, children, className } = props;

  return (
    <div className={`card-default ${className}`}>
      {title && <h3 className="title">{title}</h3>}
      {children}
    </div>
  );
}
export default Card;
