import { CardItem } from "@/utils/type"
import { render } from "react-dom";


interface Props { 
    record: CardItem,
    className?:string,
    data?:Record<string,any>
}

function Items(props:Props) { 
    const { record,className, data = {} } = props;
    const render = record?.render
    return <li className="flex flex-col px-4 py-2.5">
        <span className="text-gray-600">{record.label}</span>
        <span className="flex items-center mt-2 font-medium text-2xl">
            {render ? render(data[record.value], data) : data[record.value] || record.value}
        </span>
    </li>
}

export default Items