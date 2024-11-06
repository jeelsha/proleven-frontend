import { languageConstant } from 'constants/common.constant';
import i18n, { InitOptions, ResourceLanguage } from 'i18next';
import HttpBackend from 'i18next-http-backend';
import resourcesToBackend from 'i18next-resources-to-backend';
import { initReactI18next } from 'react-i18next';

interface ExtendedReactOptions {
  useSuspense?: boolean;
  wait?: boolean;
}

interface TranslationResources extends ResourceLanguage {
  translation: Record<string, string>;
}

interface I18nConfig extends InitOptions {
  resources: Record<string, TranslationResources>;
}

const bundledResources = {
  en: {
    translation: {
      key: 'value',
    },
  },
};

const i18nConfig: I18nConfig = {
  resources: {
    en: { translation: {} },
    it: { translation: {} },
    // Add more languages as needed
  },
  lng: languageConstant.it,
  fallbackLng: languageConstant.it,
  backend: {
    backends: [HttpBackend, resourcesToBackend(bundledResources)],
    backendOptions: [
      {
        loadPath: '/localization/{{lng}}/translation.json',
      },
    ],
  },
  keySeparator: false,
  interpolation: {
    escapeValue: false,
  },

  react: {
    // wait: true,
    useSuspense: true, // or true depending on your preference
  } as ExtendedReactOptions,
};

i18n.use(initReactI18next).use(HttpBackend).init(i18nConfig);

export default i18n;
