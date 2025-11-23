import { MainLayout } from "../components/layouts";
import Card from "../components/ui/Card";
import { useTranslation } from "react-i18next";

// --- About Page ---
export const About = () => {
  const { t } = useTranslation();
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-text-primary mb-4">
            {t("static.aboutTitle")}
          </h1>
          <p className="text-lg text-text-secondary">
            {t("static.aboutSubtitle")}
          </p>
        </div>
        <Card className="mb-8">
          <div className="prose prose-lg dark:prose-invert max-w-none text-text-primary">
            <p>{t("static.aboutP1")}</p>
            <h3>{t("static.missionTitle")}</h3>
            <ul>
              <li>{t("static.mission1")}</li>
              <li>{t("static.mission2")}</li>
              <li>{t("static.mission3")}</li>
            </ul>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
};

// --- FAQ Page ---
export const FAQ = () => {
  const { t } = useTranslation();
  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-text-primary mb-8 text-center">
          {t("static.faqTitle")}
        </h1>
        <div className="space-y-4">
          {[
            {
              q: t("static.faqQ1"),
              a: t("static.faqA1"),
            },
            {
              q: t("static.faqQ2"),
              a: t("static.faqA2"),
            },
            {
              q: t("static.faqQ3"),
              a: t("static.faqA3"),
            },
          ].map((item, idx) => (
            <Card
              key={idx}
              padding={true}
              className="hover:shadow-md transition-shadow"
            >
              <h3 className="font-bold text-lg text-text-primary mb-2">
                {item.q}
              </h3>
              <p className="text-text-secondary">{item.a}</p>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

// --- Contact Page ---
export const Contact = () => {
  const { t } = useTranslation();
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-text-primary mb-8 text-center">
          {t("static.contactTitle")}
        </h1>
        <div className="grid md:grid-cols-2 gap-8">
          <Card title={t("static.contactCard1Title")}>
            <div className="space-y-4 text-text-secondary">
              <p>
                <strong>{t("static.contactEmail")}:</strong>{" "}
                lacaknutri@rbwtech.io
              </p>
              <p>
                <strong>{t("static.contactPhone")}:</strong> +62 851-8238-1003
              </p>
              <p>
                <strong>{t("static.contactAddress")}:</strong> UIN Sunan
                Kalijaga, Yogyakarta
              </p>
            </div>
          </Card>
          <Card title={t("static.contactCard2Title")}>
            <form className="space-y-4">
              <input
                type="text"
                placeholder={t("static.contactNamePlaceholder")}
                className="w-full p-3 rounded-xl border border-border bg-bg-base focus:ring-2 focus:ring-primary/20 outline-none"
              />
              <input
                type="email"
                placeholder={t("static.contactEmailPlaceholder")}
                className="w-full p-3 rounded-xl border border-border bg-bg-base focus:ring-2 focus:ring-primary/20 outline-none"
              />
              <textarea
                rows="4"
                placeholder={t("static.contactMessagePlaceholder")}
                className="w-full p-3 rounded-xl border border-border bg-bg-base focus:ring-2 focus:ring-primary/20 outline-none"
              ></textarea>
              <button className="bg-primary text-white px-6 py-2 rounded-xl font-bold hover:bg-primary-hover transition-colors">
                {t("static.contactSend")}
              </button>
            </form>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

// --- Privacy Policy ---
export const Privacy = () => {
  const { t } = useTranslation();
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-text-primary mb-6">
          {t("static.privacyTitle")}
        </h1>
        <Card>
          <div className="prose prose-lg dark:prose-invert max-w-none text-text-primary">
            <p>{t("static.privacyDate")}</p>
            <p>{t("static.privacyP1")}</p>
            <h4>{t("static.privacyH1")}</h4>
            <p>{t("static.privacyP2")}</p>
            <h4>{t("static.privacyH1_2")}</h4>
            <p>{t("static.privacyP3")}</p>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
};

export const Terms = () => {
  const { t } = useTranslation();
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-text-primary mb-6">
          {t("static.termsTitle")}
        </h1>
        <Card>
          <div className="prose max-w-none text-text-secondary">
            <p>{t("static.termsP1")}</p>
            <ul>
              <li>{t("static.termsL1")}</li>
              <li>{t("static.termsL2")}</li>
              <li>{t("static.termsL3")}</li>
            </ul>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
};
