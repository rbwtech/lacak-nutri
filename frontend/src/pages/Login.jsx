import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { validateEmail } from "../utils/helpers";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setErrors({ submit: "Mohon isi semua kolom" });
      return;
    }
    setLoading(true);
    try {
      await login(formData.email, formData.password);
      navigate("/dashboard");
    } catch (error) {
      setErrors({
        submit: error.response?.data?.message || "Email atau password salah",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-md">
        {/* Logo Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-4">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-text-primary">
            LacakNutri
          </h1>
          <p className="text-text-secondary mt-2">Selamat datang kembali!</p>
        </div>

        {/* Card Form */}
        <div className="bg-bg-surface rounded-3xl border border-border p-8 shadow-soft">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="contoh@email.com"
            />

            <div className="space-y-1">
              <Input
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                placeholder="••••••••"
              />
              <div className="text-right">
                <Link
                  to="/forgot-password"
                  class="text-xs text-primary font-semibold hover:underline"
                >
                  Lupa Password?
                </Link>
              </div>
            </div>

            {errors.submit && (
              <div className="p-4 rounded-2xl bg-error/10 text-error text-sm font-medium text-center">
                {errors.submit}
              </div>
            )}

            <Button type="submit" fullWidth loading={loading} size="lg">
              Masuk Sekarang
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center mt-8 text-text-secondary text-sm">
          Belum punya akun?{" "}
          <Link
            to="/register"
            className="text-primary font-bold hover:underline"
          >
            Daftar Gratis
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
