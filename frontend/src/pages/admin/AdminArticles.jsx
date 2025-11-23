import { useState, useEffect } from "react";
import { MainLayout } from "../../components/layouts";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import ConfirmModal from "../../components/ui/ConfirmModal";
import Toast from "../../components/ui/Toast";
import api from "../../config/api";

const AdminArticles = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    category: "tips",
    author: "",
    thumbnail_url: "",
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
    fetchArticles();
  }, []);

  const showToast = (message, type = "success") => {
    setToast({ isOpen: true, message, type });
  };

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/articles");
      setArticles(data.data);
    } catch (e) {
      showToast("Failed to load articles", "error");
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
    formDataUpload.append("type", "article");

    try {
      const { data } = await api.post("/admin/upload-image", formDataUpload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setFormData({ ...formData, thumbnail_url: data.url });
      showToast("Image uploaded successfully");
    } catch (e) {
      showToast("Image upload failed", "error");
    } finally {
      setUploading(false);
    }
  };

  const openModal = (article = null) => {
    if (article) {
      setEditMode(true);
      setCurrentId(article.id);
      setFormData({
        title: article.title,
        slug: article.slug,
        content: article.content,
        category: article.category,
        author: article.author || "",
        thumbnail_url: article.thumbnail_url || "",
      });
    } else {
      setEditMode(false);
      setCurrentId(null);
      setFormData({
        title: "",
        slug: "",
        content: "",
        category: "tips",
        author: "",
        thumbnail_url: "",
      });
    }
    setShowModal(true);
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const handleSubmit = async () => {
    try {
      if (editMode) {
        await api.put(`/admin/articles/${currentId}`, formData);
        showToast("Article updated successfully");
      } else {
        await api.post("/admin/articles", formData);
        showToast("Article created successfully");
      }
      setShowModal(false);
      fetchArticles();
    } catch (e) {
      showToast(e.response?.data?.detail || "Operation failed", "error");
    }
  };

  const handleDeleteClick = (id) => {
    setConfirmDelete({ isOpen: true, id });
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/admin/articles/${confirmDelete.id}`);
      setConfirmDelete({ isOpen: false, id: null });
      showToast("Article deleted successfully");
      fetchArticles();
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
                Article Management
              </h1>
              <p className="text-text-secondary">
                Total: {articles.length} articles
              </p>
            </div>
            <Button onClick={() => openModal()}>Add Article</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <Card className="p-6 col-span-full text-center">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
              </Card>
            ) : articles.length === 0 ? (
              <Card className="p-6 col-span-full text-center text-text-secondary">
                No articles
              </Card>
            ) : (
              articles.map((article) => (
                <Card
                  key={article.id}
                  className="overflow-hidden hover:shadow-lg transition-all"
                >
                  {article.thumbnail_url && (
                    <img
                      src={article.thumbnail_url}
                      alt={article.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full uppercase">
                        {article.category}
                      </span>
                      {article.is_published === 1 && (
                        <span className="px-2 py-1 bg-success/10 text-success text-xs font-bold rounded">
                          Published
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-lg text-text-primary mb-2 line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-xs text-text-secondary mb-4">
                      /{article.slug}
                    </p>
                    {article.author && (
                      <p className="text-xs text-text-secondary mb-4">
                        By: {article.author}
                      </p>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => openModal(article)}
                        className="flex-1 px-4 py-2 bg-primary/10 text-primary text-sm font-bold rounded-xl hover:bg-primary/20"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(article.id)}
                        className="flex-1 px-4 py-2 bg-error/10 text-error text-sm font-bold rounded-xl hover:bg-error/20"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <Card className="w-full max-w-4xl p-6 my-8">
            <h3 className="text-xl font-bold text-text-primary mb-4">
              {editMode ? "Edit Article" : "Add Article"}
            </h3>

            <div className="space-y-4">
              {/* Thumbnail Upload */}
              <div>
                <label className="block text-sm font-bold text-text-primary mb-2">
                  Thumbnail Image
                </label>
                <div className="flex items-center gap-4">
                  {formData.thumbnail_url && (
                    <img
                      src={formData.thumbnail_url}
                      alt="Preview"
                      className="w-32 h-24 rounded-xl object-cover"
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
                  {formData.thumbnail_url && (
                    <button
                      onClick={() =>
                        setFormData({ ...formData, thumbnail_url: "" })
                      }
                      className="px-3 py-2 bg-error/10 text-error text-sm font-bold rounded-xl hover:bg-error/20"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              <Input
                label="Title"
                value={formData.title}
                onChange={(e) => {
                  const title = e.target.value;
                  setFormData({
                    ...formData,
                    title,
                    slug: generateSlug(title),
                  });
                }}
                placeholder="Article title"
                required
              />

              <Input
                label="Slug"
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value })
                }
                placeholder="article-slug"
              />

              <div>
                <label className="block text-sm font-bold text-text-primary mb-2">
                  Content (HTML Supported)
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-border bg-bg-surface focus:ring-2 focus:ring-primary/20 outline-none"
                  rows="12"
                  placeholder="<p>Article content...</p>"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-text-primary mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-border bg-bg-surface focus:ring-2 focus:ring-primary/20 outline-none"
                  >
                    <option value="gizi">Gizi</option>
                    <option value="aditif">Aditif</option>
                    <option value="penyakit">Penyakit & Diet</option>
                    <option value="label">Membaca Label</option>
                    <option value="tips">Tips Sehat</option>
                  </select>
                </div>

                <Input
                  label="Author"
                  value={formData.author}
                  onChange={(e) =>
                    setFormData({ ...formData, author: e.target.value })
                  }
                  placeholder="Optional"
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
        title="Delete Article"
        message="Are you sure you want to delete this article?"
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

export default AdminArticles;
