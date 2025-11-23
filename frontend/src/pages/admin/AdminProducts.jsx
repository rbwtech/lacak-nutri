import { useState, useEffect } from "react";
import { MainLayout } from "../../components/layouts";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import api from "../../config/api";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    product_name: "",
    brand: "",
    bpom_number: "",
    category: "",
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/food-catalog");
      setProducts(data.data);
    } catch (e) {
      console.error("Failed to load products", e);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (product = null) => {
    if (product) {
      setEditMode(true);
      setCurrentId(product.id);
      setFormData({
        product_name: product.product_name,
        brand: product.brand || "",
        bpom_number: product.bpom_number || "",
        category: product.category || "",
      });
    } else {
      setEditMode(false);
      setCurrentId(null);
      setFormData({
        product_name: "",
        brand: "",
        bpom_number: "",
        category: "",
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async () => {
    try {
      if (editMode) {
        await api.put(`/admin/food-catalog/${currentId}`, formData);
      } else {
        await api.post("/admin/food-catalog", formData);
      }
      setShowModal(false);
      fetchProducts();
    } catch (e) {
      alert(e.response?.data?.detail || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this product?")) return;
    try {
      await api.delete(`/admin/food-catalog/${id}`);
      fetchProducts();
    } catch (e) {
      alert("Delete failed");
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
                      Product Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-text-secondary uppercase">
                      Brand
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-text-secondary uppercase">
                      BPOM Number
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-text-secondary uppercase">
                      Category
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
                        <td className="px-6 py-4 font-bold text-text-primary">
                          {product.product_name}
                        </td>
                        <td className="px-6 py-4 text-sm text-text-secondary">
                          {product.brand || "-"}
                        </td>
                        <td className="px-6 py-4 font-mono text-sm">
                          {product.bpom_number || "-"}
                        </td>
                        <td className="px-6 py-4">
                          {product.category ? (
                            <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">
                              {product.category}
                            </span>
                          ) : (
                            <span className="text-text-secondary text-sm">
                              -
                            </span>
                          )}
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
                              onClick={() => handleDelete(product.id)}
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl p-6">
            <h3 className="text-xl font-bold text-text-primary mb-4">
              {editMode ? "Edit Product" : "Add Product"}
            </h3>

            <div className="space-y-4">
              <Input
                label="Product Name"
                value={formData.product_name}
                onChange={(e) =>
                  setFormData({ ...formData, product_name: e.target.value })
                }
                placeholder="e.g., Indomie Goreng"
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Brand"
                  value={formData.brand}
                  onChange={(e) =>
                    setFormData({ ...formData, brand: e.target.value })
                  }
                  placeholder="Optional"
                />

                <Input
                  label="BPOM Number"
                  value={formData.bpom_number}
                  onChange={(e) =>
                    setFormData({ ...formData, bpom_number: e.target.value })
                  }
                  placeholder="Optional"
                />
              </div>

              <Input
                label="Category"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                placeholder="e.g., Instant Noodles"
              />
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
    </MainLayout>
  );
};

export default AdminProducts;
