import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

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
    setErrors({ ...errors, [e.target.name]: null });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

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
    } catch {
      setErrors({ submit: "Gagal mendaftar. Coba lagi." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-secondary/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-300/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

      <div className="bg-white/80 backdrop-blur-md w-full max-w-md p-8 rounded-3xl border border-white/20 shadow-2xl relative z-10">
        <div className="text-center mb-7">
          <img
            src="/lacaknutri.webp"
            alt="Logo"
            className="w-20 h-20 mx-auto mb-3 drop-shadow-lg hover:scale-105 transition-transform duration-300"
          />
          <h1 className="text-3xl font-black text-text-primary tracking-tight">
            Buat Akun Baru
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Yuk mulai perjalanan hidup sehatmu!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Nama Lengkap"
            name="name"
            placeholder="Nama Anda"
            value={formData.name}
            onChange={handleChange}
            className="bg-white/50 border-primary/20 focus:border-primary h-12"
          />

          <Input
            label="Email"
            type="email"
            name="email"
            placeholder="nama@email.com"
            value={formData.email}
            onChange={handleChange}
            className="bg-white/50 border-primary/20 focus:border-primary h-12"
          />

          <Input
            label="Password"
            type="password"
            name="password"
            placeholder="Minimal 8 karakter"
            value={formData.password}
            onChange={handleChange}
            className="bg-white/50 border-primary/20 focus:border-primary h-12"
          />

          <Input
            label="Ulangi Password"
            type="password"
            name="confirmPassword"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            className="bg-white/50 border-primary/20 focus:border-primary h-12"
          />

          {errors.submit && (
            <div className="p-3 rounded-xl bg-error/10 text-error text-sm text-center font-semibold">
              {errors.submit}
            </div>
          )}

          <Button
            type="submit"
            fullWidth
            loading={loading}
            className="h-12 text-lg shadow-lg shadow-primary/30 mt-4"
          >
            Daftar Sekarang
          </Button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-text-secondary">
            Sudah punya akun?{" "}
            <Link
              to="/login"
              className="font-bold text-primary hover:underline"
            >
              Masuk
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
