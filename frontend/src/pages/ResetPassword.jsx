import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { useTranslation } from "react-i18next";
import api from "../config/api";

const ResetPassword = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Token check (Tampilkan error jika token hilang)
  if (!token) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-error">
            {t("auth.invalidResetLink")}
          </h1>
          <p className="text-text-secondary mt-4">
            {t("auth.resetLinkMissing")}
          </p>
          <Link
            to="/login"
            className="mt-4 inline-block text-primary font-bold hover:underline"
          >
            {t("auth.backToLogin")}
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (password.length < 8) {
      setError(t("auth.passwordHint"));
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError(t("auth.passwordMismatch"));
      setLoading(false);
      return;
    }

    try {
      await api.post("/auth/reset-password", {
        token: token,
        new_password: password,
      });
      setSuccess(true);
    } catch (err) {
      const errorDetail = err.response?.data?.detail;
      setError(errorDetail || t("common.operationFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center p-4 relative overflow-hidden animate-fade-in">
      {/* Background Blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-secondary/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>

      <div className="bg-bg-surface/80 dark:bg-bg-surface/90 backdrop-blur-md w-full max-w-md p-8 rounded-3xl border border-white/20 dark:border-border/50 shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <img
            src="/lacaknutri.svg"
            alt="Logo"
            className="w-16 h-16 mx-auto mb-4 drop-shadow-lg"
          />
          <h1 className="text-3xl font-black text-text-primary tracking-tight">
            {t("auth.resetPasswordTitle")}
          </h1>
          <p className="text-text-secondary mt-2 text-sm">
            {t("auth.resetPasswordSubtitle")}
          </p>
        </div>

        {success ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto mb-4">
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-text-primary mb-2">
              {t("auth.passwordChanged")}
            </h3>
            <p className="text-text-secondary mb-6">
              {t("auth.pleaseLoginAgain")}
            </p>
            <Button fullWidth onClick={() => navigate("/login")}>
              {t("auth.loginButton")}
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label={t("auth.newPassword")}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("auth.passwordHint")}
              className="bg-bg-base/50 dark:bg-bg-base/30 border-primary/20 focus:border-primary h-12"
              required
            />
            <Input
              label={t("auth.confirmNewPassword")}
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t("auth.passwordPlaceholder")}
              className="bg-bg-base/50 dark:bg-bg-base/30 border-primary/20 focus:border-primary h-12"
              required
            />

            {error && (
              <div className="p-3 rounded-xl bg-error/10 text-error text-sm text-center font-semibold">
                {error}
              </div>
            )}

            <Button
              type="submit"
              fullWidth
              loading={loading}
              className="h-12 text-lg shadow-lg shadow-primary/30 mt-4"
            >
              {t("auth.resetPasswordButton")}
            </Button>
          </form>
        )}

        <p className="text-center mt-8 text-text-secondary text-sm">
          {t("auth.backTo")}{" "}
          <Link to="/login" className="text-primary font-bold hover:underline">
            {t("auth.loginPage")}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
