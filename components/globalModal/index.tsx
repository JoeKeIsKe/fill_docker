import React, { useState, createContext, useContext, useMemo } from "react";
import ConfirmModal from "../confirmModal";

export const MODAL_TYPES = {
  CONFIRM_MODAL: "CONFIRM_MODAL",
  //  DELETE_MODAL: 'DELETE_MODAL',
  //  UPDATE_MODAL: 'UPDATE_MODAL'
};

const MODAL_COMPONENTS: any = {
  [MODAL_TYPES.CONFIRM_MODAL]: ConfirmModal,
  //  [MODAL_TYPES.DELETE_MODAL]: DeleteModal,
  //  [MODAL_TYPES.UPDATE_MODAL]: UpdateModal
};

type GlobalModalContext = {
  showModal: (modalProps?: any, modalType?: string) => void;
  hideModal: () => void;
  store: {
    modalType: string;
    modalProps: any;
  };
};

const initialState: GlobalModalContext = {
  showModal: () => {},
  hideModal: () => {},
  store: {
    modalType: MODAL_TYPES.CONFIRM_MODAL,
    modalProps: {},
  },
};

const GlobalModalContext = createContext(initialState);
export const useGlobalModalContext = () => useContext(GlobalModalContext);

export const GlobalModal: React.FC<any> = ({ children }) => {
  const [store, setStore] = useState(initialState.store);
  const { modalType, modalProps } = store || initialState.store;

  const showModal = (modalProps: any = {}, modalType?: string) => {
    setStore({
      ...store,
      modalType: modalType ?? MODAL_TYPES.CONFIRM_MODAL,
      modalProps,
    });
  };

  const hideModal = () => {
    // console.log("store ==> ", store);

    setStore({
      ...store,
      modalProps: {},
    });
  };

  const renderComponent = useMemo(() => {
    const ModalComponent = MODAL_COMPONENTS[modalType];
    if (!modalType || !ModalComponent) {
      return null;
    }
    return <ModalComponent id="global-modal" {...modalProps} />;
  }, [modalType, modalProps]);

  //   console.log("renderComponent ==> ", renderComponent());

  return (
    <GlobalModalContext.Provider value={{ store, showModal, hideModal }}>
      {renderComponent}
      {children}
    </GlobalModalContext.Provider>
  );
};
