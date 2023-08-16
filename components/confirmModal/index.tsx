"use client";

import { Modal } from "antd";
import { ReactNode } from "react";

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
      title=""
      open={isOpen}
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
      <div className="flex flex-col gap-y-[10px] items-center pt-2">
        {isSuccess ? (
          <div className="text-[#039855]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-20 h-20"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        ) : (
          <div className="text-[#faad14]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-20 h-20"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
          </div>
        )}
        <p className="font-bold text-xl">{title}</p>
        <div className="text-medium text-gray-500 text-center">{desc}</div>
      </div>
    </Modal>
  );
}

export default ConfirmModal;
