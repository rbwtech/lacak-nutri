import { useState, useEffect } from "react";
import { MainLayout } from "../components/layouts";
import { useAuth } from "../context/AuthContext";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import SuccessModal from "../components/ui/SuccessModal";
import api from "../config/api";

const Profile = () => {
  const { user, setUser, changePassword } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // State Alergi
  const [masterAllergens, setMasterAllergens] = useState([]); // Semua opsi alergi (template + custom user lain jika ada)
  const [userAllergies, setUserAllergies] = useState([]); // ID alergi yang dimiliki user saat ini

  const [customAllergy, setCustomAllergy] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [allRes, myRes] = await Promise.all([
          api.get("/users/allergens"), // Ambil semua template alergi + custom public
          api.get("/users/my-allergies"), // Ambil alergi user saat ini
        ]);
        setMasterAllergens(allRes.data);
        setUserAllergies(myRes.data.map((a) => a.id));
      } catch (e) {
        console.error("Gagal load alergi", e);
      }
    };
    fetchData();
    setPhotoPreview(user?.photo_url || null);
  }, [user]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Ukuran file maksimal 2MB");
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

      if (photoFile) {
        form.append("photo", photoFile);
      }

      const { data } = await api.put("/users/profile", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));

      setEditing(false);
      setSuccessMessage("Profil berhasil diperbarui!");
      setShowSuccess(true);
    } catch (error) {
      console.error(error);
      alert("Gagal menyimpan profil. Cek koneksi atau input Anda.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passData.new !== passData.confirm) return alert("Konfirmasi salah");
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
      alert(e.response?.data?.detail || "Gagal mengganti password.");
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIC ALERGI BARU ---

  // 1. Toggle Alergi (Aktifkan/Nonaktifkan)
  // Ini hanya mengubah relasi di tabel user_allergies, TIDAK MENGHAPUS MASTER DATA
  const toggleAllergy = async (id) => {
    const isSelected = userAllergies.includes(id);
    const newSelection = isSelected
      ? userAllergies.filter((a) => a !== id) // Hapus dari list saya
      : [...userAllergies, id]; // Tambah ke list saya

    setUserAllergies(newSelection);

    try {
      // Kirim list ID terbaru ke backend untuk disimpan
      await api.put("/users/allergies", { allergen_ids: newSelection });
    } catch (e) {
      console.error("Gagal update preferensi alergi", e);
    }
  };

  // 2. Tambah Alergi Custom
  const handleAddCustomAllergy = async (e) => {
    e.preventDefault();
    if (!customAllergy.trim()) return;
    try {
      const { data } = await api.post("/users/allergies/custom", {
        name: customAllergy,
      });

      // Tambahkan ke master list (agar muncul di UI)
      const newAllergen = data.allergen;
      // Cek duplikasi di master list visual
      setMasterAllergens((prev) => {
        if (prev.find((a) => a.id === newAllergen.id)) return prev;
        return [...prev, newAllergen];
      });

      // Otomatis select alergi yang baru dibuat
      if (!userAllergies.includes(newAllergen.id)) {
        const newSelection = [...userAllergies, newAllergen.id];
        setUserAllergies(newSelection);
      }

      setCustomAllergy("");
    } catch (error) {
      alert(error.response?.data?.detail || "Gagal menambah alergi.");
    }
  };

  // 3. Hapus Permanen (Hanya untuk Custom Alergi)
  // Jika user click tombol 'X' kecil di alergi custom
  const handleDeleteCustomAllergy = async (allergenId, e) => {
    e.stopPropagation(); // Jangan trigger toggle
    if (!window.confirm("Hapus permanen alergi custom ini dari database?"))
      return;

    try {
      await api.delete(`/users/allergens/${allergenId}`);

      // Hapus dari tampilan master list
      setMasterAllergens((prev) => prev.filter((a) => a.id !== allergenId));
      // Hapus dari seleksi user
      setUserAllergies((prev) => prev.filter((id) => id !== allergenId));
    } catch (error) {
      alert(
        "Gagal menghapus. Mungkin ini alergi template sistem yang tidak bisa dihapus."
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
        bg: "bg-gray-100",
      };
    const n = parseFloat(val);
    if (n < 18.5)
      return {
        label: "Berat Kurang",
        color: "text-warning",
        bg: "bg-warning/10",
      };
    if (n < 25)
      return { label: "Ideal", color: "text-success", bg: "bg-success/10" };
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
  bg-gray-50 border-transparent text-text-secondary cursor-default
  dark:bg-[#2a2a2a] dark:text-gray-400
`;

  const editClass = `
  bg-white border-border focus:ring-2 focus:ring-primary/20 focus:border-primary text-text-primary
  dark:bg-[#1f1f1f] dark:border-[#5c5c5c] dark:text-white
`;

  return (
    <MainLayout>
      <div className="bg-bg-base min-h-screen py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* --- HEADER PROFIL --- */}
          <div className="flex items-center gap-6 mb-10">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-linear-to-br from-primary to-orange-500 flex items-center justify-center text-4xl font-extrabold text-white">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              {editing && (
                <label className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-all shadow-lg">
                  <svg
                    className="w-4 h-4"
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
              <h1 className="text-3xl font-extrabold text-text-primary">
                {user?.name}
              </h1>
              <p className="text-text-secondary mt-1">{user?.email}</p>
            </div>
            {!editing && (
              <Button onClick={() => setEditing(true)}>Edit Profil</Button>
            )}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              {/* --- CARD INFORMASI PRIBADI --- */}
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
                  </div>

                  {editing && (
                    <div className="flex gap-3 pt-4 border-t border-border animate-fade-in-up">
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
                        className="px-6 py-3 text-sm font-bold text-text-secondary hover:bg-gray-100 rounded-xl transition-colors"
                      >
                        Batal
                      </button>
                    </div>
                  )}
                </form>
              </Card>

              {/* --- CARD PREFERENSI ALERGI --- */}
              <Card title="Preferensi Alergi">
                <p className="text-sm text-text-secondary mb-4">
                  Klik untuk mengaktifkan (merah) alergi yang ingin Anda
                  hindari.
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {masterAllergens.map((allergen) => {
                    const isActive = userAllergies.includes(allergen.id);
                    // Asumsi backend kirim field 'created_by' di AllergenOut, kalau tidak ada anggap template
                    const isCustom =
                      allergen.description === "Custom user input";

                    return (
                      <div key={allergen.id} className="relative group">
                        <button
                          onClick={() => toggleAllergy(allergen.id)}
                          className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all duration-200 flex items-center gap-2
                            ${
                              isActive
                                ? "border-error bg-error/10 text-error shadow-sm" // Merah = Aktif
                                : "border-gray-200 bg-gray-50 text-text-secondary hover:border-gray-300" // Abu = Nonaktif
                            }
                            ${isCustom ? "pr-8" : ""} 
                          `}
                        >
                          {isActive && <span className="text-lg">•</span>}
                          {allergen.name}
                        </button>

                        {/* Tombol Hapus Permanen (Hanya untuk Custom) */}
                        {isCustom && (
                          <button
                            onClick={(e) =>
                              handleDeleteCustomAllergy(allergen.id, e)
                            }
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-600 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Hapus Permanen"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                <form
                  onSubmit={handleAddCustomAllergy}
                  className="flex gap-2 mt-4 pt-4 border-t border-border"
                >
                  <Input
                    placeholder="Tambah alergi lain..."
                    value={customAllergy}
                    onChange={(e) => setCustomAllergy(e.target.value)}
                    className="h-10 text-sm"
                    containerClass="flex-1"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    variant="outline"
                    disabled={!customAllergy}
                  >
                    + Tambah
                  </Button>
                </form>
              </Card>
            </div>

            <div className="space-y-6">
              {/* --- CARD BMI --- */}
              <div className="bg-primary text-white rounded-3xl p-6 shadow-lg shadow-primary/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                <h3 className="font-bold text-lg mb-1">Indeks Massa Tubuh</h3>
                <p className="text-primary-100 text-sm mb-4">
                  Berdasarkan tinggi & berat badan.
                </p>
                <div className="flex items-end gap-2 mb-2">
                  <span className="text-5xl font-extrabold">
                    {bmiValue || "--"}
                  </span>
                  <span className="text-lg font-medium opacity-80 mb-1">
                    kg/m²
                  </span>
                </div>
                <div className="inline-block px-3 py-1 bg-white/20 rounded-lg text-sm font-bold backdrop-blur-sm">
                  {bmi.label}
                </div>
              </div>

              {/* --- CARD PASSWORD --- */}
              <Card title="Keamanan Akun">
                <div className="space-y-1">
                  <button
                    onClick={() => setShowPasswordModal(true)}
                    className="w-full flex items-center justify-between p-4 rounded-xl bg-bg-base hover:bg-bg-soft transition-colors group border border-border"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-bg-soft shadow-sm text-text-secondary group-hover:text-primary transition-colors">
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
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                          />
                        </svg>
                      </div>
                      <div className="text-left">
                        <h4 className="font-bold text-text-primary text-sm">
                          Kata Sandi
                        </h4>
                        <p className="text-xs text-text-secondary">
                          Ubah password akun
                        </p>
                      </div>
                    </div>
                    <svg
                      className="w-5 h-5 text-text-secondary group-hover:text-primary transition-colors"
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
                </div>
              </Card>
            </div>
          </div>

          {/* --- MODAL PASSWORD --- */}
          {showPasswordModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-bg-base w-full max-w-md rounded-3xl p-8 shadow-2xl animate-scale-up border border-border">
                <h3 className="text-xl font-bold text-text-primary mb-6 text-center">
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
