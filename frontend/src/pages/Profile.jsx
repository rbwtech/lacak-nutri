import { useState, useEffect } from "react";
import { MainLayout } from "../components/layouts";
import { useAuth } from "../context/AuthContext";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

const Profile = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const [editing, setEditing] = useState(false);
  const [allergens, setAllergens] = useState([]);
  const [userAllergies, setUserAllergies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

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

  const calculateBMIValue = () => {
    if (formData.weight && formData.height) {
      const heightInMeters = formData.height / 100;
      return (formData.weight / (heightInMeters * heightInMeters)).toFixed(1);
    }
    return null;
  };

  const bmiValue = calculateBMIValue();

  const getBMICategory = (bmi) => {
    if (!bmi)
      return {
        label: "Lengkapi Data",
        color: "text-text-secondary",
        bg: "bg-gray-100",
      };
    const val = parseFloat(bmi);

    if (val <= 18.49)
      return {
        label: "Berat Kurang (Underweight)",
        color: "text-warning-text",
        bg: "bg-warning/10",
      };
    if (val >= 18.5 && val <= 24.9)
      return {
        label: "Normal (Ideal)",
        color: "text-success",
        bg: "bg-success/10",
      };
    if (val >= 25 && val <= 27)
      return {
        label: "Berlebih (Overweight)",
        color: "text-warning-text",
        bg: "bg-warning/10",
      };
    return { label: "Obesitas", color: "text-error", bg: "bg-error/10" };
  };

  const bmiCategory = getBMICategory(bmiValue);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        gender: formData.gender,
        age: parseInt(formData.age) || null,
        weight: parseFloat(formData.weight) || null,
        height: parseFloat(formData.height) || null,
      };

      await updateProfile(payload);
      setEditing(false);
    } catch (error) {
      console.error(error);
      alert("Gagal mengupdate profil");
    } finally {
      setLoading(false);
    }
  };

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

  const toggleAllergy = async (id) => {
    const newSelection = userAllergies.includes(id)
      ? userAllergies.filter((a) => a !== id)
      : [...userAllergies, id];

    setUserAllergies(newSelection);

    try {
      await api.put("/users/allergies", { allergen_ids: newSelection });
    } catch (e) {
      console.error("Gagal simpan alergi", e);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passData.new !== passData.confirm) {
      alert("Konfirmasi password tidak cocok!");
      return;
    }

    if (passData.new.length < 8) {
      alert("Password minimal 8 karakter!");
      return;
    }

    setLoading(true);
    try {
      await changePassword({
        current_password: passData.current,
        new_password: passData.new,
      });

      alert("Password berhasil diubah! Silakan login ulang.");
      setShowPasswordModal(false);
      setPassData({ current: "", new: "", confirm: "" });
    } catch (error) {
      const msg = error.response?.data?.detail || "Gagal mengubah password.";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  // BMI Calculation Logic (Tetap)
  const bmi =
    formData.weight && formData.height
      ? (formData.weight / Math.pow(formData.height / 100, 2)).toFixed(1)
      : null;

  return (
    <MainLayout>
      <div className="bg-bg-base min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h1 className="text-3xl font-extrabold text-text-primary mb-1">
                Profil Saya
              </h1>
              <p className="text-text-secondary">
                Kelola informasi personal dan preferensi Anda
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* LEFT COLUMN: Profile Form */}
            <Card className="md:col-span-2">
              <div className="flex items-center justify-between mb-6 border-b border-border pb-4">
                <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-primary"
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
                  Informasi Personal
                </h3>
                {!editing && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setEditing(true)}
                  >
                    Edit Profil
                  </Button>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                  label="Nama Lengkap"
                  name="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  disabled={!editing}
                />
                <Input
                  label="Email"
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled={true}
                  helperText="Email tidak dapat diubah"
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Usia (Tahun)"
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={(e) =>
                      setFormData({ ...formData, age: e.target.value })
                    }
                    disabled={!editing}
                  />
                  <div>
                    <label className="text-sm font-bold text-text-primary ml-1 mb-2 block">
                      Jenis Kelamin
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={(e) =>
                        setFormData({ ...formData, gender: e.target.value })
                      }
                      disabled={!editing}
                      className="w-full px-4 py-3.5 rounded-2xl border border-border bg-bg-surface text-text-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                    >
                      <option value="male">Laki-laki</option>
                      <option value="female">Perempuan</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Berat Badan (kg)"
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={(e) =>
                      setFormData({ ...formData, weight: e.target.value })
                    }
                    disabled={!editing}
                  />
                  <Input
                    label="Tinggi Badan (cm)"
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={(e) =>
                      setFormData({ ...formData, height: e.target.value })
                    }
                    disabled={!editing}
                  />
                </div>

                {editing && (
                  <div className="flex gap-3 pt-4 border-t border-border mt-4">
                    <Button type="submit" loading={loading}>
                      Simpan
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setEditing(false)}
                    >
                      Batal
                    </Button>
                  </div>
                )}
              </form>
            </Card>

            {/* RIGHT COLUMN: Actions & Stats */}
            <div className="space-y-6">
              {/* BMI Card */}
              <Card className="bg-linear-to-br from-bg-surface to-primary/5 border-primary/20">
                <div className="text-center py-4">
                  <p className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-2">
                    Indeks Massa Tubuh
                  </p>
                  <div className="text-5xl font-extrabold text-primary mb-3">
                    {bmiValue || "-"}
                  </div>
                  <div
                    className={`inline-block px-4 py-1.5 rounded-full border border-border text-xs font-bold ${bmiCategory.color} ${bmiCategory.bg}`}
                  >
                    {bmiCategory.label}
                  </div>
                </div>
              </Card>

              {/* Account Settings */}
              <Card title="Keamanan Akun">
                <div className="space-y-4">
                  <Button
                    variant="outline"
                    fullWidth
                    className="justify-start gap-2"
                    onClick={() => setShowPasswordModal(true)}
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
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    Ganti Password
                  </Button>
                </div>
              </Card>

              {/* Allergens */}
              <Card title="Alergi Saya">
                <p className="text-xs text-text-secondary mb-4">
                  Pilih bahan yang ingin Anda hindari:
                </p>
                <div className="flex flex-wrap gap-2">
                  {allergens.map((allergen) => (
                    <button
                      key={allergen.id}
                      onClick={() => toggleAllergy(allergen.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                        userAllergies.includes(allergen.id)
                          ? "bg-error text-white border-error shadow-md"
                          : "bg-bg-base text-text-secondary border-border hover:border-primary/50"
                      }`}
                    >
                      {allergen.name}
                    </button>
                  ))}
                </div>
              </Card>
            </div>
          </div>

          {/* MODAL GANTI PASSWORD */}
          {showPasswordModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
              <div className="bg-bg-surface w-full max-w-md rounded-3xl p-8 shadow-2xl border border-border">
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
                    label="Konfirmasi Password Baru"
                    type="password"
                    value={passData.confirm}
                    onChange={(e) =>
                      setPassData({ ...passData, confirm: e.target.value })
                    }
                  />

                  <div className="flex gap-3 pt-4">
                    <Button type="submit" fullWidth>
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
