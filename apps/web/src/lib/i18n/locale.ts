export const LANGUAGE_OPTIONS = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "zh-CN", name: "Mandarin Chinese", nativeName: "Chinese (Simplified)" },
  { code: "hi", name: "Hindi", nativeName: "Hindi" },
  { code: "es", name: "Spanish", nativeName: "Espanol" },
  { code: "fr", name: "French", nativeName: "Francais" },
  { code: "ar", name: "Arabic", nativeName: "Arabic" },
  { code: "bn", name: "Bengali", nativeName: "Bangla" },
  { code: "pt-BR", name: "Portuguese (Brazil)", nativeName: "Portugues (Brasil)" },
  { code: "ru", name: "Russian", nativeName: "Russian" },
  { code: "ur", name: "Urdu", nativeName: "Urdu" },
] as const;

export type I18nLocale = typeof LANGUAGE_OPTIONS[number]["code"];
export type I18nRegion = "US" | "BR" | "EU" | "LATAM" | "GLOBAL";

export const CURRENCY_OPTIONS = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "EUR" },
  { code: "JPY", name: "Japanese Yen", symbol: "JPY" },
  { code: "GBP", name: "British Pound Sterling", symbol: "GBP" },
  { code: "CNY", name: "Chinese Yuan", symbol: "CNY" },
  { code: "CAD", name: "Canadian Dollar", symbol: "CAD" },
  { code: "AUD", name: "Australian Dollar", symbol: "AUD" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF" },
  { code: "INR", name: "Indian Rupee", symbol: "INR" },
  { code: "BRL", name: "Brazilian Real", symbol: "BRL" },
] as const;

export type I18nFiatCurrency = typeof CURRENCY_OPTIONS[number]["code"];

const LOCALE_CODES = new Set<I18nLocale>(LANGUAGE_OPTIONS.map((item) => item.code));
const FIAT_CODES = new Set<I18nFiatCurrency>(CURRENCY_OPTIONS.map((item) => item.code));

const EU_COUNTRIES = new Set([
  "AT",
  "BE",
  "BG",
  "HR",
  "CY",
  "CZ",
  "DK",
  "EE",
  "FI",
  "FR",
  "DE",
  "GR",
  "HU",
  "IE",
  "IT",
  "LV",
  "LT",
  "LU",
  "MT",
  "NL",
  "PL",
  "PT",
  "RO",
  "SK",
  "SI",
  "ES",
  "SE",
]);

const LATAM_COUNTRIES = new Set([
  "AR",
  "MX",
  "CO",
  "CL",
  "PE",
  "UY",
  "PY",
  "BO",
  "EC",
  "VE",
  "GT",
  "HN",
  "SV",
  "NI",
  "CR",
  "PA",
  "DO",
]);

export function localeFromRegion(region: I18nRegion): I18nLocale {
  if (region === "BR") return "pt-BR";
  if (region === "LATAM") return "es";
  return "en";
}

export function regionFromCountryCode(countryCode: string | null | undefined): I18nRegion {
  const code = (countryCode ?? "").trim().toUpperCase();
  if (!code) return "GLOBAL";
  if (code === "BR") return "BR";
  if (code === "US") return "US";
  if (EU_COUNTRIES.has(code)) return "EU";
  if (LATAM_COUNTRIES.has(code)) return "LATAM";
  return "GLOBAL";
}

export function isLocale(value: string | null | undefined): value is I18nLocale {
  return LOCALE_CODES.has((value ?? "") as I18nLocale);
}

export function isFiatCurrency(value: string | null | undefined): value is I18nFiatCurrency {
  return FIAT_CODES.has((value ?? "") as I18nFiatCurrency);
}

export function isRegion(value: string | null | undefined): value is I18nRegion {
  return value === "US" || value === "BR" || value === "EU" || value === "LATAM" || value === "GLOBAL";
}

export function regionFromGeoCoordinates(latRaw: number | null | undefined, lngRaw: number | null | undefined): I18nRegion {
  if (typeof latRaw !== "number" || typeof lngRaw !== "number") return "GLOBAL";
  const lat = Number.isFinite(latRaw) ? latRaw : null;
  const lng = Number.isFinite(lngRaw) ? lngRaw : null;
  if (lat === null || lng === null) return "GLOBAL";

  if (lat >= -34 && lat <= 6 && lng >= -74 && lng <= -28) return "BR";
  if (lat >= 24 && lat <= 49 && lng >= -125 && lng <= -66) return "US";
  if (lat >= 35 && lat <= 72 && lng >= -10 && lng <= 40) return "EU";
  if (lat >= -56 && lat <= 33 && lng >= -118 && lng <= -34) return "LATAM";
  return "GLOBAL";
}

export function fiatFromRegion(region: I18nRegion): I18nFiatCurrency {
  if (region === "BR") return "BRL";
  if (region === "EU") return "EUR";
  return "USD";
}
