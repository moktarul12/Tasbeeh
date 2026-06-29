import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translations, LANGUAGES } from './translations';

const LANG_KEY = '@tashbeeh_language';

const I18nContext = createContext({
  lang: 'en',
  setLang: () => {},
  t: (key) => key,
});

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState('en');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(LANG_KEY);
        if (saved && translations[saved]) {
          setLangState(saved);
        }
      } catch {
        // silent
      }
      setLoaded(true);
    })();
  }, []);

  const setLang = useCallback(async (newLang) => {
    setLangState(newLang);
    try {
      await AsyncStorage.setItem(LANG_KEY, newLang);
    } catch {
      // silent
    }
  }, []);

  const t = useCallback(
    (key) => {
      const langTranslations = translations[lang] || translations.en;
      return langTranslations[key] || translations.en[key] || key;
    },
    [lang]
  );

  if (!loaded) {
    return null;
  }

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}

export { LANGUAGES };
