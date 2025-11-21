import { useState, useEffect } from "react";
import { MainLayout } from "../components/layouts";
import { useAuth } from "../context/AuthContext";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import api from "../config/api";

const Profile = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [allergens, setAllergens] = useState([]);
  const [userAllergies, setUserAllergies] = useState([]);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // State
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

  // Logic Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [masterRes, myRes] = await Promise.all([
          api.get("/users/allergens"),
          api.get("/users/my-allergies"),
        ]);
        setAllergens(masterRes.data);
        setUserAllergies(myRes.data.map((a) => a.id));
      } catch (e) {
        console.error("Gagal load alergi", e);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        gender: formData.gender,
        age: formData.age ? parseInt(formData.age) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        height: formData.height ? parseFloat(formData.height) : null,
      };
      await updateProfile(payload);
      setEditing(false);
    } catch (error) {
      alert("Gagal menyimpan profil.");
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
      alert("Password berhasil diubah. Login ulang.");
      setShowPasswordModal(false);
      setPassData({ current: "", new: "", confirm: "" });
    } catch (e) {
      alert(e.response?.data?.detail || "Gagal.");
    } finally {
      setLoading(false);
    }
  };

  const toggleAllergy = async (id) => {
    const newSelection = userAllergies.includes(id)
      ? userAllergies.filter((a) => a !== id)
      : [...userAllergies, id];
    setUserAllergies(newSelection);
    try {
      await api.put("/users/allergies", { allergen_ids: newSelection });
    } catch (e) {}
  };

  // BMI Logic
  const bmiValue =
    formData.weight && formData.height
      ? (formData.weight / Math.pow(formData.height / 100, 2)).toFixed(1)
      : null;

  const getBMIStatus = (val) => {
    if (!val)
      return {
        label: "Belum Ada Data",
        color: "text-gray-400",
        bg: "bg-gray-100",
      };
    const n = parseFloat(val);
    if (n < 18.5)
      return {
        label: "Berat Kurang",
        color: "text-warning-text",
        bg: "bg-warning/10",
      };
    if (n < 25)
      return { label: "Ideal", color: "text-success", bg: "bg-success/10" };
    if (n < 30)
      return {
        label: "Berat Lebih",
        color: "text-warning-text",
        bg: "bg-warning/10",
      };
    return { label: "Obesitas", color: "text-error", bg: "bg-error/10" };
  };
  const bmi = getBMIStatus(bmiValue);

  // Styling Variables (Kunci agar tidak geser)
  // Input Read-Only: Background abu, border transparan (tetap ada border width agar size sama)
  // Input Edit: Background putih, border normal
  const inputClass = `w-full px-4 py-3 rounded-xl border transition-all text-sm font-medium outline-none`;
  const readOnlyClass = `bg-gray-50 border-transparent text-text-secondary cursor-default`;
  const editClass = `bg-white border-border focus:ring-2 focus:ring-primary/20 focus:border-primary text-text-primary`;

  return (
    <MainLayout>
      <div className="bg-bg-base min-h-screen py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Profile Header */}
          <div className="flex items-center gap-6 mb-10">
            <div className="w-24 h-24 rounded-full bg-linear-to-br from-primary to-orange-500 flex items-center justify-center text-4xl font-extrabold text-white shadow-lg border-4 border-white">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-text-primary">
                {user?.name}
              </h1>
              <p className="text-text-secondary">{user?.email}</p>
              <div className="flex gap-2 mt-3">
                <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-lg uppercase tracking-wide">
                  Member
                </span>
                {bmiValue && (
                  <span
                    className={`px-3 py-1 ${bmi.bg} ${bmi.color} text-xs font-bold rounded-lg uppercase tracking-wide`}
                  >
                    BMI: {bmi.label}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* MAIN COLUMN: Personal Info (8/12) */}
            <div className="lg:col-span-8 space-y-6">
              <Card className="relative">
                {/* Header Card dengan tombol Edit absolut di kanan atas agar layout isi tidak goyang */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
                  <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                    <span className="p-1.5 bg-primary/10 rounded-lg text-primary">
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
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </span>
                    Informasi Personal
                  </h3>
                  {!editing && (
                    <button
                      onClick={() => setEditing(true)}
                      className="text-primary text-sm font-bold hover:bg-primary/5 px-3 py-1.5 rounded-xl transition-colors"
                    >
                      Edit Data
                    </button>
                  )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 mt-2">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-text-secondary uppercase ml-1">
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
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-text-secondary uppercase ml-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        disabled={true}
                        className={`${inputClass} bg-gray-100 text-gray-400 border-transparent cursor-not-allowed`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-text-secondary uppercase ml-1">
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
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-text-secondary uppercase ml-1">
                        Gender
                      </label>
                      <div className="relative">
                        <select
                          value={formData.gender}
                          onChange={(e) =>
                            setFormData({ ...formData, gender: e.target.value })
                          }
                          disabled={!editing}
                          className={`${inputClass} ${
                            editing ? editClass : readOnlyClass
                          } appearance-none`}
                        >
                          <option value="male">Pria</option>
                          <option value="female">Wanita</option>
                        </select>
                        {editing && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary">
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
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-text-secondary uppercase ml-1">
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
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-text-secondary uppercase ml-1">
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
                        onClick={() => setEditing(false)}
                        className="px-6 py-3 text-sm font-bold text-text-secondary hover:bg-gray-100 rounded-xl transition-colors"
                      >
                        Batal
                      </button>
                    </div>
                  )}
                </form>
              </Card>

              <Card title="Preferensi Alergi">
                <p className="text-sm text-text-secondary mb-4">
                  Pilih bahan makanan yang ingin Anda hindari (Scanner akan
                  memberi peringatan).
                </p>
                <div className="flex flex-wrap gap-2">
                  {allergens.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => toggleAllergy(a.id)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all duration-200 flex items-center gap-2 ${
                        userAllergies.includes(a.id)
                          ? "border-error bg-error/5 text-error shadow-sm"
                          : "border-transparent bg-gray-100 text-text-secondary hover:bg-gray-200"
                      }`}
                    >
                      {userAllergies.includes(a.id) && (
                        <span className="text-lg">•</span>
                      )}
                      {a.name}
                    </button>
                  ))}
                </div>
              </Card>
            </div>

            {/* SIDE COLUMN: Stats & Settings (4/12) */}
            <div className="lg:col-span-4 space-y-6">
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

              <Card title="Keamanan Akun">
                <div className="space-y-1">
                  <button
                    onClick={() => setShowPasswordModal(true)}
                    className="w-full flex items-center justify-between p-4 rounded-xl bg-bg-base hover:bg-gray-100 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-text-secondary group-hover:text-primary transition-colors shadow-sm">
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
                      className="w-5 h-5 text-text-secondary"
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

          {/* Modal Ganti Password */}
          {showPasswordModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl animate-scale-up">
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
        </div>
      </div>
    </MainLayout>
  );
};

export default Profile;
