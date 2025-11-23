import { useState, useEffect } from "react";
import { MainLayout } from "../../components/layouts";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import api from "../../config/api";
import Toast from "../../components/ui/Toast";
import OwnerAuthorizationModal from "../../components/ui/AuthorizationModal";
import { useOwnerAuth } from "../../hooks/useOwnerAuth";
import { useTranslation } from "react-i18next";

const AdminAdditives = () => {
  const { t } = useTranslation();
  const [additives, setAdditives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    category: "",
    safety_level: "safe",
    description: "",
    health_risks: "",
  });
  const [total, setTotal] = useState(0);
  const [toast, setToast] = useState({
    isOpen: false,
    message: "",
    type: "success",
  });
  const showToast = (message, type = "success") =>
    setToast({ isOpen: true, message, type });

  const fetchAdditives = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/additives");
      setAdditives(data.data);
      setTotal(data.total || 0);
    } catch (e) {
      showToast(t("admin.additive.errorLoad"), "error");
    } finally {
      setLoading(false);
    }
  };

  const {
    isOwnerAdmin,
    showAuthModal,
    handleWriteOperation,
    executePendingAction,
    resetAuth,
  } = useOwnerAuth(showToast, fetchAdditives);

  useEffect(() => {
    fetchAdditives();
  }, []);

  const openModal = (additive = null) => {
    if (additive) {
      setEditMode(true);
      setCurrentId(additive.id);
      setFormData(additive);
    } else {
      setEditMode(false);
      setCurrentId(null);
      setFormData({
        name: "",
        code: "",
        category: "",
        safety_level: "safe",
        description: "",
        health_risks: "",
      });
    }
    setShowModal(true);
  };

  const handleCreateOrUpdate = () => {
    const actionData = {
      endpoint: "additives",
      formData: formData,
      successMsg: editMode
        ? t("admin.additive.successUpdate")
        : t("admin.additive.successCreate"),
      failureMsg: t("admin.common.operationFailed"),
    };
    if (
      isOwnerAdmin() &&
      !handleWriteOperation("submit", currentId, actionData)
    ) {
      setShowModal(false);
      return;
    }
    executePendingAction();
    setShowModal(false);
  };

  const handleDelete = (id) => {
    if (!confirm(t("admin.additive.confirmDelete"))) return;
    const actionData = {
      endpoint: "additives",
      successMsg: t("admin.additive.successDelete"),
      failureMsg: t("common.errorDelete"),
    };
    if (isOwnerAdmin() && !handleWriteOperation("delete", id, actionData)) {
      return;
    }
    executePendingAction();
  };

  const getSafetyColor = (level) => {
    switch (level) {
      case "safe":
        return "bg-success/10 text-success";
      case "moderate":
        return "bg-warning/10 text-warning-text";
      case "avoid":
        return "bg-error/10 text-error";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const translateSafety = (level) => {
    return t(`admin.additive.${level}`);
  };

  return (
    <MainLayout>
      <div className="bg-bg-base min-h-screen py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-extrabold text-text-primary">
                {t("admin.additive.title")}
              </h1>
              <p className="text-text-secondary">
                {t("admin.additive.total", { count: additives.length })}
              </p>
            </div>
            <Button onClick={() => openModal()}>
              {t("admin.additive.add")}
            </Button>
          </div>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-bg-base border-b border-border">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-text-secondary uppercase">
                      {t("admin.additive.name")}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-text-secondary uppercase">
                      {t("admin.additive.code")}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-text-secondary uppercase">
                      {t("admin.additive.category")}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-text-secondary uppercase">
                      {t("admin.additive.safety")}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-text-secondary uppercase">
                      {t("common.actions")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center">
                        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                      </td>
                    </tr>
                  ) : additives.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-6 py-8 text-center text-text-secondary"
                      >
                        {t("admin.common.noData")}
                      </td>
                    </tr>
                  ) : (
                    additives.map((additive) => (
                      <tr key={additive.id} className="hover:bg-bg-base">
                        <td className="px-6 py-4 font-bold text-text-primary">
                          {additive.name}
                        </td>
                        <td className="px-6 py-4 font-mono text-sm">
                          {additive.code || "-"}
                        </td>
                        <td className="px-6 py-4 text-sm text-text-secondary">
                          {additive.category || "-"}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 text-xs font-bold rounded-full ${getSafetyColor(
                              additive.safety_level
                            )}`}
                          >
                            {translateSafety(additive.safety_level)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openModal(additive)}
                              className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded hover:bg-primary/20"
                            >
                              {t("common.edit")}
                            </button>
                            <button
                              onClick={() => handleDelete(additive.id)}
                              className="px-3 py-1 bg-error/10 text-error text-xs font-bold rounded hover:bg-error/20"
                            >
                              {t("common.delete")}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <Card className="w-full max-w-2xl p-6 my-8">
            <h3 className="text-xl font-bold text-text-primary mb-4">
              {editMode ? t("admin.additive.edit") : t("admin.additive.add")}
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label={t("admin.additive.name")}
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder={t("admin.additive.namePlaceholder")}
                  required
                />
                <Input
                  label={t("admin.additive.code")}
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                  placeholder="e.g., E951"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label={t("admin.additive.category")}
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  placeholder={t("admin.additive.categoryPlaceholder")}
                />
                <div>
                  <label className="block text-sm font-bold text-text-primary mb-2">
                    {t("admin.additive.safetyLabel")}
                  </label>
                  <select
                    value={formData.safety_level}
                    onChange={(e) =>
                      setFormData({ ...formData, safety_level: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-border bg-bg-surface focus:ring-2 focus:ring-primary/20 outline-none"
                  >
                    <option value="safe">{t("admin.additive.safe")}</option>
                    <option value="moderate">
                      {t("admin.additive.moderate")}
                    </option>
                    <option value="avoid">{t("admin.additive.avoid")}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-text-primary mb-2">
                  {t("admin.additive.description")}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-border bg-bg-surface focus:ring-2 focus:ring-primary/20 outline-none"
                  rows="3"
                  placeholder={t("admin.additive.descriptionPlaceholder")}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-text-primary mb-2">
                  {t("admin.additive.risks")}
                </label>
                <textarea
                  value={formData.health_risks}
                  onChange={(e) =>
                    setFormData({ ...formData, health_risks: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-border bg-bg-surface focus:ring-2 focus:ring-primary/20 outline-none"
                  rows="3"
                  placeholder={t("admin.additive.risksPlaceholder")}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button onClick={handleCreateOrUpdate} fullWidth>
                {editMode ? t("common.update") : t("common.create")}
              </Button>
              <Button
                onClick={() => setShowModal(false)}
                variant="ghost"
                fullWidth
              >
                {t("common.cancel")}
              </Button>
            </div>
          </Card>
        </div>
      )}
      <OwnerAuthorizationModal
        isOpen={showAuthModal}
        onAuthorize={executePendingAction}
        onClose={resetAuth}
      />
      <Toast
        isOpen={toast.isOpen}
        onClose={() => setToast({ ...toast, isOpen: false })}
        message={toast.message}
        type={toast.type}
      />
    </MainLayout>
  );
};

export default AdminAdditives;
