import { useState, useEffect } from "react";
import { MainLayout } from "../components/layouts";
import { useAuth } from "../context/AuthContext";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import SuccessModal from "../components/ui/SuccessModal";
import api from "../config/api";

const Toast = ({ message, type = "success", onClose }) => (
  <div className="fixed top-6 right-6 z-50 animate-slide-in-right">
    <div
      className={`px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 min-w-[320px] backdrop-blur-sm border-2 ${
        type === "success"
          ? "bg-secondary/10 border-secondary text-secondary"
          : type === "error"
          ? "bg-error/10 border-error text-error"
          : "bg-warning/10 border-warning text-warning"
      }`}
    >
      {type === "success" && (
        <svg
          className="w-6 h-6 shrink-0"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      )}
      {type === "error" && (
        <svg
          className="w-6 h-6 shrink-0"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
      )}
      <p className="font-bold text-sm">{message}</p>
      <button
        onClick={onClose}
        className="ml-auto opacity-70 hover:opacity-100"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  </div>
);

const parseErrorMessage = (error, fallback = "Terjadi kesalahan") => {
  const errMsg = error.response?.data?.detail;
  if (typeof errMsg === "string") return errMsg;
  if (Array.isArray(errMsg)) return errMsg[0]?.msg || fallback;
  if (errMsg?.msg) return errMsg.msg;
  return fallback;
};

const Profile = () => {
  const { user, setUser, changePassword } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const [masterAllergens, setMasterAllergens] = useState([]);
  const [userAllergies, setUserAllergies] = useState([]);
  const [customAllergy, setCustomAllergy] = useState("");
  const [allergyView, setAllergyView] = useState("active");

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [localizationSettings, setLocalizationSettings] = useState({});
  const [selectedRegion, setSelectedRegion] = useState("Asia");

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    age: user?.age || "",
    weight: user?.weight || "",
    height: user?.height || "",
    gender: user?.gender || "male",
  });

  const [passData, setPassData] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    fetchLocalizationSettings();
  }, []);

  const fetchLocalizationSettings = async () => {
    try {
      const { data } = await api.get("/users/localization-settings");
      setLocalizationSettings(data.data);
    } catch (e) {
      console.error("Failed to load localization settings", e);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [allRes, myRes] = await Promise.all([
          api.get("/users/allergens"),
          api.get("/users/my-allergies"),
        ]);
        setMasterAllergens(allRes.data);
        setUserAllergies(myRes.data.map((a) => a.id));
      } catch (e) {
        showToast(parseErrorMessage(e, "Gagal memuat data alergi"), "error");
      }
    };
    fetchData();
    setPhotoPreview(user?.photo_url || null);
  }, [user]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast("Ukuran file maksimal 2MB", "error");
        return;
      }
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const form = new FormData();
      form.append("name", formData.name);
      if (formData.age) form.append("age", formData.age);
      if (formData.weight) form.append("weight", formData.weight);
      if (formData.height) form.append("height", formData.height);
      if (formData.gender) form.append("gender", formData.gender);
      if (photoFile) form.append("photo", photoFile);

      const { data } = await api.put("/users/profile", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
      setEditing(false);
      setSuccessMessage("Profil berhasil diperbarui!");
      setShowSuccess(true);
    } catch (error) {
      showToast(parseErrorMessage(error, "Gagal menyimpan profil"), "error");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passData.new !== passData.confirm) {
      showToast("Konfirmasi password tidak cocok", "error");
      return;
    }
    setLoading(true);
    try {
      await changePassword({
        current_password: passData.current,
        new_password: passData.new,
      });
      setShowPasswordModal(false);
      setPassData({ current: "", new: "", confirm: "" });
      setSuccessMessage("Password berhasil diubah. Silakan login kembali.");
      setShowSuccess(true);
      setTimeout(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }, 2000);
    } catch (e) {
      showToast(parseErrorMessage(e, "Password lama salah"), "error");
    } finally {
      setLoading(false);
    }
  };

  const toggleAllergy = async (id) => {
    const isSelected = userAllergies.includes(id);
    const newSelection = isSelected
      ? userAllergies.filter((a) => a !== id)
      : [...userAllergies, id];

    setUserAllergies(newSelection);

    try {
      await api.put("/users/allergies", { allergen_ids: newSelection });
      showToast(
        isSelected ? "Alergi dihapus dari daftar Anda" : "Alergi ditambahkan",
        "success"
      );
    } catch (e) {
      showToast(
        parseErrorMessage(e, "Gagal update preferensi alergi"),
        "error"
      );
      setUserAllergies(userAllergies);
    }
  };

  const handleAddCustomAllergy = async (e) => {
    e.preventDefault();
    if (!customAllergy.trim()) return;

    try {
      const { data } = await api.post("/users/allergies/custom", {
        name: customAllergy,
      });

      const newAllergen = data.allergen;

      setMasterAllergens((prev) => [...prev, newAllergen]);
      setUserAllergies((prev) => [...prev, newAllergen.id]);

      setCustomAllergy("");
      setAllergyView("active");
      showToast(`Alergi "${newAllergen.name}" berhasil ditambahkan`, "success");
    } catch (error) {
      showToast(parseErrorMessage(error, "Gagal menambah alergi"), "error");
    }
  };

  const handleDeleteCustomAllergy = async (allergenId, allergenName, e) => {
    e.stopPropagation();
    try {
      await api.delete(`/users/allergens/${allergenId}`);
      setMasterAllergens((prev) => prev.filter((a) => a.id !== allergenId));
      setUserAllergies((prev) => prev.filter((id) => id !== allergenId));
      showToast(`"${allergenName}" dihapus permanen`, "success");
    } catch (error) {
      showToast(
        parseErrorMessage(error, "Hanya alergi custom yang bisa dihapus"),
        "error"
      );
    }
  };

  const bmiValue =
    formData.weight && formData.height
      ? (formData.weight / Math.pow(formData.height / 100, 2)).toFixed(1)
      : null;

  const getBMIStatus = (val) => {
    if (!val)
      return {
        label: "Belum Ada Data",
        color: "text-text-secondary",
        bg: "bg-border/30",
      };
    const n = parseFloat(val);
    if (n < 18.5)
      return {
        label: "Berat Kurang",
        color: "text-warning",
        bg: "bg-warning/10",
      };
    if (n < 25)
      return { label: "Ideal", color: "text-secondary", bg: "bg-secondary/10" };
    if (n < 30)
      return {
        label: "Berat Lebih",
        color: "text-warning",
        bg: "bg-warning/10",
      };
    return { label: "Obesitas", color: "text-error", bg: "bg-error/10" };
  };
  const bmi = getBMIStatus(bmiValue);

  const inputClass = `
    w-full px-4 py-3 rounded-xl border transition-all text-sm font-medium outline-none
    dark:bg-[#1f1f1f] dark:border-[#3a3a3a] dark:text-white dark:placeholder-gray-400
  `;

  const readOnlyClass = `
    bg-bg-surface border-border text-text-secondary cursor-default
    dark:bg-[#2a2a2a] dark:text-gray-400
  `;

  const editClass = `
    bg-bg-surface border-border focus:ring-2 focus:ring-primary/20 focus:border-primary text-text-primary
    dark:bg-[#1f1f1f] dark:border-[#5c5c5c] dark:text-white
  `;

  const activeAllergies = masterAllergens.filter((a) =>
    userAllergies.includes(a.id)
  );
  const availableAllergies = masterAllergens.filter(
    (a) => !userAllergies.includes(a.id)
  );

  return (
    <MainLayout>
      <div className="bg-bg-base min-h-screen py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {toast && <Toast {...toast} onClose={() => setToast(null)} />}

          <div className="flex items-center gap-6 mb-10">
            <div className="relative group">
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-surface shadow-xl">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-primary flex items-center justify-center text-5xl font-extrabold text-white">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              {editing && (
                <label className="absolute bottom-0 right-0 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-all shadow-xl hover:scale-110">
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
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handlePhotoChange}
                  />
                </label>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-extrabold text-text-primary mb-1">
                {user?.name}
              </h1>
              <p className="text-text-secondary">{user?.email}</p>
            </div>
            {!editing && (
              <Button
                onClick={() => setEditing(true)}
                className="px-6 shadow-lg"
              >
                Edit Profil
              </Button>
            )}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <Card title="Informasi Pribadi">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-text-primary mb-2">
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      disabled={!editing}
                      className={`${inputClass} ${
                        editing ? editClass : readOnlyClass
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-text-primary mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      disabled
                      className={`${inputClass} ${readOnlyClass}`}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-bold text-text-primary mb-2">
                        Jenis Kelamin
                      </label>
                      <select
                        value={formData.gender}
                        onChange={(e) =>
                          setFormData({ ...formData, gender: e.target.value })
                        }
                        disabled={!editing}
                        className={`${inputClass} ${
                          editing ? editClass : readOnlyClass
                        }`}
                      >
                        <option value="male">Laki-laki</option>
                        <option value="female">Perempuan</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-text-primary mb-2">
                        Usia
                      </label>
                      <input
                        type="number"
                        value={formData.age}
                        onChange={(e) =>
                          setFormData({ ...formData, age: e.target.value })
                        }
                        disabled={!editing}
                        className={`${inputClass} ${
                          editing ? editClass : readOnlyClass
                        }`}
                        placeholder="-"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-bold text-text-primary mb-2">
                        Berat (kg)
                      </label>
                      <input
                        type="number"
                        value={formData.weight}
                        onChange={(e) =>
                          setFormData({ ...formData, weight: e.target.value })
                        }
                        disabled={!editing}
                        className={`${inputClass} ${
                          editing ? editClass : readOnlyClass
                        }`}
                        placeholder="-"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-text-primary mb-2">
                        Tinggi (cm)
                      </label>
                      <input
                        type="number"
                        value={formData.height}
                        onChange={(e) =>
                          setFormData({ ...formData, height: e.target.value })
                        }
                        disabled={!editing}
                        className={`${inputClass} ${
                          editing ? editClass : readOnlyClass
                        }`}
                        placeholder="-"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-bold text-text-primary mb-2 block">
                        Zona Waktu
                      </label>
                      <select
                        name="timezone"
                        value={formData.timezone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-bg-surface focus:ring-2 focus:ring-primary/20 outline-none"
                      >
                        {Object.entries(localizationSettings).map(
                          ([region, settings]) => (
                            <optgroup key={region} label={region}>
                              {settings.map((setting) => (
                                <option
                                  key={setting.id}
                                  value={setting.timezone}
                                >
                                  {setting.timezone_label} (
                                  {setting.timezone_offset})
                                </option>
                              ))}
                            </optgroup>
                          )
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-bold text-text-primary mb-2 block">
                        Bahasa & Format Tanggal
                      </label>
                      <select
                        name="locale"
                        value={formData.locale}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-bg-surface focus:ring-2 focus:ring-primary/20 outline-none"
                      >
                        {Object.values(localizationSettings)
                          .flat()
                          .map((setting) => (
                            <option
                              key={`${setting.locale}-${setting.id}`}
                              value={setting.locale}
                            >
                              {setting.locale_label}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>

                  {editing && (
                    <div className="flex gap-3 pt-4 border-t border-border">
                      <Button type="submit" loading={loading} className="px-8">
                        Simpan Perubahan
                      </Button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(false);
                          setPhotoPreview(user?.photo_url || null);
                          setPhotoFile(null);
                        }}
                        className="px-6 py-3 text-sm font-bold text-text-secondary hover:bg-bg-surface rounded-xl transition-colors"
                      >
                        Batal
                      </button>
                    </div>
                  )}
                </form>
              </Card>

              <Card title="Preferensi Alergi">
                <div className="mb-6">
                  <div className="flex gap-2 p-1 bg-bg-surface rounded-xl mb-4 border border-border">
                    <button
                      onClick={() => setAllergyView("active")}
                      className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${
                        allergyView === "active"
                          ? "bg-primary text-white shadow-md"
                          : "text-text-secondary hover:text-text-primary"
                      }`}
                    >
                      Alergi Saya ({activeAllergies.length})
                    </button>
                    <button
                      onClick={() => setAllergyView("available")}
                      className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${
                        allergyView === "available"
                          ? "bg-primary text-white shadow-md"
                          : "text-text-secondary hover:text-text-primary"
                      }`}
                    >
                      Semua Pilihan ({availableAllergies.length})
                    </button>
                  </div>

                  {allergyView === "active" && (
                    <div className="space-y-3">
                      {activeAllergies.length === 0 ? (
                        <div className="text-center py-12 bg-bg-surface rounded-xl border border-border">
                          <div className="w-16 h-16 bg-border/50 rounded-full flex items-center justify-center mx-auto mb-3">
                            <svg
                              className="w-8 h-8 text-text-secondary"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                              />
                            </svg>
                          </div>
                          <p className="text-text-secondary font-medium">
                            Belum ada alergi yang dipilih
                          </p>
                          <p className="text-sm text-text-secondary mt-1">
                            Klik tab "Semua Pilihan" untuk menambah
                          </p>
                        </div>
                      ) : (
                        activeAllergies.map((allergen) => {
                          const isCustom =
                            allergen.description === "Custom user input";
                          return (
                            <div
                              key={allergen.id}
                              className="group flex items-center justify-between p-4 bg-error/5 border-2 border-error rounded-xl hover:bg-error/10 transition-all"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-error rounded-full"></div>
                                <span className="font-bold text-text-primary">
                                  {allergen.name}
                                </span>
                                {isCustom && (
                                  <span className="px-2 py-0.5 bg-accent/20 text-accent text-xs font-bold rounded-lg">
                                    Custom
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => toggleAllergy(allergen.id)}
                                  className="px-3 py-1.5 bg-error/10 text-error text-xs font-bold rounded-lg hover:bg-error hover:text-white transition-all"
                                >
                                  Hapus
                                </button>
                                {isCustom && (
                                  <button
                                    onClick={(e) =>
                                      handleDeleteCustomAllergy(
                                        allergen.id,
                                        allergen.name,
                                        e
                                      )
                                    }
                                    className="p-1.5 text-text-secondary hover:text-error transition-colors"
                                    title="Hapus Permanen"
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
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                      />
                                    </svg>
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}

                  {allergyView === "available" && (
                    <div className="flex flex-wrap gap-2">
                      {availableAllergies.map((allergen) => {
                        const isCustom =
                          allergen.description === "Custom user input";
                        return (
                          <button
                            key={allergen.id}
                            onClick={() => toggleAllergy(allergen.id)}
                            className="px-4 py-2.5 rounded-xl text-sm font-bold border-2 border-border bg-bg-surface hover:border-primary hover:text-primary transition-all flex items-center gap-2"
                          >
                            <span className="text-text-primary">
                              {allergen.name}
                            </span>
                            {isCustom && (
                              <span className="w-1.5 h-1.5 bg-accent rounded-full"></span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <form
                  onSubmit={handleAddCustomAllergy}
                  className="flex gap-2 pt-4 border-t border-border"
                >
                  <Input
                    placeholder="Tambah alergi custom..."
                    value={customAllergy}
                    onChange={(e) => setCustomAllergy(e.target.value)}
                    className="h-11 text-sm"
                    containerClass="flex-1"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    variant="outline"
                    disabled={!customAllergy}
                    className="h-11 px-5"
                  >
                    + Tambah
                  </Button>
                </form>
              </Card>
            </div>

            <div className="space-y-6">
              <div className="bg-primary text-white rounded-3xl p-8 shadow-2xl shadow-primary/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-12 -mb-12"></div>
                <div className="relative z-10">
                  <h3 className="font-bold text-xl mb-1">Indeks Massa Tubuh</h3>
                  <p className="text-white/80 text-sm mb-6">
                    Berdasarkan tinggi & berat badan
                  </p>
                  <div className="flex items-end gap-3 mb-4">
                    <span className="text-6xl font-extrabold">
                      {bmiValue || "--"}
                    </span>
                    <span className="text-xl font-medium opacity-80 mb-2">
                      kg/m²
                    </span>
                  </div>
                  <div className="inline-block px-4 py-2 bg-white/20 rounded-xl text-sm font-bold backdrop-blur-sm">
                    {bmi.label}
                  </div>
                </div>
              </div>

              <Card title="Keamanan Akun">
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="w-full flex items-center justify-between p-5 rounded-2xl bg-bg-surface hover:bg-bg-surface transition-all group border-2 border-transparent hover:border-primary/20"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                    <div className="text-left">
                      <h4 className="font-bold text-text-primary">
                        Kata Sandi
                      </h4>
                      <p className="text-sm text-text-secondary">
                        Ubah password akun
                      </p>
                    </div>
                  </div>
                  <svg
                    className="w-6 h-6 text-text-secondary group-hover:text-primary group-hover:translate-x-1 transition-all"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </Card>
            </div>
          </div>

          {showPasswordModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
              <div className="bg-bg-surface w-full max-w-md rounded-3xl p-8 shadow-2xl animate-scale-up border border-border">
                <h3 className="text-2xl font-bold text-text-primary mb-6 text-center">
                  Ubah Kata Sandi
                </h3>
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <Input
                    label="Password Lama"
                    type="password"
                    value={passData.current}
                    onChange={(e) =>
                      setPassData({ ...passData, current: e.target.value })
                    }
                  />
                  <Input
                    label="Password Baru"
                    type="password"
                    value={passData.new}
                    onChange={(e) =>
                      setPassData({ ...passData, new: e.target.value })
                    }
                  />
                  <Input
                    label="Konfirmasi Password"
                    type="password"
                    value={passData.confirm}
                    onChange={(e) =>
                      setPassData({ ...passData, confirm: e.target.value })
                    }
                  />
                  <div className="flex gap-3 pt-4">
                    <Button type="submit" fullWidth loading={loading}>
                      Simpan
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      fullWidth
                      onClick={() => setShowPasswordModal(false)}
                    >
                      Batal
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <SuccessModal
            isOpen={showSuccess}
            onClose={() => setShowSuccess(false)}
            message={successMessage}
          />
        </div>
      </div>
    </MainLayout>
  );
};

export default Profile;
