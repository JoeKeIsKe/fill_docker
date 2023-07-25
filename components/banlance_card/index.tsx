
interface Props{
    banlance: Array<any>,
    children?: JSX.Element,
    className?:string
}

function Banlance(props: Props) { 
    const { banlance,children,className } = props
    return <div className={`w-1/2 banlance-card  rounded-2xl ${className}`}> 
                <ul className='p-5'>
                        {banlance.map((banlanceItem, index) => { 
                            return <li key={banlanceItem.value} className='flex flex-col py-4 first:border-b border-sky-600'	 >
                                <span>
                                    {banlanceItem.label} Banlance
                                </span>
                                <span className='font-medium'>
                                    {banlanceItem.value}
                                </span>
                            </li>
                            })}
                </ul>
        {children}
    </div>
}


export default Banlance