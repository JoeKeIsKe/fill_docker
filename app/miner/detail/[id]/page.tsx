"use client";

import { useEffect, useState } from "react";
import Card from "@/packages/card";
import MinerDetailTable from "../../components/minerDetailTable";
import FIL_contract from "@/server/FILLiquid_contract";
import { MinerBorrows } from "@/utils/type";

function MinerDetail({ params }: { params: { id: string } }) {
  const [minerBorrow, setMinerBorrow] = useState<MinerBorrows | null>();

  const { id } = params;

  const getDetail = async () => {
    if (id) {
      const res: any = await FIL_contract.getMinerBorrows(id);
      setMinerBorrow(res);
    }
  };

  useEffect(() => {
    getDetail();
  }, [id]);

  return (
    <section>
      <div className="text-2xl font-bold my-8">Miner Detail</div>
      <Card>
        <div className="pt-8">
          <MinerDetailTable rawData={minerBorrow} refresh={() => getDetail()} />
        </div>
      </Card>
    </section>
  );
}

export default MinerDetail;

export async function generateStaticParams({
  params: { id },
}: {
  params: { id: string };
}) {
  return [
    {
      id,
    },
  ];
}
