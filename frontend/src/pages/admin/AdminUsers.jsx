import { useState, useEffect } from "react";
import { MainLayout } from "../../components/layouts";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import api from "../../config/api";
import { useTranslation } from "react-i18next";
import { useOwnerAuth } from "../../hooks/useOwnerAuth";
import OwnerAuthorizationModal from "../../components/ui/AuthorizationModal";
import Toast from "../../components/ui/Toast";

const AdminUsers = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [formData, setFormData] = useState({ role: "", email: "" });
  const [toast, setToast] = useState({
    isOpen: false,
    message: "",
    type: "success",
  });

  const showToast = (message, type = "success") =>
    setToast({ isOpen: true, message, type });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/users", {
        params: { search: search || undefined },
      });
      setUsers(data.data);
    } catch (e) {
      console.error("Failed to load users", e);
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
  } = useOwnerAuth(showToast, fetchUsers);

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const openModal = (user, type) => {
    setSelectedUser(user);
    setModalType(type);
    if (type === "role") {
      setFormData({ role: user.role });
    } else if (type === "email") {
      setFormData({ email: user.email });
    }
    setShowModal(true);
  };

  const handleUpdate = async () => {
    const dataToSubmit =
      modalType === "role"
        ? { role: formData.role }
        : { email: formData.email };

    const actionData = {
      endpoint: `users/${selectedUser.id}/${modalType}`,
      formData: dataToSubmit,
      successMsg: t("admin.user.updateSuccess"),
      failureMsg: t("admin.user.updateFailed"),
    };

    if (isOwnerAdmin()) {
      handleWriteOperation("patch", null, actionData);
      setShowModal(false);
      return;
    }

    try {
      await api.patch(
        `/admin/users/${selectedUser.id}/${modalType}`,
        dataToSubmit
      );
      showToast(t("admin.user.updateSuccess"), "success");
      fetchUsers();
      setShowModal(false);
    } catch (e) {
      showToast(t("admin.user.updateFailed"), "error");
    }
  };

  const handleResetPassword = async (userId) => {
    if (!confirm(t("admin.user.confirmReset"))) return;

    const actionData = {
      endpoint: `users/${userId}/reset-password`,
      formData: {},
      successMsg: t("admin.user.resetSuccessLink"),
      failureMsg: t("admin.user.resetFailed"),
    };

    if (isOwnerAdmin()) {
      handleWriteOperation("post", null, actionData);
      return;
    }

    try {
      const { data } = await api.post(`/admin/users/${userId}/reset-password`);
      alert(
        t("admin.user.resetSuccess", {
          link: data.reset_link,
          email: data.user_email,
        })
      );
    } catch (e) {
      showToast(
        e.response?.data?.detail || t("admin.user.resetFailed"),
        "error"
      );
    }
  };

  return (
    <MainLayout>
      <div className="bg-bg-base min-h-screen py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-extrabold text-text-primary">
                {t("admin.user.title")}
              </h1>
              <p className="text-text-secondary">
                {t("admin.user.total", { count: users.length })}
              </p>
            </div>
            <Button onClick={fetchUsers}>{t("admin.common.refresh")}</Button>
          </div>

          <Card className="p-6 mb-6">
            <Input
              placeholder={t("admin.user.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              containerClass="max-w-md"
            />
          </Card>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-bg-base border-b border-border">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-text-secondary uppercase">
                      {t("admin.user.tableUser")}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-text-secondary uppercase">
                      {t("admin.user.tableRole")}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-text-secondary uppercase">
                      {t("admin.user.tableInfo")}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-text-secondary uppercase">
                      {t("admin.user.tableAllergies")}
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
                  ) : users.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-6 py-8 text-center text-text-secondary"
                      >
                        {t("admin.common.noData")}
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id} className="hover:bg-bg-base">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-bold text-text-primary">
                              {user.name}
                            </p>
                            <p className="text-sm text-text-secondary">
                              {user.email}
                            </p>
                            <p className="text-xs text-text-secondary mt-1">
                              {user.timezone} • {user.locale}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              user.role === "admin"
                                ? "bg-primary/10 text-primary"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-text-secondary">
                          <p>
                            {t("admin.user.ageLabel")} {user.age || "-"}
                          </p>
                          <p>
                            {t("admin.user.bmiLabel")}{" "}
                            {user.weight && user.height
                              ? (
                                  user.weight / Math.pow(user.height / 100, 2)
                                ).toFixed(1)
                              : "-"}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          {user.allergies.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {user.allergies.map((allergy, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-1 bg-error/10 text-error text-xs rounded"
                                >
                                  {allergy}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-text-secondary text-sm">
                              {t("admin.user.none")}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openModal(user, "role")}
                              className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded hover:bg-primary/20"
                            >
                              {t("admin.user.tableRole")}
                            </button>
                            <button
                              onClick={() => openModal(user, "email")}
                              className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded hover:bg-blue-100"
                            >
                              {t("admin.user.tableEmail")}
                            </button>
                            <button
                              onClick={() => handleResetPassword(user.id)}
                              className="px-3 py-1 bg-warning/10 text-warning-text text-xs font-bold rounded hover:bg-warning/20"
                            >
                              {t("admin.user.reset")}
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-text-primary mb-4">
              {modalType === "role"
                ? t("admin.user.updateRole")
                : t("admin.user.updateEmail")}
            </h3>

            {modalType === "role" ? (
              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl border border-border bg-bg-surface focus:ring-2 focus:ring-primary/20 outline-none"
              >
                <option value="user">{t("profile.user")}</option>
                <option value="admin">{t("profile.admin")}</option>
              </select>
            ) : (
              <Input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder={t("admin.user.emailPlaceholder")}
              />
            )}

            <div className="flex gap-3 mt-6">
              <Button onClick={handleUpdate} fullWidth>
                {t("common.update")}
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
      <Toast
        isOpen={toast.isOpen}
        onClose={() => setToast({ ...toast, isOpen: false })}
        message={toast.message}
        type={toast.type}
      />
    </MainLayout>
  );
};

export default AdminUsers;
