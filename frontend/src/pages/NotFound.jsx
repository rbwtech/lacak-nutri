import { Link } from "react-router-dom";
import { MainLayout } from "../components/layouts";
import Button from "../components/ui/Button";
import { useTranslation } from "react-i18next";

const NotFound = () => {
  const { t } = useTranslation();
  return (
    <MainLayout>
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-9xl font-bold text-primary mb-4">404</h1>
          <h2 className="text-h2 font-bold text-text-primary mb-4">
            {t("notfound.title")}
          </h2>
          <p className="text-base text-text-secondary mb-8 max-w-md">
            {t("notfound.subtitle")}
          </p>
          <Link to="/">
            <Button size="lg">{t("notfound.backButton")}</Button>
          </Link>
        </div>
      </div>
    </MainLayout>
  );
};

export default NotFound;
