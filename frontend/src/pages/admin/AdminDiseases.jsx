import { useState, useEffect } from "react";
import { MainLayout } from "../../components/layouts";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import ConfirmModal from "../../components/ui/ConfirmModal";
import Toast from "../../components/ui/Toast";
import api from "../../config/api";

const AdminDiseases = () => {
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

  useEffect(() => {
    fetchDiseases();
  }, []);

  const fetchDiseases = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/diseases");
      setDiseases(data.data);
    } catch (e) {
      showToast("Failed to load diseases", "error");
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
        showToast("Disease updated successfully");
      } else {
        await api.post("/admin/diseases", formData);
        showToast("Disease created successfully");
      }
      setShowModal(false);
      fetchDiseases();
    } catch (e) {
      showToast(e.response?.data?.detail || "Operation failed", "error");
    }
  };

  const handleDeleteClick = (id) => {
    setConfirmDelete({ isOpen: true, id });
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/admin/diseases/${confirmDelete.id}`);
      setConfirmDelete({ isOpen: false, id: null });
      showToast("Disease deleted successfully");
      fetchDiseases();
    } catch (e) {
      showToast("Delete failed", "error");
    }
  };

  return (
    <MainLayout>
      <div className="bg-bg-base min-h-screen py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-extrabold text-text-primary">
                Disease Management
              </h1>
              <p className="text-text-secondary">
                Total: {diseases.length} diseases
              </p>
            </div>
            <Button onClick={() => openModal()}>Add Disease</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <Card className="p-6 col-span-full text-center">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
              </Card>
            ) : diseases.length === 0 ? (
              <Card className="p-6 col-span-full text-center text-text-secondary">
                No diseases found
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
                    {disease.description || "No description"}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openModal(disease)}
                      className="flex-1 px-4 py-2 bg-primary/10 text-primary text-sm font-bold rounded-xl hover:bg-primary/20"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(disease.id)}
                      className="flex-1 px-4 py-2 bg-error/10 text-error text-sm font-bold rounded-xl hover:bg-error/20"
                    >
                      Delete
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
              {editMode ? "Edit Disease" : "Add Disease"}
            </h3>

            <div className="space-y-4">
              <Input
                label="Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Diabetes"
                required
              />

              <div>
                <label className="block text-sm font-bold text-text-primary mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-border bg-bg-surface focus:ring-2 focus:ring-primary/20 outline-none"
                  rows="3"
                  placeholder="Disease description"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-text-primary mb-2">
                  Dietary Recommendations
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
                  placeholder="Recommended foods and diet"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-text-primary mb-2">
                  Foods to Avoid
                </label>
                <textarea
                  value={formData.foods_to_avoid}
                  onChange={(e) =>
                    setFormData({ ...formData, foods_to_avoid: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-border bg-bg-surface focus:ring-2 focus:ring-primary/20 outline-none"
                  rows="3"
                  placeholder="Foods that should be avoided"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button onClick={handleSubmit} fullWidth>
                {editMode ? "Update" : "Create"}
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowModal(false)}
                fullWidth
              >
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, id: null })}
        onConfirm={handleDeleteConfirm}
        title="Delete Disease"
        message="Are you sure you want to delete this disease? This action cannot be undone."
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
