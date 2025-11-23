import { useState } from "react";
import { useTranslation } from "react-i18next";
import Card from "./Card";
import Button from "./Button";
import Input from "./Input";
import api from "../../config/api";

const OwnerAuthorizationModal = ({ isOpen, onAuthorize, onClose }) => {
  const { t } = useTranslation();
  const [authCode, setAuthCode] = useState("");
  const [error, setError] = useState(null);
  const [waLink, setWaLink] = useState(null);
  const [codeRequested, setCodeRequested] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  if (!isOpen) return null;

  const handleRequestCode = async () => {
    setIsRequesting(true);
    setError(null);
    try {
      const { data } = await api.get("/admin/auth-code");
      setWaLink(data.wa_link);
      setCodeRequested(true);
      setError(null);
    } catch (e) {
      setError(
        t("admin.auth.errorRequestCode") + (e.response?.data?.detail || "")
      );
    } finally {
      setIsRequesting(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!authCode || authCode.length !== 8) {
      setError(t("admin.auth.errorInvalidCodeLength"));
      return;
    }
    onAuthorize(authCode.toUpperCase());
    setAuthCode("");
    setError(null);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <Card className="w-full max-w-md p-6">
        <div className="text-center">
          <svg
            className="w-10 h-10 text-primary mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
            />
          </svg>
          <h3 className="text-xl font-bold text-text-primary mb-2">
            {t("admin.auth.title")}
          </h3>
          <p className="text-sm text-text-secondary mb-4">
            {t("admin.auth.subtitle")}
          </p>

          {!codeRequested ? (
            <Button
              onClick={handleRequestCode}
              loading={isRequesting}
              fullWidth
            >
              {t("admin.auth.requestCode")}
            </Button>
          ) : (
            <>
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-full bg-success hover:bg-success/90 text-white font-bold px-4 py-3 rounded-xl transition-colors mb-4 text-sm"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12.04 2C7.39 2 3.65 5.74 3.65 10.39c0 4.14 2.8 7.6 6.64 8.73l-.86 2.53c-.11.31.25.59.55.39l2.25-1.74a7.92 7.92 0 001.76.22c4.65 0 8.39-3.74 8.39-8.39C20.35 5.74 16.61 2 12.04 2zm-3 12.92a.68.68 0 01-.48-.22l-.72-.73a.8.8 0 01-.22-.6c0-.3.12-.55.35-.77l2.25-2.25c.23-.22.48-.35.77-.35s.55.12.77.35l2.25 2.25c.23.22.35.48.35.77s-.12.55-.35.77l-.72.73a.68.68 0 01-.48.22c-.3 0-.55-.12-.77-.35l-1.3-1.3-.72-.73a.8.8 0 01-.22-.6c0-.3.12-.55.35-.77l.72-.73z" />
                </svg>
                {t("admin.auth.contactOwner")}
              </a>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label={t("admin.auth.authCode")}
                  type="text"
                  placeholder="8 DIGIT CODE"
                  value={authCode}
                  onChange={(e) =>
                    setAuthCode(e.target.value.toUpperCase().slice(0, 8))
                  }
                  maxLength={8}
                />
                {error && (
                  <p className="text-xs text-error font-medium">{error}</p>
                )}
                <Button type="submit" fullWidth>
                  {t("admin.auth.submitCode")}
                </Button>
              </form>
            </>
          )}
        </div>
        <Button variant="ghost" onClick={onClose} fullWidth className="mt-4">
          {t("common.cancel")}
        </Button>
      </Card>
    </div>
  );
};

export default OwnerAuthorizationModal;
