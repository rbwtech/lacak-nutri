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

const AdminLocalization = () => {
  const { t } = useTranslation();
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    timezone: "",
    timezone_offset: "",
    timezone_label: "",
    locale: "",
    locale_label: "",
    country_code: "",
    region: "",
    is_active: true,
  });
  const [total, setTotal] = useState(0);
  const [toast, setToast] = useState({
    isOpen: false,
    message: "",
    type: "success",
  });
  const showToast = (message, type = "success") =>
    setToast({ isOpen: true, message, type });

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/localization");
      setSettings(data.data);
      setTotal(data.total || 0);
    } catch (e) {
      console.error("Failed to load settings", e);
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
  } = useOwnerAuth(showToast, fetchSettings);

  useEffect(() => {
    fetchSettings();
  }, []);

  const openModal = (setting = null) => {
    if (setting) {
      setEditMode(true);
      setCurrentId(setting.id);
      setFormData(setting);
    } else {
      setEditMode(false);
      setCurrentId(null);
      setFormData({
        timezone: "",
        timezone_offset: "",
        timezone_label: "",
        locale: "",
        locale_label: "",
        country_code: "",
        region: "",
        is_active: true,
      });
    }
    setShowModal(true);
  };

  const handleCreateOrUpdate = () => {
    const actionData = {
      endpoint: "localization",
      formData: formData,
      successMsg: editMode
        ? t("admin.localization.successUpdate")
        : t("admin.localization.successCreate"),
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
    if (!confirm(t("admin.common.confirmDelete"))) return;
    const actionData = {
      endpoint: "localization",
      successMsg: t("admin.localization.successDelete"),
      failureMsg: t("common.errorDelete"),
    };
    if (isOwnerAdmin() && !handleWriteOperation("delete", id, actionData)) {
      return;
    }
    executePendingAction();
  };

  return (
    <MainLayout>
      <div className="bg-bg-base min-h-screen py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-extrabold text-text-primary">
                {t("admin.localization.title")}
              </h1>
              <p className="text-text-secondary">
                {t("admin.localization.total", { count: settings.length })}
              </p>
            </div>
            <Button onClick={() => openModal()}>
              {t("admin.localization.add")}
            </Button>
          </div>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-bg-base border-b border-border">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-text-secondary uppercase">
                      {t("admin.localization.timezone")}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-text-secondary uppercase">
                      {t("admin.localization.locale")}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-text-secondary uppercase">
                      {t("admin.localization.region")}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-text-secondary uppercase">
                      {t("admin.localization.status")}
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
                  ) : settings.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-6 py-8 text-center text-text-secondary"
                      >
                        {t("admin.common.noData")}
                      </td>
                    </tr>
                  ) : (
                    settings.map((setting) => (
                      <tr key={setting.id} className="hover:bg-bg-base">
                        <td className="px-6 py-4">
                          <p className="font-bold text-text-primary text-sm">
                            {setting.timezone_label}
                          </p>
                          <p className="text-xs text-text-secondary">
                            {setting.timezone} ({setting.timezone_offset})
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-text-primary text-sm">
                            {setting.locale_label}
                          </p>
                          <p className="text-xs text-text-secondary">
                            {setting.locale}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">
                            {setting.region}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 text-xs font-bold rounded-full ${
                              setting.is_active
                                ? "bg-success/10 text-success"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {setting.is_active
                              ? t("admin.localization.active")
                              : t("admin.localization.inactive")}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openModal(setting)}
                              className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded hover:bg-primary/20"
                            >
                              {t("common.edit")}
                            </button>
                            <button
                              onClick={() => handleDelete(setting.id)}
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
              {editMode
                ? t("admin.localization.edit")
                : t("admin.localization.add")}
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label={t("admin.localization.timezone")}
                  value={formData.timezone}
                  onChange={(e) =>
                    setFormData({ ...formData, timezone: e.target.value })
                  }
                  placeholder="Asia/Jakarta"
                />
                <Input
                  label={t("admin.localization.offset")}
                  value={formData.timezone_offset}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      timezone_offset: e.target.value,
                    })
                  }
                  placeholder="+07:00"
                />
              </div>

              <Input
                label={t("admin.localization.tzLabel")}
                value={formData.timezone_label}
                onChange={(e) =>
                  setFormData({ ...formData, timezone_label: e.target.value })
                }
                placeholder="Western Indonesia Time"
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label={t("admin.localization.locale")}
                  value={formData.locale}
                  onChange={(e) =>
                    setFormData({ ...formData, locale: e.target.value })
                  }
                  placeholder="id-ID"
                />
                <Input
                  label={t("admin.localization.localeLabel")}
                  value={formData.locale_label}
                  onChange={(e) =>
                    setFormData({ ...formData, locale_label: e.target.value })
                  }
                  placeholder="Bahasa Indonesia"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label={t("admin.localization.countryCode")}
                  value={formData.country_code}
                  onChange={(e) =>
                    setFormData({ ...formData, country_code: e.target.value })
                  }
                  placeholder="ID"
                />
                <Input
                  label={t("admin.localization.region")}
                  value={formData.region}
                  onChange={(e) =>
                    setFormData({ ...formData, region: e.target.value })
                  }
                  placeholder="Asia"
                />
              </div>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) =>
                    setFormData({ ...formData, is_active: e.target.checked })
                  }
                  className="w-5 h-5 rounded border-border text-primary focus:ring-2 focus:ring-primary/20"
                />
                <span className="text-sm font-bold text-text-primary">
                  {t("admin.localization.active")}
                </span>
              </label>
            </div>

            <div className="flex gap-3 mt-6">
              <Button onClick={handleCreateOrUpdate} fullWidth>
                {editMode ? t("common.update") : t("common.create")}
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowModal(false)}
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

export default AdminLocalization;
