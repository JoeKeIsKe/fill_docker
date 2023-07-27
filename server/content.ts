import { Banlance_type } from "@/utils/type";
import { createContext } from "react";




type banlance_type  = 'FIL_banlance'|'FIT_banlance'|'FIG_banlance'
 const FillState:any = createContext({
    FIL_banlance: 0,
    FIT_banlance: 0,
    FIG_banlance: 0,
    setBanlance: (type:Record<banlance_type,number>) => { }
});


export  {FillState}