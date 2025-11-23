import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { useTranslation } from "react-i18next";

const Login = () => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLoginError(null);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (error) {
      setLoginError(t("auth.loginFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-secondary/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

      <div className="bg-bg-surface/80 dark:bg-bg-surface/90 backdrop-blur-md w-full max-w-md p-8 rounded-3xl border border-white/20 dark:border-border/50 shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <img
            src="/lacaknutri.svg"
            alt="Logo"
            className="w-20 h-20 mx-auto mb-4 drop-shadow-lg hover:scale-105 transition-transform duration-300"
          />
          <h1 className="text-3xl font-black text-text-primary tracking-tight">
            {t("auth.loginTitle")}
          </h1>
          <p className="text-text-secondary mt-2 text-sm">
            {t("auth.loginSubtitle")}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label={t("auth.email")}
            type="email"
            placeholder={t("auth.emailPlaceholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-bg-base/50 dark:bg-bg-base/30 border-primary/20 focus:border-primary h-12"
            error={loginError}
          />

          <div>
            <Input
              label={t("auth.password")}
              type="password"
              placeholder={t("auth.passwordPlaceholder")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-bg-base/50 dark:bg-bg-base/30 border-primary/20 focus:border-primary h-12"
              error={loginError}
            />
            <div className="text-right mt-1">
              <Link
                to="/forgot-password"
                className="text-xs font-bold text-primary hover:underline"
              >
                {t("auth.forgotPassword")}
              </Link>
            </div>
          </div>

          {loginError && (
            <div className="p-3 rounded-xl bg-error/10 text-error text-sm text-center font-semibold">
              {loginError}
            </div>
          )}

          <Button
            type="submit"
            fullWidth
            loading={loading}
            className="h-12 text-lg shadow-lg shadow-primary/30 mt-4"
          >
            {t("auth.loginButton")}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-text-secondary">
            {t("auth.noAccount")}{" "}
            <Link
              to="/register"
              className="font-bold text-primary hover:underline"
            >
              {t("auth.registerFree")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
