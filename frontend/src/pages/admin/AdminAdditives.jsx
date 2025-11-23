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
    category: "lainnya",
    safety_level: "safe",
    description: "",
    health_risks: "",
  });
  const [toast, setToast] = useState({
    isOpen: false,
    message: "",
    type: "success",
  });
  const showToast = (message, type = "success") =>
    setToast({ isOpen: true, message, type });

  // Pagination & Search
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const debouncedSearch = useDebounce(search, 500);

  const fetchAdditives = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/additives", {
        params: {
          search: debouncedSearch || undefined,
          skip: (page - 1) * pageSize,
          limit: pageSize,
        },
      });
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
    setPage(1);
  }, [debouncedSearch, pageSize]);

  useEffect(() => {
    fetchAdditives();
  }, [page, pageSize, debouncedSearch]);

  // ... openModal, handleCreateOrUpdate, handleDelete, getSafetyColor, translateSafety ...
  // (Copy these functions from your previous AdminAdditives.jsx or the provided one, they are standard)
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
        category: "lainnya",
        safety_level: "safe",
        description: "",
        health_risks: "",
      });
    }
    setShowModal(true);
  };

  const handleCreateOrUpdate = async () => {
    const actionData = {
      endpoint: "additives",
      formData: formData,
      successMsg: editMode
        ? t("admin.additive.successUpdate")
        : t("admin.additive.successCreate"),
      failureMsg: t("admin.common.operationFailed"),
    };

    if (isOwnerAdmin()) {
      handleWriteOperation("submit", currentId, actionData);
      setShowModal(false);
      return;
    }

    try {
      if (editMode) await api.put(`/admin/additives/${currentId}`, formData);
      else await api.post("/admin/additives", formData);
      showToast(actionData.successMsg);
      fetchAdditives();
      setShowModal(false);
    } catch (e) {
      showToast(actionData.failureMsg, "error");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm(t("admin.additive.confirmDelete"))) return;
    const actionData = {
      endpoint: "additives",
      successMsg: t("admin.additive.successDelete"),
      failureMsg: t("common.errorDelete"),
    };

    if (isOwnerAdmin()) {
      handleWriteOperation("delete", id, actionData);
      return;
    }

    try {
      await api.delete(`/admin/additives/${id}`);
      showToast(actionData.successMsg);
      fetchAdditives();
    } catch (e) {
      showToast(actionData.failureMsg, "error");
    }
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

  const totalPages = Math.ceil(total / pageSize);

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
                {t("admin.additive.total", { count: total })}
              </p>
            </div>
            <Button onClick={() => openModal()}>
              {t("admin.additive.add")}
            </Button>
          </div>

          {/* Search & Filter Card */}
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
                        {search
                          ? t("admin.pagination.noResults")
                          : t("admin.common.noData")}
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

            {/* Pagination Controls */}
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
      {/* ... (Modals and Toast) ... */}
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
                <div>
                  <label className="block text-sm font-bold text-text-primary mb-2">
                    {t("admin.additive.category")}
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-border bg-bg-surface focus:ring-2 focus:ring-primary/20 outline-none"
                  >
                    <option value="pemanis">Pemanis</option>
                    <option value="pengawet">Pengawet</option>
                    <option value="pewarna">Pewarna</option>
                    <option value="perisa">Perisa</option>
                    <option value="pengemulsi">Pengemulsi</option>
                    <option value="lainnya">Lainnya</option>
                  </select>
                </div>

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
