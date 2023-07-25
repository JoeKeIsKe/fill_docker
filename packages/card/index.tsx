interface Porps { 
    title?: string,
    children: JSX.Element,
    className?: string
}



function Card(props: Porps) { 
    const {title,children ,className} = props

    return <div className={`bg-white rounded-lg p-5 ${className}`}>
        {title && <h3 className="text-3xl">{title}</h3>}
        { children}
    </div>

}
export default Card 