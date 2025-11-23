import { useState, useEffect } from "react";
import { MainLayout } from "../../components/layouts";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import api from "../../config/api";
import Toast from "../../components/ui/Toast";
import OwnerAuthorizationModal from "../../components/ui/AuthorizationModal";
import { useOwnerAuth } from "../../hooks/useOwnerAuth";
import { useDebounce } from "../../hooks/useCommon";
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
  const [toast, setToast] = useState({
    isOpen: false,
    message: "",
    type: "success",
  });

  // Pagination & Search
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const debouncedSearch = useDebounce(search, 500);

  const showToast = (message, type = "success") =>
    setToast({ isOpen: true, message, type });

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/localization", {
        params: {
          search: debouncedSearch || undefined,
          skip: (page - 1) * pageSize,
          limit: pageSize,
        },
      });
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
    setPage(1);
  }, [debouncedSearch, pageSize]);

  useEffect(() => {
    fetchSettings();
  }, [page, pageSize, debouncedSearch]);

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

  const handleCreateOrUpdate = async () => {
    const actionData = {
      endpoint: "localization",
      formData: formData,
      successMsg: editMode
        ? t("admin.localization.successUpdate")
        : t("admin.localization.successCreate"),
      failureMsg: t("admin.common.operationFailed"),
    };

    if (isOwnerAdmin()) {
      handleWriteOperation("submit", currentId, actionData);
      setShowModal(false);
      return;
    }

    try {
      if (editMode) await api.put(`/admin/localization/${currentId}`, formData);
      else await api.post("/admin/localization", formData);
      showToast(actionData.successMsg);
      fetchSettings();
      setShowModal(false);
    } catch (e) {
      showToast(actionData.failureMsg, "error");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm(t("admin.common.confirmDelete"))) return;
    const actionData = {
      endpoint: "localization",
      successMsg: t("admin.localization.successDelete"),
      failureMsg: t("common.errorDelete"),
    };

    if (isOwnerAdmin()) {
      handleWriteOperation("delete", id, actionData);
      return;
    }

    try {
      await api.delete(`/admin/localization/${id}`);
      showToast(actionData.successMsg);
      fetchSettings();
    } catch (e) {
      showToast(actionData.failureMsg, "error");
    }
  };

  const totalPages = Math.ceil(total / pageSize);

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
                {t("admin.localization.total", { count: total })}
              </p>
            </div>
            <Button onClick={() => openModal()}>
              {t("admin.localization.add")}
            </Button>
          </div>

          <Card className="p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="w-full md:w-2/3">
                <div className="relative">
                  <svg
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <input
                    type="text"
                    placeholder={t("admin.user.searchPlaceholder")}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-border bg-bg-surface focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <span className="text-sm text-text-secondary font-semibold whitespace-nowrap">
                  {t("admin.pagination.show")}:
                </span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="px-4 py-3 rounded-xl border border-border bg-bg-surface focus:ring-2 focus:ring-primary/20 outline-none font-semibold cursor-pointer"
                >
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div>
            </div>
          </Card>

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
                        {search
                          ? t("admin.pagination.noResults")
                          : t("admin.common.noData")}
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
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-sm text-text-secondary">
                  {t("admin.pagination.pageInfo", {
                    current: page,
                    total: totalPages,
                    count: total,
                  })}
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    {t("admin.pagination.previous")}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    {t("admin.pagination.next")}
                  </Button>
                </div>
              </div>
            )}
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
            {/* ... (Form Fields same as before) ... */}
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
