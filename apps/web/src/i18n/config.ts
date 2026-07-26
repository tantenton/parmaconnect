/**
 * i18n configuration for ParmaConnect.
 * Primary locale: id-ID (Indonesian)
 * Fallback: en (English)
 */
export const defaultLocale = "id";
export const locales = ["id", "en"] as const;
export type Locale = (typeof locales)[number];

export function isValidLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function getLocaleFromPath(pathname: string): Locale {
  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0];
  if (first && isValidLocale(first)) {
    return first;
  }
  return defaultLocale;
}
