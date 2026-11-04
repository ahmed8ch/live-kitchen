export type SupportedLanguage = 'en' | 'eg';
export type TextDirection = 'ltr' | 'rtl';

export interface LocalizedModifier {
  name: string;
}

export interface LocalizedDish {
  name: string;
  description: string;
  badge?: string;
  prepTime: string;
  modifiers?: Record<string, string>;
}
