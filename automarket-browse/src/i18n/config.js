import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from '../locales/en.json';
import nlTranslations from '../locales/nl.json';
import frTranslations from '../locales/fr.json';
import itTranslations from '../locales/it.json';
import deTranslations from '../locales/de.json';

// Get language from localStorage or default to 'en'
const getInitialLanguage = () => {
  const savedLanguage = localStorage.getItem('selectedLanguage');
  return savedLanguage || 'en';
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslations
      },
      nl: {
        translation: nlTranslations
      },
      fr: {
        translation: frTranslations
      },
      it: {
        translation: itTranslations
      },
      de: {
        translation: deTranslations
      }
    },
    lng: getInitialLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // React already escapes values
    },
    react: {
      useSuspense: false
    }
  });

// Listen for language changes
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('selectedLanguage', lng);
});

export default i18n;
