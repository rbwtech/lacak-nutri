import { useState, useEffect } from "react";
import { MainLayout } from "../../components/layouts";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import ConfirmModal from "../../components/ui/ConfirmModal";
import Toast from "../../components/ui/Toast";
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
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchDiseases();
  }, []);

  const fetchDiseases = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/diseases");
      setDiseases(data.data);
      setTotal(data.total || 0);
    } catch (e) {
      showToast(t("admin.disease.errorLoad"), "error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ isOpen: true, message, type });
  };

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

  const handleSubmit = async () => {
    try {
      if (editMode) {
        await api.put(`/admin/diseases/${currentId}`, formData);
        showToast(t("admin.disease.successUpdate"));
      } else {
        await api.post("/admin/diseases", formData);
        showToast(t("admin.disease.successCreate"));
      }
      setShowModal(false);
      fetchDiseases();
    } catch (e) {
      showToast(
        e.response?.data?.detail || t("admin.common.operationFailed"),
        "error"
      );
    }
  };

  const handleDeleteClick = (id) => {
    setConfirmDelete({ isOpen: true, id });
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/admin/diseases/${confirmDelete.id}`);
      setConfirmDelete({ isOpen: false, id: null });
      showToast(t("admin.disease.successDelete"));
      fetchDiseases();
    } catch (e) {
      showToast(t("common.errorDelete"), "error");
    }
  };

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
                {t("admin.disease.total", { count: diseases.length })}
              </p>
            </div>
            <Button onClick={() => openModal()}>
              {t("admin.disease.add")}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <Card className="p-6 col-span-full text-center">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
              </Card>
            ) : diseases.length === 0 ? (
              <Card className="p-6 col-span-full text-center text-text-secondary">
                {t("admin.common.noData")}
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
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <Card className="w-full max-w-2xl p-6 my-8">
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
              <Button onClick={handleSubmit} fullWidth>
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
