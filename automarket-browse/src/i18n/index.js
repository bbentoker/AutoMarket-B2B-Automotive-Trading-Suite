// Export the t function for easy access
import { useTranslation } from 'react-i18next';
import i18n from './config';

export { useTranslation, i18n };
export default i18n;

// Helper function for non-component usage
export const t = (key, options) => {
  return i18n.t(key, options);
};
