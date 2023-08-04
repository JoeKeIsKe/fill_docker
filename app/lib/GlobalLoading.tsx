"use client";

import { ReactNode } from "react";
import { useSelector } from "react-redux";
import { Spin } from "antd";
import { rootState } from "@/store/type";
import { LoadingOutlined } from "@ant-design/icons";

function GlobalLoading({ children }: { children: ReactNode }) {
  const { sendLoading } = useSelector((state: rootState) => state?.commonStore);
  return (
    <Spin spinning={sendLoading} indicator={<LoadingOutlined />}>
      {children}
    </Spin>
  );
}

export default GlobalLoading;
