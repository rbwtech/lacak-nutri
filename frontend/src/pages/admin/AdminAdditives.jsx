import { useState, useEffect } from "react";
import { MainLayout } from "../../components/layouts";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import api from "../../config/api";

const AdminAdditives = () => {
  const [additives, setAdditives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    category: "",
    safety_level: "safe",
    description: "",
    health_risks: "",
  });

  useEffect(() => {
    fetchAdditives();
  }, []);

  const fetchAdditives = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/additives");
      setAdditives(data.data);
    } catch (e) {
      console.error("Failed to load additives", e);
    } finally {
      setLoading(false);
    }
  };

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
        category: "",
        safety_level: "safe",
        description: "",
        health_risks: "",
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async () => {
    try {
      if (editMode) {
        await api.put(`/admin/additives/${currentId}`, formData);
      } else {
        await api.post("/admin/additives", formData);
      }
      setShowModal(false);
      fetchAdditives();
    } catch (e) {
      alert(e.response?.data?.detail || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this additive?")) return;
    try {
      await api.delete(`/admin/additives/${id}`);
      fetchAdditives();
    } catch (e) {
      alert("Delete failed");
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

  return (
    <MainLayout>
      <div className="bg-bg-base min-h-screen py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-extrabold text-text-primary">
                Additive Management
              </h1>
              <p className="text-text-secondary">
                Total: {additives.length} additives
              </p>
            </div>
            <Button onClick={() => openModal()}>Add Additive</Button>
          </div>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-bg-base border-b border-border">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-text-secondary uppercase">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-text-secondary uppercase">
                      Code
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-text-secondary uppercase">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-text-secondary uppercase">
                      Safety
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
                  ) : additives.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-6 py-8 text-center text-text-secondary"
                      >
                        No additives
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
                            {additive.safety_level}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openModal(additive)}
                              className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded hover:bg-primary/20"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(additive.id)}
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
          <Card className="w-full max-w-2xl p-6 my-8">
            <h3 className="text-xl font-bold text-text-primary mb-4">
              {editMode ? "Edit Additive" : "Add Additive"}
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Aspartame"
                  required
                />
                <Input
                  label="Code"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                  placeholder="e.g., E951"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  placeholder="e.g., Sweetener"
                />
                <div>
                  <label className="block text-sm font-bold text-text-primary mb-2">
                    Safety Level
                  </label>
                  <select
                    value={formData.safety_level}
                    onChange={(e) =>
                      setFormData({ ...formData, safety_level: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-border bg-bg-surface focus:ring-2 focus:ring-primary/20 outline-none"
                  >
                    <option value="safe">Safe</option>
                    <option value="moderate">Moderate</option>
                    <option value="avoid">Avoid</option>
                  </select>
                </div>
              </div>

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
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-text-primary mb-2">
                  Health Risks
                </label>
                <textarea
                  value={formData.health_risks}
                  onChange={(e) =>
                    setFormData({ ...formData, health_risks: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-border bg-bg-surface focus:ring-2 focus:ring-primary/20 outline-none"
                  rows="3"
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

export default AdminAdditives;
