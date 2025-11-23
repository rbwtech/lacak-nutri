import { useState, useEffect } from "react";
import { MainLayout } from "../../components/layouts";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import api from "../../config/api";

const AdminAllergens = () => {
  const [allergens, setAllergens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({ name: "", description: "" });

  useEffect(() => {
    fetchAllergens();
  }, []);

  const fetchAllergens = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/allergens");
      setAllergens(data.data);
    } catch (e) {
      console.error("Failed to load allergens", e);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (allergen = null) => {
    if (allergen) {
      setEditMode(true);
      setCurrentId(allergen.id);
      setFormData({ name: allergen.name, description: allergen.description });
    } else {
      setEditMode(false);
      setCurrentId(null);
      setFormData({ name: "", description: "" });
    }
    setShowModal(true);
  };

  const handleSubmit = async () => {
    try {
      if (editMode) {
        await api.put(`/admin/allergens/${currentId}`, formData);
      } else {
        await api.post("/admin/allergens", formData);
      }
      setShowModal(false);
      fetchAllergens();
    } catch (e) {
      alert(e.response?.data?.detail || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this allergen?")) return;
    try {
      await api.delete(`/admin/allergens/${id}`);
      fetchAllergens();
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
                Allergen Management
              </h1>
              <p className="text-text-secondary">
                Total: {allergens.length} allergens
              </p>
            </div>
            <Button onClick={() => openModal()}>Add Allergen</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <Card className="p-6 col-span-full text-center">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
              </Card>
            ) : allergens.length === 0 ? (
              <Card className="p-6 col-span-full text-center text-text-secondary">
                No allergens found
              </Card>
            ) : (
              allergens.map((allergen) => (
                <Card
                  key={allergen.id}
                  className="p-6 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-lg text-text-primary">
                      {allergen.name}
                    </h3>
                    {allergen.created_by && (
                      <span className="px-2 py-1 bg-accent/10 text-accent text-xs font-bold rounded">
                        Custom
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-text-secondary mb-4">
                    {allergen.description || "No description"}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openModal(allergen)}
                      className="flex-1 px-4 py-2 bg-primary/10 text-primary text-sm font-bold rounded-xl hover:bg-primary/20"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(allergen.id)}
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-text-primary mb-4">
              {editMode ? "Edit Allergen" : "Add Allergen"}
            </h3>

            <div className="space-y-4">
              <Input
                label="Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Peanuts"
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
                  placeholder="Optional description"
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
    </MainLayout>
  );
};

export default AdminAllergens;
