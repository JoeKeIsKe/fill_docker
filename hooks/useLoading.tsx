"use client";

import { useState, useCallback, useEffect } from "react";
import { useSelector, shallowEqual } from "react-redux";
import { rootState } from "@/store/type";
import store from "@/store";

function useLoading(id?: string) {
  const target = id || "default";
  const { sendLoading } = useSelector(
    (state: rootState) => state?.commonStore,
    shallowEqual
  );
  const loading: boolean = sendLoading[target] || false;

  const setLoading = useCallback((status: boolean) => {
    store.dispatch({
      type: "common/change",
      payload: {
        sendLoading: {
          [target]: status,
        },
      },
    });
  }, []);

  return { loading, setLoading };
}

export default useLoading;
