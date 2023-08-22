"use client";

import { useState, useCallback } from "react";
import { useSelector, shallowEqual } from "react-redux";
import { rootState } from "@/store/type";
import store from "@/store";

function useLoading() {
  const { sendLoading } = useSelector(
    (state: rootState) => state?.commonStore,
    shallowEqual
  );

  const setSendLoading = (status: boolean) => {
    store.dispatch({
      type: "common/change",
      payload: { sendLoading: status },
    });
  };

  return { sendLoading, setSendLoading };
}

export default useLoading;
