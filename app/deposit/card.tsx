
import { Input} from 'antd'
import Button from '@/packages/button'


interface Props { 
    list: Array<any>
    className?: string
}


function Accect(props: Props) { 
    const {list,className='' } = props
    const handleChange = () => { 
        console.log('---maxwell')
    }

    return <div className={`bg-white rounded-t-2xl p-4 ${className}`}>
          <Input suffix={ 
            <span className='bg-red-700 px-2.5 py-2.5 rounded cursor-pointer' onClick={handleChange}>Max</span>
        } />  
        <ul className='mt-5 flex gap-y-2 flex-col'>
          {list.map(item => { 
              return <li key={ item.value} className='flex justify-between'>
                <span className='text-gray-600 text-sm	'>{item.label}</span>
                <span className='text-base text-black'>{ item.render? item.render(): item.value}</span>
            </li>
        })}
        </ul>
      <Button className='w-full mt-4 btn-default'>Deposit</Button>

</div>


}

export default Accect