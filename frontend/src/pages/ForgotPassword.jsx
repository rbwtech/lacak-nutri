import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { useTranslation } from "react-i18next";
import { useSmartCaptcha } from "../hooks/useSmartCaptcha";
import axios from "axios";
const API_BASE_URL = import.meta.env.VITE_API_URL;

const ForgotPassword = () => {
  const { t } = useTranslation();
  const { getToken } = useSmartCaptcha();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = await getToken("forgot_password");

      if (!token) {
        throw new Error(
          t("auth.recaptchaRequired") || "Verifikasi keamanan gagal."
        );
      }

      const payload = { email, recaptcha_token: token };
      await axios.post(`${API_BASE_URL}/auth/forgot-password-request`, payload);

      setSubmitted(true);
    } catch (err) {
      let errorMsg = t("common.error");

      if (axios.isAxiosError(err) && err.response) {
        const detail = err.response.data?.detail;

        if (typeof detail === "string") {
          errorMsg = detail;
        } else if (
          Array.isArray(detail) &&
          detail.length > 0 &&
          detail[0].msg
        ) {
          const msgs = detail
            .map((e) => {
              const field = e.loc.length > 1 ? e.loc[1] : "field";
              return `${field}: ${e.msg}`;
            })
            .join("; ");
          errorMsg = `Validasi gagal. ${msgs}`;
        } else {
          errorMsg = t("common.operationFailed");
        }
      }

      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center p-4 relative overflow-hidden animate-fade-in">
      <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-secondary/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

      <div className="bg-bg-surface/80 dark:bg-bg-surface/90 backdrop-blur-md w-full max-w-md p-8 rounded-3xl border border-white/20 dark:border-border/50 shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <img
            src="/lacaknutri.svg"
            alt="Logo"
            className="w-16 h-16 mx-auto mb-4 drop-shadow-lg"
          />
          <h1 className="text-3xl font-black text-text-primary tracking-tight">
            {t("auth.forgotTitle")}
          </h1>
          <p className="text-text-secondary mt-2 text-sm">
            {t("auth.forgotSubtitle")}
          </p>
        </div>

        <div>
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label={t("auth.email")}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("auth.emailPlaceholder")}
                className="bg-bg-base/50 dark:bg-bg-base/30 border-primary/20 focus:border-primary h-12"
                required
              />

              {error && (
                <div className="p-3 rounded-xl bg-error/10 text-error text-sm text-center font-semibold">
                  {error}
                </div>
              )}

              <Button type="submit" fullWidth loading={loading} size="lg">
                {t("auth.sendResetLink")}
              </Button>
            </form>
          ) : (
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
                {t("auth.checkEmailTitle")}
              </h3>
              <p className="text-text-secondary mb-6">
                {t("auth.resetSentTo")} <strong>{email}</strong>
              </p>
              <Button
                variant="outline"
                fullWidth
                onClick={() => setSubmitted(false)}
              >
                {t("auth.resend")}
              </Button>
            </div>
          )}
        </div>

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

export default ForgotPassword;
