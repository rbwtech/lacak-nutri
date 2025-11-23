import { useState, useEffect } from "react";
import { MainLayout } from "../../components/layouts";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import ConfirmModal from "../../components/ui/ConfirmModal";
import Toast from "../../components/ui/Toast";
import api from "../../config/api";

const AdminProducts = () => {
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
      showToast("Failed to load products", "error");
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

    try {
      const { data } = await api.post("/admin/upload-image", formDataUpload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setFormData({ ...formData, image_url: data.url });
      showToast("Image uploaded successfully");
    } catch (e) {
      showToast("Image upload failed", "error");
    } finally {
      setUploading(false);
    }
  };

  const openModal = (product = null) => {
    if (product) {
      setEditMode(true);
      setCurrentId(product.id);
      setFormData(product);
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
        showToast("Product updated successfully");
      } else {
        await api.post("/admin/food-catalog", formData);
        showToast("Product created successfully");
      }
      setShowModal(false);
      fetchProducts();
    } catch (e) {
      showToast(e.response?.data?.detail || "Operation failed", "error");
    }
  };

  const handleDeleteClick = (id) => {
    setConfirmDelete({ isOpen: true, id });
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/admin/food-catalog/${confirmDelete.id}`);
      setConfirmDelete({ isOpen: false, id: null });
      showToast("Product deleted successfully");
      fetchProducts();
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
                Product Catalog
              </h1>
              <p className="text-text-secondary">
                Total: {products.length} products
              </p>
            </div>
            <Button onClick={() => openModal()}>Add Product</Button>
          </div>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-bg-base border-b border-border">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-text-secondary uppercase">
                      Image
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-text-secondary uppercase">
                      Code
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-text-secondary uppercase">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-text-secondary uppercase">
                      Nutrition (per 100g)
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-text-secondary uppercase">
                      Actions
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
                        No products
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
                            <p>Cal: {product.calories}kcal</p>
                            <p>
                              P: {product.protein}g | F: {product.fat}g | C:{" "}
                              {product.carbs}g
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openModal(product)}
                              className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded hover:bg-primary/20"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteClick(product.id)}
                              className="px-3 py-1 bg-error/10 text-error text-xs font-bold rounded hover:bg-error/20"
                            >
                              Delete
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
              {editMode ? "Edit Product" : "Add Product"}
            </h3>

            <div className="space-y-4">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-bold text-text-primary mb-2">
                  Product Image
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
                    {uploading ? "Uploading..." : "Choose Image"}
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
                  label="Code"
                  value={formData.original_code}
                  onChange={(e) =>
                    setFormData({ ...formData, original_code: e.target.value })
                  }
                  placeholder="e.g., AM001"
                />
                <Input
                  label="Name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Product name"
                  required
                />
              </div>

              <div className="grid grid-cols-4 gap-4">
                <Input
                  label="Weight (g)"
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
                  label="Calories (kcal)"
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
                  label="Protein (g)"
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
                  label="Fat (g)"
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
                  label="Carbs (g)"
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
                  label="Sugar (g)"
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
                  label="Fiber (g)"
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
                  label="Sodium (mg)"
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
                  label="Potassium (mg)"
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
                  label="Calcium (mg)"
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
                  label="Iron (mg)"
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
                  label="Cholesterol (mg)"
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
        title="Delete Product"
        message="Are you sure you want to delete this product?"
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
