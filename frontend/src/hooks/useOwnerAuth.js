import { useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../config/api";

const OWNER_ID = 26;

export const useOwnerAuth = (showToast, fetchItems) => {
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [loadingAction, setLoadingAction] = useState(false);

  const isOwnerAdmin = () => {
    return user?.id === OWNER_ID;
  };

  const handleWriteOperation = (actionType, id = null, data = null) => {
    if (isOwnerAdmin()) {
      setPendingAction({
        type: actionType,
        id: id,
        data: data || pendingAction?.data,
      });
      setShowAuthModal(true);
      return false;
    }
    return true;
  };

  const executePendingAction = useCallback(
    async (code) => {
      if (!pendingAction) return;

      setLoadingAction(true);
      const { type, id, data } = pendingAction;

      const config = code ? { headers: { "X-Authorization-Code": code } } : {};
      let request;
      let endpoint = `/admin/${data.endpoint}`;

      try {
        if (type === "submit") {
          const path = id ? `${endpoint}/${id}` : endpoint;
          request = id
            ? api.put(path, data.formData, config)
            : api.post(path, data.formData, config);
        } else if (type === "delete") {
          request = api.delete(`${endpoint}/${id}`, config);
        }

        await request;
        showToast(data.successMsg, "success");
        fetchItems();
      } catch (e) {
        showToast(e.response?.data?.detail || data.failureMsg, "error");
      } finally {
        setLoadingAction(false);
        setPendingAction(null);
      }
      setShowAuthModal(false);
    },
    [pendingAction, showToast, fetchItems]
  );

  const resetAuth = () => {
    setPendingAction(null);
    setShowAuthModal(false);
    setLoadingAction(false);
  };

  return {
    isOwnerAdmin,
    showAuthModal,
    loadingAction,
    handleWriteOperation,
    executePendingAction: (code) => executePendingAction(code),
    resetAuth,
  };
};
