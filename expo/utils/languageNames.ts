import { Language } from '@/constants/translations';

/** Noms de langues pour les instructions aux LLMs */
export const LANGUAGE_NAMES: Record<Language, string> = {
  fr: 'French',
  en: 'English',
  es: 'Spanish',
  ar: 'Arabic',
  pt: 'Portuguese',
  de: 'German',
  ja: 'Japanese',
  zh: 'Chinese',
  ru: 'Russian',
  ko: 'Korean',
  hi: 'Hindi',
  it: 'Italian',
};

/** Locales pour expo-speech (TTS) */
export const SPEECH_LOCALES: Record<Language, string> = {
  fr: 'fr-FR',
  en: 'en-US',
  es: 'es-ES',
  ar: 'ar-SA',
  pt: 'pt-BR',
  de: 'de-DE',
  ja: 'ja-JP',
  zh: 'zh-CN',
  ru: 'ru-RU',
  ko: 'ko-KR',
  hi: 'hi-IN',
  it: 'it-IT',
};
