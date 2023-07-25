import { MouseEventHandler, useCallback, useEffect, useState } from "react"
interface Props { 
    value?:number
}

function Progress(props: Props) { 
    const {value} = props
    const [width, setWidth] = useState(0)
    
    const [moveable,setMouveable] = useState(false)

    const handleMove = (e: any) => { 
        
        if (moveable) { 
            setWidth(width + e.movementX)
        }
        console.log('move', e.target, e, e.target.offsetLeft)
        setWidth(e.movementX)
        
    }

    const handleMouseDown = () => {
        setMouveable(true)



        window.addEventListener('mousemove', handleMove)

    
    }

    const handleMouseUp = useCallback(() => { 

        setMouveable(false)
        window.removeEventListener('mousemove', handleMove)
    },[])

    useEffect(() => {

        if (moveable) {
        window.addEventListener('mouseup',handleMouseUp )
    
}
        
        return () => {
            if (moveable) {
        window.removeEventListener('mouseup',handleMouseUp )
                
            }

        }


    },[moveable,handleMouseUp])



    return <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700" >
        <div className="relative bg-blue-600 h-2.5 rounded-full " style={{ width }}>
            <span className="absolute w-2 h-4 bg-red-600 -top-1 cursor-pointer" 
                onMouseDown={handleMouseDown}
                
                
                style={{ left: width }}
            ></span>
        </div>
</div>


}

export default Progress