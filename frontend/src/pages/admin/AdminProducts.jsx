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

const AdminProducts = () => {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [total, setTotal] = useState(0);
  const debouncedSearch = useDebounce(search, 500);

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

  const showToast = (message, type = "success") =>
    setToast({ isOpen: true, message, type });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/food-catalog", {
        params: {
          search: debouncedSearch || undefined,
          skip: (page - 1) * pageSize,
          limit: pageSize,
        },
      });
      setProducts(data.data);
      setTotal(data.total || 0);
    } catch (e) {
      showToast(t("admin.product.errorLoad"), "error");
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
  } = useOwnerAuth(showToast, fetchProducts);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, pageSize]);

  useEffect(() => {
    fetchProducts();
  }, [page, pageSize, debouncedSearch]);

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

  const handleCreateOrUpdate = async () => {
    const actionData = {
      endpoint: "food-catalog",
      formData: formData,
      successMsg: editMode
        ? t("admin.product.successUpdate")
        : t("admin.product.successCreate"),
      failureMsg: t("admin.common.operationFailed"),
    };
    if (isOwnerAdmin()) {
      handleWriteOperation("submit", currentId, actionData);
      setShowModal(false);
      return;
    }

    try {
      if (editMode) await api.put(`/admin/food-catalog/${currentId}`, formData);
      else await api.post("/admin/food-catalog", formData);
      showToast(actionData.successMsg);
      fetchProducts();
      setShowModal(false);
    } catch (e) {
      showToast(actionData.failureMsg, "error");
    }
  };

  const handleDeleteClick = (id) => {
    setConfirmDelete({ isOpen: true, id });
  };

  const handleDeleteConfirm = async () => {
    const idToDelete = confirmDelete.id;
    setConfirmDelete({ isOpen: false, id: null });
    const actionData = {
      endpoint: "food-catalog",
      successMsg: t("admin.product.successDelete"),
      failureMsg: t("common.errorDelete"),
    };

    if (isOwnerAdmin()) {
      handleWriteOperation("delete", idToDelete, actionData);
      return;
    }

    try {
      await api.delete(`/admin/food-catalog/${idToDelete}`);
      showToast(actionData.successMsg);
      fetchProducts();
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
                {t("admin.product.title")}
              </h1>
              <p className="text-text-secondary">
                {t("admin.product.total", { count: total })}
              </p>
            </div>
            <Button onClick={() => openModal()}>
              {t("admin.product.add")}
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
                    placeholder={t("admin.product.searchPlaceholder")}
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
                        {search
                          ? t("admin.pagination.noResults")
                          : t("admin.common.noData")}
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

            {/* Pagination */}
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
          <Card className="w-full max-w-4xl p-6 my-8">
            <h3 className="text-xl font-bold text-text-primary mb-4">
              {editMode ? t("admin.product.edit") : t("admin.product.add")}
            </h3>

            <div className="space-y-4">
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
