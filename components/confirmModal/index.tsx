"use client";

import { Modal } from "antd";
import { ReactNode } from "react";

import WarningIcon from "@/assets/warning_icon.png";
import SuccessIcon from "@/assets/success_icon.png";
import Image from "next/image";

interface IProps {
  isOpen?: boolean;
  type?: "warning" | "success";
  title?: string;
  desc?: string | ReactNode;
  loading?: boolean;
  onCancel?: () => void;
  onConfirm?: () => void;
}

function ConfirmModal(props: IProps) {
  const { isOpen, type, title, desc, loading, onCancel, onConfirm } = props;
  const isSuccess = type === "success";

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
  };

  return (
    <Modal
      className="custom-modal"
      title=""
      open={isOpen}
      width={560}
      onCancel={handleCancel}
      cancelButtonProps={{
        style: isSuccess
          ? {
              display: "none",
            }
          : {},
      }}
      onOk={handleConfirm}
      okText={isSuccess ? "OK" : "Confirm"}
      okButtonProps={{
        className: "",
        loading,
      }}
    >
      <div className="flex flex-col items-center pt-2">
        <Image
          src={isSuccess ? SuccessIcon : WarningIcon}
          width={88}
          height={88}
          alt=""
        />
        <p className="font-semibold text-[24px] mt-[24px]">{title}</p>
        <div className="text-sm opacity-60 text-center mt-1">{desc}</div>
      </div>
    </Modal>
  );
}

export default ConfirmModal;
