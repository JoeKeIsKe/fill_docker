"use client"
import Chart from "@/components/charts"
import Card from "@/packages/card"
import Items from '@/packages/items';
import { staking_total } from './veriable'

const default_opt = {
      backgroundColor: "transparent",
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: [
          "2022-08",
          "2022-09",
          "2022-10",
          "2022-11",
          "2022-12",
          "2023-01",
          "2023-02",
        ],
      },

      series: [
        {
          data: [10, 30, 20, 60, 40, 65, 70],
            type: "line",
          areaStyle: undefined,
        },
      ],
    }

function Staking() { 
    return  <Card title='Staking Pool Info' className='mt-20' >
        <div className="mt-10">
            <div className="mb-5">
              <Items  record={staking_total} />
            </div>
            <Chart option={default_opt }/>
            </div>
           
        </Card>
}

export default Staking