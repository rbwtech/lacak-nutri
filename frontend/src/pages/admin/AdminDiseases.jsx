import { useState, useEffect } from "react";
import { MainLayout } from "../../components/layouts";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import ConfirmModal from "../../components/ui/ConfirmModal";
import Toast from "../../components/ui/Toast";
import OwnerAuthorizationModal from "../../components/ui/AuthorizationModal";
import { useOwnerAuth } from "../../hooks/useOwnerAuth";
import { useDebounce } from "../../hooks/useCommon";
import api from "../../config/api";
import { useTranslation } from "react-i18next";

const AdminDiseases = () => {
  const { t } = useTranslation();
  const [diseases, setDiseases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    dietary_recommendations: "",
    foods_to_avoid: "",
  });
  const [confirmDelete, setConfirmDelete] = useState({
    isOpen: false,
    id: null,
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

  const fetchDiseases = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/diseases", {
        params: {
          search: debouncedSearch || undefined,
          skip: (page - 1) * pageSize,
          limit: pageSize,
        },
      });
      setDiseases(data.data);
      setTotal(data.total || 0);
    } catch (e) {
      showToast(t("admin.disease.errorLoad"), "error");
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
  } = useOwnerAuth(showToast, fetchDiseases);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, pageSize]);

  useEffect(() => {
    fetchDiseases();
  }, [page, pageSize, debouncedSearch]);

  const openModal = (disease = null) => {
    if (disease) {
      setEditMode(true);
      setCurrentId(disease.id);
      setFormData(disease);
    } else {
      setEditMode(false);
      setCurrentId(null);
      setFormData({
        name: "",
        description: "",
        dietary_recommendations: "",
        foods_to_avoid: "",
      });
    }
    setShowModal(true);
  };

  const handleCreateOrUpdate = async () => {
    const actionData = {
      endpoint: "diseases",
      formData: formData,
      successMsg: editMode
        ? t("admin.disease.successUpdate")
        : t("admin.disease.successCreate"),
      failureMsg: t("admin.common.operationFailed"),
    };
    if (isOwnerAdmin()) {
      handleWriteOperation("submit", currentId, actionData);
      setShowModal(false);
      return;
    }
    try {
      if (editMode) await api.put(`/admin/diseases/${currentId}`, formData);
      else await api.post("/admin/diseases", formData);
      showToast(actionData.successMsg);
      fetchDiseases();
      setShowModal(false);
    } catch (e) {
      showToast(actionData.failureMsg, "error");
    }
  };

  const handleDeleteConfirm = async () => {
    const idToDelete = confirmDelete.id;
    setConfirmDelete({ isOpen: false, id: null });
    const actionData = {
      endpoint: "diseases",
      successMsg: t("admin.disease.successDelete"),
      failureMsg: t("common.errorDelete"),
    };
    if (isOwnerAdmin()) {
      handleWriteOperation("delete", idToDelete, actionData);
      return;
    }
    try {
      await api.delete(`/admin/diseases/${idToDelete}`);
      showToast(actionData.successMsg);
      fetchDiseases();
    } catch (e) {
      showToast(actionData.failureMsg, "error");
    }
  };
  const handleDeleteClick = (id) => setConfirmDelete({ isOpen: true, id });

  const totalPages = Math.ceil(total / pageSize);

  return (
    <MainLayout>
      <div className="bg-bg-base min-h-screen py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-extrabold text-text-primary">
                {t("admin.disease.title")}
              </h1>
              <p className="text-text-secondary">
                {t("admin.disease.total", { count: total })}
              </p>
            </div>
            <Button onClick={() => openModal()}>
              {t("admin.disease.add")}
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {loading ? (
              <Card className="p-6 col-span-full text-center">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
              </Card>
            ) : diseases.length === 0 ? (
              <Card className="p-6 col-span-full text-center text-text-secondary">
                {search
                  ? t("admin.pagination.noResults")
                  : t("admin.common.noData")}
              </Card>
            ) : (
              diseases.map((disease) => (
                <Card
                  key={disease.id}
                  className="p-6 hover:shadow-lg transition-all"
                >
                  <h3 className="font-bold text-lg text-text-primary mb-3">
                    {disease.name}
                  </h3>
                  <p className="text-sm text-text-secondary mb-4 line-clamp-3">
                    {disease.description || t("admin.common.noDescription")}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openModal(disease)}
                      className="flex-1 px-4 py-2 bg-primary/10 text-primary text-sm font-bold rounded-xl hover:bg-primary/20"
                    >
                      {t("common.edit")}
                    </button>
                    <button
                      onClick={() => handleDeleteClick(disease.id)}
                      className="flex-1 px-4 py-2 bg-error/10 text-error text-sm font-bold rounded-xl hover:bg-error/20"
                    >
                      {t("common.delete")}
                    </button>
                  </div>
                </Card>
              ))
            )}
          </div>

          {totalPages > 1 && (
            <div className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-bg-surface rounded-3xl border border-border shadow-card">
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
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <Card className="w-full max-w-2xl p-6 my-8">
            {/* ... (Modal content same as previous) ... */}
            <h3 className="text-xl font-bold text-text-primary mb-4">
              {editMode ? t("admin.disease.edit") : t("admin.disease.add")}
            </h3>
            <div className="space-y-4">
              <Input
                label={t("admin.disease.name")}
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder={t("admin.disease.namePlaceholder")}
                required
              />
              <div>
                <label className="block text-sm font-bold text-text-primary mb-2">
                  {t("admin.disease.description")}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-border bg-bg-surface focus:ring-2 focus:ring-primary/20 outline-none"
                  rows="3"
                  placeholder={t("admin.disease.descriptionPlaceholder")}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-text-primary mb-2">
                  {t("admin.disease.recommendations")}
                </label>
                <textarea
                  value={formData.dietary_recommendations}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      dietary_recommendations: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-border bg-bg-surface focus:ring-2 focus:ring-primary/20 outline-none"
                  rows="3"
                  placeholder={t("admin.disease.recommendationsPlaceholder")}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-text-primary mb-2">
                  {t("admin.disease.foodsToAvoid")}
                </label>
                <textarea
                  value={formData.foods_to_avoid}
                  onChange={(e) =>
                    setFormData({ ...formData, foods_to_avoid: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-border bg-bg-surface focus:ring-2 focus:ring-primary/20 outline-none"
                  rows="3"
                  placeholder={t("admin.disease.foodsToAvoidPlaceholder")}
                />
              </div>
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
      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, id: null })}
        onConfirm={handleDeleteConfirm}
        title={t("admin.disease.deleteTitle")}
        message={t("admin.disease.confirmDelete")}
        type="danger"
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

export default AdminDiseases;
