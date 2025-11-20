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
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    age: user?.age || "",
    weight: user?.weight || "",
    height: user?.height || "",
    gender: user?.gender || "male",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

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

  const bmi =
    formData.weight && formData.height
      ? (formData.weight / Math.pow(formData.height / 100, 2)).toFixed(1)
      : null;

  const getBMICategory = (bmi) => {
    if (!bmi) return null;
    if (bmi < 18.5) return { text: "Underweight", color: "text-warning-text" };
    if (bmi < 25) return { text: "Normal", color: "text-success" };
    if (bmi < 30) return { text: "Overweight", color: "text-warning-text" };
    return { text: "Obese", color: "text-error-text" };
  };

  const bmiCategory = getBMICategory(bmi);

  return (
    <MainLayout>
      <div className="bg-bg-base min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-h2 font-bold text-text-primary mb-2">
              Profil Saya
            </h1>
            <p className="text-base text-text-secondary">
              Kelola informasi personal Anda
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-h4 font-semibold text-text-primary">
                    Informasi Personal
                  </h3>
                  {!editing && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditing(true)}
                    >
                      Edit
                    </Button>
                  )}
                </div>

                <Input
                  label="Nama Lengkap"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={!editing}
                />

                <Input
                  label="Email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!editing}
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Usia"
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    disabled={!editing}
                    placeholder="25"
                  />

                  <div>
                    <label className="text-label font-medium text-text-primary mb-1.5 block">
                      Jenis Kelamin
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      disabled={!editing}
                      className="w-full px-4 py-2.5 rounded-lg border bg-bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 border-border disabled:opacity-50"
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
                    onChange={handleChange}
                    disabled={!editing}
                    placeholder="70"
                  />

                  <Input
                    label="Tinggi Badan (cm)"
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleChange}
                    disabled={!editing}
                    placeholder="170"
                  />
                </div>

                {editing && (
                  <div className="flex gap-3 pt-4">
                    <Button type="submit" loading={loading}>
                      Simpan Perubahan
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setEditing(false);
                        setFormData({
                          name: user?.name || "",
                          email: user?.email || "",
                          age: user?.age || "",
                          weight: user?.weight || "",
                          height: user?.height || "",
                          gender: user?.gender || "male",
                        });
                      }}
                    >
                      Batal
                    </Button>
                  </div>
                )}
              </form>
            </Card>

            <div className="space-y-6">
              {bmi && (
                <Card title="BMI Kamu">
                  <div className="text-center">
                    <div className="text-h1 font-bold text-primary mb-2">
                      {bmi}
                    </div>
                    <div
                      className={`text-base font-semibold ${bmiCategory?.color}`}
                    >
                      {bmiCategory?.text}
                    </div>
                    <p className="text-caption text-text-secondary mt-4">
                      BMI adalah indikator berat badan sehat berdasarkan tinggi
                      badan
                    </p>
                  </div>
                </Card>
              )}

              <Card title="Preferensi">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-base text-text-secondary">
                      Notifikasi
                    </span>
                    <input
                      type="checkbox"
                      className="w-5 h-5 text-primary rounded"
                      defaultChecked
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-base text-text-secondary">
                      Mode Gelap
                    </span>
                    <input
                      type="checkbox"
                      className="w-5 h-5 text-primary rounded"
                    />
                  </div>
                </div>
              </Card>

              <Button variant="outline" fullWidth>
                Ganti Password
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Profile;
