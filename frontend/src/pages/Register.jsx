import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { validateEmail, validatePassword } from "../utils/helpers";

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Validasi sederhana
    if (formData.password !== formData.confirmPassword) {
      setErrors({ confirmPassword: "Password tidak sama" });
      setLoading(false);
      return;
    }

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      navigate("/dashboard");
    } catch (error) {
      setErrors({ submit: "Gagal mendaftar. Coba lagi." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-text-primary">
            Buat Akun Baru
          </h1>
          <p className="text-text-secondary mt-2">
            Mulai perjalanan sehatmu hari ini
          </p>
        </div>

        <div className="bg-bg-surface rounded-3xl border border-border p-8 shadow-soft">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Nama Lengkap"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nama Anda"
            />
            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="nama@email.com"
            />
            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Minimal 8 karakter"
            />
            <Input
              label="Ulangi Password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              error={errors.confirmPassword}
            />

            {errors.submit && (
              <div className="p-3 rounded-xl bg-error/10 text-error text-sm text-center font-medium">
                {errors.submit}
              </div>
            )}

            <Button type="submit" fullWidth loading={loading} size="lg">
              Daftar
            </Button>
          </form>
        </div>

        <p className="text-center mt-8 text-text-secondary text-sm">
          Sudah punya akun?{" "}
          <Link to="/login" className="text-primary font-bold hover:underline">
            Masuk
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
