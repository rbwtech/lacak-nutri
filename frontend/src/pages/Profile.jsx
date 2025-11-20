import { useState } from "react";
import { MainLayout } from "../components/layouts";
import { useAuth } from "../context/AuthContext";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false); // State Modal

  // Form Profile
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    age: user?.age || "",
    weight: user?.weight || "",
    height: user?.height || "",
    gender: user?.gender || "male",
  });

  // Form Password
  const [passData, setPassData] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(formData);
      setEditing(false);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    // TODO: Integrasi ke Backend endpoint /api/auth/change-password
    alert("Fitur ini akan berfungsi setelah backend endpoint siap!");
    setShowPasswordModal(false);
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
                  <div className="text-5xl font-extrabold text-primary mb-2">
                    {bmi || "-"}
                  </div>
                  <div className="inline-block px-3 py-1 rounded-lg bg-white border border-border text-xs font-bold text-text-primary">
                    {bmi ? "Normal" : "Lengkapi Data"}
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
