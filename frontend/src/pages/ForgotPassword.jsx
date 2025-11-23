import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { useTranslation } from "react-i18next";

const ForgotPassword = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setSubmitted(true);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-text-primary">
            {t("auth.forgotTitle")}
          </h1>
          <p className="text-text-secondary mt-2">{t("auth.forgotSubtitle")}</p>
        </div>

        <div className="bg-bg-surface rounded-3xl border border-border p-8 shadow-soft">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label={t("auth.email")}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("auth.emailPlaceholder")}
                required
              />
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
