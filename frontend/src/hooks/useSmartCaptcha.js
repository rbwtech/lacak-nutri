import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { useCallback } from "react";

export const useSmartCaptcha = () => {
  const { executeRecaptcha } = useGoogleReCaptcha();

  const getToken = useCallback(
    async (action) => {
      if (!executeRecaptcha) {
        console.log("Recaptcha not yet loaded");
        return null;
      }
      const token = await executeRecaptcha(action);
      return token;
    },
    [executeRecaptcha]
  );

  return { getToken };
};
