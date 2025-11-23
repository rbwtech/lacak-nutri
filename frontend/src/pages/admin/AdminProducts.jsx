import { useState, useEffect } from "react";
import { MainLayout } from "../../components/layouts";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import ConfirmModal from "../../components/ui/ConfirmModal";
import Toast from "../../components/ui/Toast";
import api from "../../config/api";
import { useTranslation } from "react-i18next";

const AdminProducts = () => {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    original_code: "",
    name: "",
    weight_g: 100,
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
    sugar: 0,
    fiber: 0,
    sodium_mg: 0,
    potassium_mg: 0,
    calcium_mg: 0,
    iron_mg: 0,
    cholesterol_mg: 0,
    image_url: "",
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
    fetchProducts();
  }, []);

  const showToast = (message, type = "success") => {
    setToast({ isOpen: true, message, type });
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/food-catalog");
      setProducts(data.data);
    } catch (e) {
      showToast(t("admin.product.errorLoad"), "error");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append("file", file);
    formDataUpload.append("type", "product");

    try {
      const { data } = await api.post("/admin/upload-image", formDataUpload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setFormData({ ...formData, image_url: data.url });
      showToast(t("admin.product.imageSuccess"));
    } catch (e) {
      showToast(t("admin.product.errorUpload"), "error");
    } finally {
      setUploading(false);
    }
  };

  const openModal = (product = null) => {
    if (product) {
      setEditMode(true);
      setCurrentId(product.id);
      setFormData({
        ...product,
        weight_g: parseFloat(product.weight_g) || 100,
        calories: parseFloat(product.calories) || 0,
        protein: parseFloat(product.protein) || 0,
        fat: parseFloat(product.fat) || 0,
        carbs: parseFloat(product.carbs) || 0,
        sugar: parseFloat(product.sugar) || 0,
        fiber: parseFloat(product.fiber) || 0,
        sodium_mg: parseFloat(product.sodium_mg) || 0,
        potassium_mg: parseFloat(product.potassium_mg) || 0,
        calcium_mg: parseFloat(product.calcium_mg) || 0,
        iron_mg: parseFloat(product.iron_mg) || 0,
        cholesterol_mg: parseFloat(product.cholesterol_mg) || 0,
      });
    } else {
      setEditMode(false);
      setCurrentId(null);
      setFormData({
        original_code: "",
        name: "",
        weight_g: 100,
        calories: 0,
        protein: 0,
        fat: 0,
        carbs: 0,
        sugar: 0,
        fiber: 0,
        sodium_mg: 0,
        potassium_mg: 0,
        calcium_mg: 0,
        iron_mg: 0,
        cholesterol_mg: 0,
        image_url: "",
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async () => {
    try {
      if (editMode) {
        await api.put(`/admin/food-catalog/${currentId}`, formData);
        showToast(t("admin.product.successUpdate"));
      } else {
        await api.post("/admin/food-catalog", formData);
        showToast(t("admin.product.successCreate"));
      }
      setShowModal(false);
      fetchProducts();
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
      await api.delete(`/admin/food-catalog/${confirmDelete.id}`);
      setConfirmDelete({ isOpen: false, id: null });
      showToast(t("admin.product.successDelete"));
      fetchProducts();
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
                {t("admin.product.title")}
              </h1>
              <p className="text-text-secondary">
                {t("admin.product.total", { count: products.length })}
              </p>
            </div>
            <Button onClick={() => openModal()}>
              {t("admin.product.add")}
            </Button>
          </div>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-bg-base border-b border-border">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-text-secondary uppercase">
                      {t("admin.product.image")}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-text-secondary uppercase">
                      {t("admin.product.code")}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-text-secondary uppercase">
                      {t("admin.product.name")}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-text-secondary uppercase">
                      {t("admin.product.nutritionHeader")}
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
                  ) : products.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-6 py-8 text-center text-text-secondary"
                      >
                        {t("admin.common.noData")}
                      </td>
                    </tr>
                  ) : (
                    products.map((product) => (
                      <tr key={product.id} className="hover:bg-bg-base">
                        <td className="px-6 py-4">
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-16 h-16 rounded-xl object-cover"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400">
                              <svg
                                className="w-8 h-8"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 font-mono text-sm">
                          {product.original_code || "-"}
                        </td>
                        <td className="px-6 py-4 font-bold text-text-primary">
                          {product.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-text-secondary">
                          <div className="space-y-1">
                            <p>
                              {t("products.cal")}:{" "}
                              {Math.round(product.calories)}kcal
                            </p>
                            <p>
                              {t("products.prot")}:{" "}
                              {Math.round(product.protein)}g |{" "}
                              {t("products.fat")}: {Math.round(product.fat)}g |{" "}
                              {t("products.carbs")}: {Math.round(product.carbs)}
                              g
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openModal(product)}
                              className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded hover:bg-primary/20"
                            >
                              {t("common.edit")}
                            </button>
                            <button
                              onClick={() => handleDeleteClick(product.id)}
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
          <Card className="w-full max-w-4xl p-6 my-8">
            <h3 className="text-xl font-bold text-text-primary mb-4">
              {editMode ? t("admin.product.edit") : t("admin.product.add")}
            </h3>

            <div className="space-y-4">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-bold text-text-primary mb-2">
                  {t("admin.product.image")}
                </label>
                <div className="flex items-center gap-4">
                  {formData.image_url && (
                    <img
                      src={formData.image_url}
                      alt="Preview"
                      className="w-24 h-24 rounded-xl object-cover"
                    />
                  )}
                  <label className="cursor-pointer px-4 py-2 bg-primary/10 text-primary text-sm font-bold rounded-xl hover:bg-primary/20 transition-colors">
                    {uploading
                      ? t("common.uploading")
                      : t("admin.product.chooseImage")}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label={t("admin.product.code")}
                  value={formData.original_code}
                  onChange={(e) =>
                    setFormData({ ...formData, original_code: e.target.value })
                  }
                  placeholder="e.g., AM001"
                />
                <Input
                  label={t("admin.product.name")}
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder={t("admin.product.namePlaceholder")}
                  required
                />
              </div>

              <div className="grid grid-cols-4 gap-4">
                <Input
                  label={t("admin.product.weight")}
                  type="number"
                  value={formData.weight_g}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      weight_g: parseFloat(e.target.value),
                    })
                  }
                />
                <Input
                  label={t("admin.product.calories")}
                  type="number"
                  value={formData.calories}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      calories: parseFloat(e.target.value),
                    })
                  }
                />
                <Input
                  label={t("admin.product.protein")}
                  type="number"
                  step="0.1"
                  value={formData.protein}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      protein: parseFloat(e.target.value),
                    })
                  }
                />
                <Input
                  label={t("admin.product.fat")}
                  type="number"
                  step="0.1"
                  value={formData.fat}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      fat: parseFloat(e.target.value),
                    })
                  }
                />
              </div>

              <div className="grid grid-cols-4 gap-4">
                <Input
                  label={t("admin.product.carbs")}
                  type="number"
                  step="0.1"
                  value={formData.carbs}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      carbs: parseFloat(e.target.value),
                    })
                  }
                />
                <Input
                  label={t("admin.product.sugar")}
                  type="number"
                  step="0.1"
                  value={formData.sugar}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sugar: parseFloat(e.target.value),
                    })
                  }
                />
                <Input
                  label={t("admin.product.fiber")}
                  type="number"
                  step="0.1"
                  value={formData.fiber}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      fiber: parseFloat(e.target.value),
                    })
                  }
                />
                <Input
                  label={t("admin.product.sodium")}
                  type="number"
                  step="0.1"
                  value={formData.sodium_mg}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sodium_mg: parseFloat(e.target.value),
                    })
                  }
                />
              </div>

              <div className="grid grid-cols-4 gap-4">
                <Input
                  label={t("admin.product.potassium")}
                  type="number"
                  step="0.1"
                  value={formData.potassium_mg}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      potassium_mg: parseFloat(e.target.value),
                    })
                  }
                />
                <Input
                  label={t("admin.product.calcium")}
                  type="number"
                  step="0.1"
                  value={formData.calcium_mg}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      calcium_mg: parseFloat(e.target.value),
                    })
                  }
                />
                <Input
                  label={t("admin.product.iron")}
                  type="number"
                  step="0.1"
                  value={formData.iron_mg}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      iron_mg: parseFloat(e.target.value),
                    })
                  }
                />
                <Input
                  label={t("admin.product.cholesterol")}
                  type="number"
                  step="0.1"
                  value={formData.cholesterol_mg}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      cholesterol_mg: parseFloat(e.target.value),
                    })
                  }
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
        title={t("admin.product.deleteTitle")}
        message={t("admin.product.confirmDelete")}
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

export default AdminProducts;
