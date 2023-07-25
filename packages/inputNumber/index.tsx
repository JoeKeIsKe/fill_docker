interface Props { 
    suffix?: JSX.Element,
    placeholder?:string
}
function InputNumber(props: Props) { 
    const { suffix,placeholder='' } = props;

    const styles = {
        paddingRight:suffix? '100px':''
    }
    return <div className="relative">
            <input type="number"
            className={`block w-full p-4 ${suffix ? 'pr-12' : 'pr-4'}
            ring-offset-0 ring-0
            text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:border-sky-600 shadow-transparent`}
            style={{...styles}}
            placeholder={ placeholder}
            required />  
        
        {suffix && <div className="custom_icon_right">{ suffix}</div>}
        
    </div>
        
     
}

export default InputNumber