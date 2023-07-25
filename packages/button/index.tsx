

interface Props { 
    children: JSX.Element|string,
    onClick?: () => void,
    className?:string
}

function Button(props: Props) { 
    const { children,onClick, className } = props;
   

    return <button className={`btn-primary  btn-default ${className}`} onClick={(e) => {
        if (!onClick) { 
            return e.stopPropagation()
        }
        onClick()
    }}>{ children}</button>
}
export default Button