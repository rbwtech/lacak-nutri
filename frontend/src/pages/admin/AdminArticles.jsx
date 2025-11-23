import { useState, useEffect } from "react";
import { MainLayout } from "../../components/layouts";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import ConfirmModal from "../../components/ui/ConfirmModal";
import Toast from "../../components/ui/Toast";
import api from "../../config/api";
import { useTranslation } from "react-i18next";
import { useOwnerAuth } from "../../hooks/useOwnerAuth";
import OwnerAuthorizationModal from "../../components/ui/AuthorizationModal";

const AdminArticles = () => {
  const { t } = useTranslation();
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

  const showToast = (message, type = "success") =>
    setToast({ isOpen: true, message, type });

  // FIX: Define fetch first
  const fetchArticles = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/articles");
      setArticles(data.data);
    } catch (e) {
      showToast(t("admin.article.errorLoad"), "error");
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
  } = useOwnerAuth(showToast, fetchArticles);

  useEffect(() => {
    fetchArticles();
  }, []);

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
      showToast(t("admin.article.imageSuccess"));
    } catch (e) {
      showToast(t("admin.article.errorUpload"), "error");
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

  const handleCreateOrUpdate = async () => {
    const actionData = {
      endpoint: "articles",
      formData: formData,
      successMsg: editMode
        ? t("admin.article.successUpdate")
        : t("admin.article.successCreate"),
      failureMsg: t("admin.common.operationFailed"),
    };

    // Check Owner
    if (isOwnerAdmin()) {
      handleWriteOperation("submit", currentId, actionData);
      setShowModal(false);
      return;
    }

    // Non-Owner Direct Execution
    try {
      if (editMode) await api.put(`/admin/articles/${currentId}`, formData);
      else await api.post("/admin/articles", formData);
      showToast(actionData.successMsg);
      fetchArticles();
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
      endpoint: "articles",
      successMsg: t("admin.article.successDelete"),
      failureMsg: t("common.errorDelete"),
    };

    if (isOwnerAdmin()) {
      handleWriteOperation("delete", idToDelete, actionData);
      return;
    }

    // Non-Owner Direct Execution
    try {
      await api.delete(`/admin/articles/${idToDelete}`);
      showToast(actionData.successMsg);
      fetchArticles();
    } catch (e) {
      showToast(actionData.failureMsg, "error");
    }
  };

  const translateCategory = (cat) => {
    switch (cat) {
      case "gizi":
        return t("articles.catGizi");
      case "aditif":
        return t("articles.catAditif");
      case "penyakit":
        return t("articles.catPenyakit");
      case "label":
        return t("articles.catLabel");
      case "tips":
        return t("articles.catTips");
      default:
        return cat;
    }
  };

  return (
    <MainLayout>
      <div className="bg-bg-base min-h-screen py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-extrabold text-text-primary">
                {t("admin.article.title")}
              </h1>
              <p className="text-text-secondary">
                {t("admin.article.total", { count: articles.length })}
              </p>
            </div>
            <Button onClick={() => openModal()}>
              {t("admin.article.add")}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <Card className="p-6 col-span-full text-center">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
              </Card>
            ) : articles.length === 0 ? (
              <Card className="p-6 col-span-full text-center text-text-secondary">
                {t("admin.common.noData")}
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
                        {translateCategory(article.category)}
                      </span>
                      {article.is_published === 1 && (
                        <span className="px-2 py-1 bg-success/10 text-success text-xs font-bold rounded">
                          {t("admin.article.published")}
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
                        {t("admin.article.byAuthor")}: {article.author}
                      </p>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => openModal(article)}
                        className="flex-1 px-4 py-2 bg-primary/10 text-primary text-sm font-bold rounded-xl hover:bg-primary/20"
                      >
                        {t("common.edit")}
                      </button>
                      <button
                        onClick={() => handleDeleteClick(article.id)}
                        className="flex-1 px-4 py-2 bg-error/10 text-error text-sm font-bold rounded-xl hover:bg-error/20"
                      >
                        {t("common.delete")}
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
              {editMode ? t("admin.article.edit") : t("admin.article.add")}
            </h3>
            <div className="space-y-4">
              {/* Form Fields */}
              <div>
                <label className="block text-sm font-bold text-text-primary mb-2">
                  {t("admin.article.thumbnail")}
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
                    {uploading
                      ? t("common.uploading")
                      : t("admin.article.chooseImage")}
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
              <Input
                label={t("admin.article.name")}
                value={formData.title}
                onChange={(e) => {
                  const title = e.target.value;
                  setFormData({
                    ...formData,
                    title,
                    slug: generateSlug(title),
                  });
                }}
                placeholder={t("admin.article.titlePlaceholder")}
                required
              />
              <Input
                label={t("admin.article.slug")}
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value })
                }
                placeholder="article-slug"
              />
              <div>
                <label className="block text-sm font-bold text-text-primary mb-2">
                  {t("admin.article.content")}
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
                    {t("admin.article.category")}
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-border bg-bg-surface focus:ring-2 focus:ring-primary/20 outline-none"
                  >
                    <option value="gizi">{t("articles.catGizi")}</option>
                    <option value="aditif">{t("articles.catAditif")}</option>
                    <option value="penyakit">
                      {t("articles.catPenyakit")}
                    </option>
                    <option value="label">{t("articles.catLabel")}</option>
                    <option value="tips">{t("articles.catTips")}</option>
                  </select>
                </div>
                <Input
                  label={t("admin.article.author")}
                  value={formData.author}
                  onChange={(e) =>
                    setFormData({ ...formData, author: e.target.value })
                  }
                  placeholder={t("admin.article.authorPlaceholder")}
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
        title={t("admin.article.deleteTitle")}
        message={t("admin.article.confirmDelete")}
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
