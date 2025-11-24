import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import App from "./App.jsx";
import "./index.css";
import "./i18n/config";

const RECAPTCHA_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleReCaptchaProvider
      reCaptchaKey={RECAPTCHA_KEY}
      scriptProps={{
        async: false,
        defer: false,
        appendTo: "head",
        nonce: undefined,
      }}
    >
      <App />
    </GoogleReCaptchaProvider>
  </StrictMode>
);
