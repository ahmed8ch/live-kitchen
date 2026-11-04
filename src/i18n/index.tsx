import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { SupportedLanguage, TextDirection, LocalizedDish } from './types';
import { MenuItem, ModifierOption } from '../types/domain';
import enDict from './locales/en.json';
import egDict from './locales/eg.json';

const STORAGE_KEY = 'flamelink-lang-v1';

const DICTIONARIES: Record<SupportedLanguage, Record<string, unknown>> = {
  en: enDict as Record<string, unknown>,
  eg: egDict as Record<string, unknown>,
};

let currentGlobalLanguage: SupportedLanguage = 'en';

export function getStoredLanguage(): SupportedLanguage {
  if (typeof window === 'undefined') return 'en';
  try {
    const params = new URLSearchParams(window.location.search);
    const urlLang = params.get('lang');
    if (urlLang === 'eg' || urlLang === 'ar') return 'eg';
    if (urlLang === 'en') return 'en';

    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === 'eg' || saved === 'en') return saved;
  } catch {
    // Fallback to 'en'
  }
  return 'en';
}

export function applyDocumentDirection(lang: SupportedLanguage): void {
  currentGlobalLanguage = lang;
  if (typeof document === 'undefined') return;
  const dir: TextDirection = lang === 'eg' ? 'rtl' : 'ltr';
  const htmlLang = lang === 'eg' ? 'ar-EG' : 'en';
  document.documentElement.setAttribute('dir', dir);
  document.documentElement.setAttribute('lang', htmlLang);
  document.documentElement.setAttribute('data-lang', lang);
}

function resolveKeyPath(dict: Record<string, unknown>, keyPath: string): unknown {
  const segments = keyPath.split('.');
  let current: unknown = dict;
  for (const segment of segments) {
    if (current && typeof current === 'object' && segment in (current as Record<string, unknown>)) {
      current = (current as Record<string, unknown>)[segment];
    } else {
      return undefined;
    }
  }
  return current;
}

export function translate(
  lang: SupportedLanguage,
  key: string,
  params?: Record<string, string | number>
): string {
  const dict = DICTIONARIES[lang] || DICTIONARIES.en;
  let raw = resolveKeyPath(dict, key);
  if (typeof raw !== 'string') {
    raw = resolveKeyPath(DICTIONARIES.en, key);
  }
  if (typeof raw !== 'string') {
    return key;
  }
  if (!params) return raw;
  return raw.replace(/\{\{(\w+)\}\}/g, (_, token: string) => {
    const val = params[token];
    return val !== undefined && val !== null ? String(val) : '';
  });
}

export function tGlobal(key: string, params?: Record<string, string | number>): string {
  return translate(currentGlobalLanguage, key, params);
}

export function getCurrentLanguage(): SupportedLanguage {
  return currentGlobalLanguage;
}

export function localizeDish(dish: MenuItem, lang: SupportedLanguage): MenuItem {
  const dict = DICTIONARIES[lang] as { dishes?: Record<string, LocalizedDish> };
  const localized = dict?.dishes?.[dish.id];
  if (!localized) return dish;

  const localizedModifiers: ModifierOption[] = dish.modifiers.map((mod) => ({
    ...mod,
    name: localized.modifiers?.[mod.id] || mod.name,
  }));

  return {
    ...dish,
    name: localized.name || dish.name,
    description: localized.description || dish.description,
    badge: localized.badge || dish.badge,
    prepTime: localized.prepTime || dish.prepTime,
    modifiers: localizedModifiers,
  };
}

export function localizeModifierName(
  dishId: string,
  modifierOrId: ModifierOption | string,
  lang: SupportedLanguage,
  fallbackName?: string
): string {
  const dict = DICTIONARIES[lang] as { dishes?: Record<string, LocalizedDish> };
  const modId = typeof modifierOrId === 'string' ? modifierOrId : modifierOrId.id;
  const defaultName = typeof modifierOrId === 'string' ? (fallbackName || modifierOrId) : modifierOrId.name;
  const localizedModName = dict?.dishes?.[dishId]?.modifiers?.[modId];
  return localizedModName || defaultName;
}

export function localizeTag(tag: string, lang: SupportedLanguage): string {
  return translate(lang, `menu.tags.${tag}`) !== `menu.tags.${tag}`
    ? translate(lang, `menu.tags.${tag}`)
    : tag;
}

interface I18nContextValue {
  lang: SupportedLanguage;
  dir: TextDirection;
  isRtl: boolean;
  setLang: (next: SupportedLanguage) => void;
  toggleLang: () => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  localizeDish: (dish: MenuItem) => MenuItem;
  localizeModifier: (dishId: string, modifierOrId: ModifierOption | string, fallbackName?: string) => string;
  localizeTag: (tag: string) => string;
  formatCurrency: (amount: number) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<SupportedLanguage>(() => {
    const initial = getStoredLanguage();
    applyDocumentDirection(initial);
    return initial;
  });

  useEffect(() => {
    applyDocumentDirection(lang);
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Ignore storage write errors
    }
  }, [lang]);

  const setLang = useCallback((next: SupportedLanguage) => {
    setLangState(next);
  }, []);

  const toggleLang = useCallback(() => {
    setLangState((prev) => (prev === 'en' ? 'eg' : 'en'));
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => translate(lang, key, params),
    [lang]
  );

  const localizeDishBound = useCallback((dish: MenuItem) => localizeDish(dish, lang), [lang]);
  const localizeModifierBound = useCallback(
    (dishId: string, mod: ModifierOption | string, fallbackName?: string) =>
      localizeModifierName(dishId, mod, lang, fallbackName),
    [lang]
  );
  const localizeTagBound = useCallback((tag: string) => localizeTag(tag, lang), [lang]);

  const formatCurrency = useCallback(
    (amount: number) => {
      const formatted = amount.toFixed(2);
      const unit = translate(lang, 'common.egp');
      return `${formatted} ${unit}`;
    },
    [lang]
  );

  const value = useMemo<I18nContextValue>(
    () => ({
      lang,
      dir: lang === 'eg' ? 'rtl' : 'ltr',
      isRtl: lang === 'eg',
      setLang,
      toggleLang,
      t,
      localizeDish: localizeDishBound,
      localizeModifier: localizeModifierBound,
      localizeTag: localizeTagBound,
      formatCurrency,
    }),
    [
      lang,
      setLang,
      toggleLang,
      t,
      localizeDishBound,
      localizeModifierBound,
      localizeTagBound,
      formatCurrency,
    ]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export function useTranslation(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
}
